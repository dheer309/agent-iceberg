"""Builds the holistic multi-agent network with pause/resume controls."""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, Iterable, Optional

from langsmith import traceable
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.runnables import RunnableSequence

from .agents.logic_agent import LogicAgent
from .agents.pipeline_design_agent import PipelineDesignAgent
from .agents.research_agent import ResearchAgent
from .agents.validation_agent import ValidationAgent
from .config import Settings, configure_langsmith, get_settings
from .clients import HolisticAIChatModel
from .tools import ValyuSearchTool, build_component_catalog_tool

EXECUTION_ORDER = [
    "valyu_search",
    "research_agent",
    "logic_agent",
    "validation_agent",
]


@dataclass
class PipelineArtifacts:
    settings: Settings
    llm: RunnableSequence
    search_tool: ValyuSearchTool
    pipeline_designer: PipelineDesignAgent
    research_agent: ResearchAgent
    logic_agent: LogicAgent
    validation_agent: ValidationAgent


@dataclass
class PipelineState:
    query: str
    created_at: str
    pipeline_graph: Dict[str, Any]
    sequence: list[str]
    next_stage_index: int = 0
    agent_outputs: Dict[str, Any] = field(default_factory=dict)
    search_packet: Optional[Dict[str, Any]] = None
    research_content: Optional[str] = None
    research_json: Optional[Dict[str, Any]] = None
    logic_content: Optional[str] = None
    logic_json: Optional[Dict[str, Any]] = None
    validation_content: Optional[str] = None
    validation_json: Optional[Dict[str, Any]] = None
    overrides: Dict[str, Any] = field(default_factory=dict)
    disabled_nodes: list[str] = field(default_factory=list)

    def is_complete(self) -> bool:
        return self.next_stage_index >= len(self.sequence)

    def pending_stage(self) -> Optional[str]:
        if self.is_complete():
            return None
        return self.sequence[self.next_stage_index]

    def advance(self) -> None:
        self.next_stage_index += 1

    def to_dict(self) -> Dict[str, Any]:
        return {
            "query": self.query,
            "created_at": self.created_at,
            "pipeline_graph": self.pipeline_graph,
            "sequence": self.sequence,
            "next_stage_index": self.next_stage_index,
            "agent_outputs": self.agent_outputs,
            "search_packet": self.search_packet,
            "research_content": self.research_content,
            "research_json": self.research_json,
            "logic_content": self.logic_content,
            "logic_json": self.logic_json,
            "validation_content": self.validation_content,
            "validation_json": self.validation_json,
            "overrides": self.overrides,
            "disabled_nodes": self.disabled_nodes,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PipelineState":
        return cls(
            query=data["query"],
            created_at=data["created_at"],
            pipeline_graph=data.get("pipeline_graph", {}),
            sequence=data.get("sequence", []),
            next_stage_index=data.get("next_stage_index", 0),
            agent_outputs=data.get("agent_outputs", {}),
            search_packet=data.get("search_packet"),
            research_content=data.get("research_content"),
            research_json=data.get("research_json"),
            logic_content=data.get("logic_content"),
            logic_json=data.get("logic_json"),
            validation_content=data.get("validation_content"),
            validation_json=data.get("validation_json"),
            overrides=data.get("overrides", {}),
            disabled_nodes=data.get("disabled_nodes", []),
        )

    def build_payload(self) -> Dict[str, Any]:
        final_answer = (
            self.logic_content
            or self.research_content
            or (json.dumps(self.search_packet, indent=2) if self.search_packet else "")
        )
        return {
            "query": self.query,
            "created_at": self.created_at,
            "pipeline_graph": self.pipeline_graph,
            "agents": self.agent_outputs,
            "final_answer": final_answer,
            "validation": self.validation_content,
        }


class MultiAgentPipeline:
    def __init__(self, artifacts: PipelineArtifacts) -> None:
        self._artifacts = artifacts

    @traceable(run_type="chain", name="MultiAgentPipeline.run")
    def run(self, query: str) -> Dict[str, Any]:
        state = self.initialize_state(query)
        state = self.run_until_complete(state)
        return state.build_payload()

    def run_as_json(self, query: str, indent: Optional[int] = None) -> str:
        payload = self.run(query)
        indent = indent if indent is not None else self._artifacts.settings.json_indent
        return json.dumps(payload, indent=indent)

    @traceable(run_type="chain", name="MultiAgentPipeline.stream")
    def stream(self, query: str) -> Iterable[Dict[str, Any]]:
        state = self.initialize_state(query)
        yield {"pipeline_designer": state.agent_outputs["pipeline_designer"]}
        while not state.is_complete():
            stage = state.pending_stage()
            if stage is None:
                break
            self.step(state)
            payload = state.agent_outputs.get(stage)
            if payload is not None:
                yield {stage: payload}
        yield {"final_payload": state.build_payload()}

    def initialize_state(self, query: str) -> PipelineState:
        timestamp = datetime.utcnow().isoformat() + "Z"
        plan = self._artifacts.pipeline_designer.run(query)
        graph_data = plan.metadata.get("graph", {})
        sequence = self._normalized_sequence(graph_data.get("recommended_sequence"))
        state = PipelineState(
            query=query,
            created_at=timestamp,
            pipeline_graph=graph_data,
            sequence=sequence,
            agent_outputs={"pipeline_designer": plan.to_json()},
        )
        self._sync_graph_sequence(state)
        return state

    def run_until_complete(self, state: PipelineState) -> PipelineState:
        while not state.is_complete():
            self.step(state)
        return state

    def run_steps(self, state: PipelineState, steps: int) -> PipelineState:
        executed = 0
        while executed < steps and not state.is_complete():
            self.step(state)
            executed += 1
        return state

    def resume(self, state: PipelineState) -> PipelineState:
        return self.run_until_complete(state)

    def step(self, state: PipelineState) -> PipelineState:
        stage = state.pending_stage()
        if stage is None:
            return state
        self._execute_node(state, stage, use_override=True)
        state.advance()
        return state

    def regenerate_node(self, state: PipelineState, node_id: str) -> PipelineState:
        if node_id not in EXECUTION_ORDER:
            return state
        self._invalidate_downstream(state, node_id)
        self._execute_node(state, node_id, use_override=False)
        return state

    def set_node_input(self, state: PipelineState, node_id: str, user_payload: Any) -> PipelineState:
        state.overrides[node_id] = user_payload
        self._invalidate_downstream(state, node_id)
        self._execute_node(state, node_id, use_override=True)
        return state

    def disable_node(self, state: PipelineState, node_id: str) -> PipelineState:
        if node_id not in EXECUTION_ORDER:
            return state
        if node_id in state.sequence:
            index = state.sequence.index(node_id)
            self._invalidate_downstream(state, node_id)
            state.sequence.pop(index)
            if state.next_stage_index > index:
                state.next_stage_index = index
        if node_id not in state.disabled_nodes:
            state.disabled_nodes.append(node_id)
        self._remove_node_from_graph(state, node_id)
        self._sync_graph_sequence(state)
        return state

    def _execute_node(self, state: PipelineState, node_id: str, use_override: bool) -> None:
        override = state.overrides.get(node_id) if use_override else None
        if node_id == "valyu_search":
            self._execute_valyu_search(state, override)
        elif node_id == "research_agent":
            self._execute_research(state, override)
        elif node_id == "logic_agent":
            self._execute_logic(state, override)
        elif node_id == "validation_agent":
            self._execute_validation(state, override)

    def _execute_valyu_search(self, state: PipelineState, override: Any = None) -> None:
        packet = override if override is not None else self._artifacts.search_tool.run(state.query)
        state.search_packet = packet
        state.agent_outputs["valyu_search"] = packet

    def _execute_research(self, state: PipelineState, override: Any = None) -> None:
        if override is not None:
            payload, content = self._normalize_override("ResearchAgent", override)
        else:
            research = self._artifacts.research_agent.run(
                query=state.query,
                search_data=state.search_packet,
            )
            payload = research.to_json()
            content = research.content
        state.research_content = content
        state.research_json = payload
        state.agent_outputs["research_agent"] = payload

    def _execute_logic(self, state: PipelineState, override: Any = None) -> None:
        if override is not None:
            payload, content = self._normalize_override("LogicAgent", override)
        else:
            logic = self._artifacts.logic_agent.run(
                query=state.query,
                research_summary=state.research_content or "",
            )
            payload = logic.to_json()
            content = logic.content
        state.logic_content = content
        state.logic_json = payload
        state.agent_outputs["logic_agent"] = payload

    def _execute_validation(self, state: PipelineState, override: Any = None) -> None:
        if override is not None:
            payload, content = self._normalize_override("ValidationAgent", override)
        else:
            validation = self._artifacts.validation_agent.run(
                query=state.query,
                proposed_answer=state.logic_content or "",
                research_summary=state.research_content or "",
            )
            payload = validation.to_json()
            content = validation.content
        state.validation_content = content
        state.validation_json = payload
        state.agent_outputs["validation_agent"] = payload

    @staticmethod
    def _normalize_override(node_name: str, override: Any) -> tuple[Dict[str, Any], str]:
        if isinstance(override, dict):
            return override, str(override.get("content", ""))
        content = str(override)
        return {
            "name": node_name,
            "role": "agent",
            "content": content,
            "metadata": {"override": True},
        }, content

    def _invalidate_downstream(self, state: PipelineState, node_id: str) -> None:
        if node_id not in state.sequence:
            return
        index = state.sequence.index(node_id)
        for target in state.sequence[index:]:
            self._clear_node_output(state, target)
        if state.next_stage_index > index:
            state.next_stage_index = index

    def _clear_node_output(self, state: PipelineState, node_id: str) -> None:
        state.agent_outputs.pop(node_id, None)
        if node_id == "valyu_search":
            state.search_packet = None
        elif node_id == "research_agent":
            state.research_content = None
            state.research_json = None
        elif node_id == "logic_agent":
            state.logic_content = None
            state.logic_json = None
        elif node_id == "validation_agent":
            state.validation_content = None
            state.validation_json = None

    def _remove_node_from_graph(self, state: PipelineState, node_id: str) -> None:
        graph = state.pipeline_graph
        nodes = graph.get("nodes") or []
        graph["nodes"] = [node for node in nodes if node.get("id") != node_id]
        edges = graph.get("edges") or []
        graph["edges"] = [
            edge
            for edge in edges
            if edge.get("source") != node_id and edge.get("target") != node_id
        ]

    def _sync_graph_sequence(self, state: PipelineState) -> None:
        state.pipeline_graph["recommended_sequence"] = state.sequence[:]

    @staticmethod
    def _normalized_sequence(sequence: Optional[Any]) -> list[str]:
        if not sequence or not isinstance(sequence, list):
            return EXECUTION_ORDER.copy()
        filtered = [node for node in sequence if node in EXECUTION_ORDER]
        return filtered or EXECUTION_ORDER.copy()


def build_pipeline(settings: Optional[Settings] = None) -> MultiAgentPipeline:
    settings = settings or get_settings()
    configure_langsmith(settings)

    llm = build_holistic_llm(settings)
    search_tool = ValyuSearchTool(settings)
    catalog_tool = build_component_catalog_tool(settings)
    pipeline_designer = PipelineDesignAgent(llm=llm, tools=[catalog_tool])
    research_agent = ResearchAgent(llm=llm, search_tool=search_tool, settings=settings)
    logic_agent = LogicAgent(llm=llm, settings=settings)
    validation_agent = ValidationAgent(llm=llm, search_tool=search_tool, settings=settings)
    artifacts = PipelineArtifacts(
        settings=settings,
        llm=llm,
        search_tool=search_tool,
        pipeline_designer=pipeline_designer,
        research_agent=research_agent,
        logic_agent=logic_agent,
        validation_agent=validation_agent,
    )
    return MultiAgentPipeline(artifacts)


def build_holistic_llm(settings: Settings) -> BaseChatModel:
    return HolisticAIChatModel(settings=settings)


__all__ = ["MultiAgentPipeline", "PipelineState", "build_pipeline"]
