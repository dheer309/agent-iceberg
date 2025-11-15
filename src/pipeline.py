"""Builds the holistic multi-agent network."""
from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, Optional, Iterable

# --- IMPORT TRACEABLE FOR LANGSMITH ---
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


@dataclass
class PipelineArtifacts:
    # ... (no change to this class) ...
    settings: Settings
    llm: RunnableSequence
    search_tool: ValyuSearchTool
    pipeline_designer: PipelineDesignAgent
    research_agent: ResearchAgent
    logic_agent: LogicAgent
    validation_agent: ValidationAgent


class MultiAgentPipeline:
    def __init__(self, artifacts: PipelineArtifacts) -> None:
        self._artifacts = artifacts

    # We add @traceable to make the *entire run* show up in LangSmith
    @traceable(run_type="chain", name="MultiAgentPipeline.run")
    def run(self, query: str) -> Dict[str, Any]:
        """
        This is your original, blocking method. We keep it.
        We just add the @traceable decorator.
        """
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        # --- These sub-runs will be traced IF they are also wrapped ---
        # --- We assume the .run() methods of your agents are traceable ---
        plan = self._artifacts.pipeline_designer.run(query)
        graph_data = plan.metadata.get("graph", {})
        sequence = self._normalized_sequence(graph_data.get("recommended_sequence"))

        search_packet = None
        research = None
        logic = None
        validation = None
        agents_payload: Dict[str, Any] = {"pipeline_designer": plan.to_json()}

        if "valyu_search" in sequence:
            search_packet = self._artifacts.search_tool.run(query)
            agents_payload["valyu_search"] = search_packet

        if "research_agent" in sequence:
            if search_packet is None:
                search_packet = self._artifacts.search_tool.run(query)
                agents_payload["valyu_search"] = search_packet
            research = self._artifacts.research_agent.run(
                query=query, search_data=search_packet
            )
            agents_payload["research"] = research.to_json()

        if "logic_agent" in sequence and research:
            logic = self._artifacts.logic_agent.run(
                query=query,
                research_summary=research.content,
            )
            agents_payload["logic"] = logic.to_json()

        if "validation_agent" in sequence and logic and research:
            validation = self._artifacts.validation_agent.run(
                query=query,
                proposed_answer=logic.content,
                research_summary=research.content,
            )
            agents_payload["validation"] = validation.to_json()

        final_answer = (
            logic.content
            if logic
            else research.content
            if research
            else json.dumps(search_packet, indent=2) if search_packet else ""
        )
        payload = {
            "query": query,
            "created_at": timestamp,
            "pipeline_graph": graph_data,
            "agents": agents_payload,
            "final_answer": final_answer,
            "validation": validation.content if validation else None,
        }
        return payload

    # --- THIS IS YOUR NEW STREAMING METHOD ---
    @traceable(run_type="chain", name="MultiAgentPipeline.stream")
    def stream(self, query: str) -> Iterable[Dict[str, Any]]:
        """
        A new, real-time generator method.
        It runs the same logic as run() but yields each step's
        result as soon as it's finished.
        """
        timestamp = datetime.utcnow().isoformat() + "Z"

        # Step 1: Run Planner
        plan = self._artifacts.pipeline_designer.run(query)
        plan_json = plan.to_json()
        yield {"pipeline_designer": plan_json}

        graph_data = plan.metadata.get("graph", {})
        sequence = self._normalized_sequence(graph_data.get("recommended_sequence"))

        search_packet = None
        research = None
        logic = None
        validation = None
        
        # Step 2: Run Search (if needed)
        if "valyu_search" in sequence:
            search_packet = self._artifacts.search_tool.run(query)
            yield {"valyu_search": search_packet}

        # Step 3: Run Research (if needed)
        if "research_agent" in sequence:
            if search_packet is None:
                search_packet = self._artifacts.search_tool.run(query)
                yield {"valyu_search": search_packet}
            
            research = self._artifacts.research_agent.run(
                query=query, search_data=search_packet
            )
            yield {"research_agent": research.to_json()}

        # Step 4: Run Logic (if needed)
        if "logic_agent" in sequence and research:
            logic = self._artifacts.logic_agent.run(
                query=query,
                research_summary=research.content,
            )
            yield {"logic_agent": logic.to_json()}

        # Step 5: Run Validation (if needed)
        if "validation_agent" in sequence and logic and research:
            validation = self._artifacts.validation_agent.run(
                query=query,
                proposed_answer=logic.content,
                research_summary=research.content,
            )
            yield {"validation_agent": validation.to_json()}

        # Step 6: Yield the final, complete payload
        final_answer = (
            logic.content
            if logic
            else research.content
            if research
            else json.dumps(search_packet, indent=2) if search_packet else ""
        )
        payload = {
            "query": query,
            "created_at": timestamp,
            "pipeline_graph": graph_data,
            # Note: We can't build the full 'agents_payload' in a stream
            # This final payload is a summary.
            "final_answer": final_answer,
            "validation": validation.content if validation else None,
        }
        yield {"final_payload": payload}

    def run_as_json(self, query: str, indent: Optional[int] = None) -> str:
        # ... (no change to this method) ...
        indent = indent if indent is not None else self._artifacts.settings.json_indent
        return json.dumps(self.run(query), indent=indent)

    @staticmethod
    def _normalized_sequence(sequence: Optional[Any]) -> list[str]:
        # ... (no change to this method) ...
        default_sequence = [
            "valyu_search",
            "research_agent",
            "logic_agent",
            "validation_agent",
        ]
        if not sequence or not isinstance(sequence, list):
            return default_sequence
        filtered = [node for node in sequence if node in default_sequence]
        return filtered or default_sequence


def build_pipeline(settings: Optional[Settings] = None) -> MultiAgentPipeline:
    # ... (no change to this function) ...
    settings = settings or get_settings()
    configure_langsmith(settings)

    llm = build_holistic_llm(settings)
    search_tool = ValyuSearchTool(settings)
    catalog_tool = build_component_catalog_tool(settings)
    pipeline_designer = PipelineDesignAgent(
        llm=llm,
        tools=[catalog_tool],
    )
    research_agent = ResearchAgent(llm=llm, search_tool=search_tool, settings=settings)
    logic_agent = LogicAgent(llm=llm, settings=settings)
    validation_agent = ValidationAgent(
        llm=llm, search_tool=search_tool, settings=settings
    )
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
    # ... (no change to this function) ...
    return HolisticAIChatModel(settings=settings)


__all__ = ["MultiAgentPipeline", "build_pipeline"]