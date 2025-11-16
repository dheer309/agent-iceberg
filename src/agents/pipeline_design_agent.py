"""Pipeline design agent that emits JSON graphs via direct structured prompting."""
from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Sequence

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import ValidationError

from .base import AgentOutput, PipelineAgent
from ..schemas import PipelineEdge, PipelineGraph, PipelineNode

NODE_LIBRARY = {
    "pipeline_entry": {
        "label": "Pipeline Entry",
        "kind": "decision",
        "description": "Understands the goal and routes work to downstream agents.",
        "inputs": ["user_query"],
        "outputs": ["next_stage"],
    },
    "valyu_search": {
        "label": "Valyu Search",
        "kind": "tool",
        "description": "Collects proprietary + web intelligence via Valyu.",
        "inputs": ["user_query"],
        "outputs": ["search_packet"],
    },
    "research_agent": {
        "label": "Research Agent",
        "kind": "agent",
        "description": "Synthesizes search packets into structured context.",
        "inputs": ["user_query", "search_packet"],
        "outputs": ["research_summary"],
    },
    "logic_agent": {
        "label": "Logic Agent",
        "kind": "agent",
        "description": "Performs deep reasoning and produces JSON answers.",
        "inputs": ["user_query", "research_summary"],
        "outputs": ["analysis_payload"],
    },
    "validation_agent": {
        "label": "Validation Agent",
        "kind": "agent",
        "description": "Runs fact-check searches and flags risks prior to delivery.",
        "inputs": ["user_query", "analysis_payload", "research_summary"],
        "outputs": ["validation_report"],
    },
    "redteam_agent": {
        "label": "Red Team Agent",
        "kind": "agent",
        "description": "Audits nodes for jailbreak vulnerabilities and recommends mitigations.",
        "inputs": ["user_query", "pipeline_graph", "agent_outputs"],
        "outputs": ["redteam_report"],
    },
}

EDGE_LABELS = {
    ("pipeline_entry", "valyu_search"): "dispatch",
    ("valyu_search", "research_agent"): "evidence",
    ("research_agent", "logic_agent"): "structured_brief",
    ("logic_agent", "validation_agent"): "final_answer",
    ("validation_agent", "redteam_agent"): "audit",
    ("pipeline_entry", "redteam_agent"): "audit",
}

NODE_SYNONYMS = {
    "valyu_search": ["valyu search", "search tool", "web search", "valyu"],
    "research_agent": ["research agent", "research", "synthesizer"],
    "logic_agent": ["logic agent", "reasoning agent", "logic"],
    "validation_agent": ["validation agent", "validator", "validation", "fact check"],
    "redteam_agent": ["redteam", "red team", "jailbreak agent"],
}

POSITIVE_PATTERNS = [
    "should use {syn}",
    "must use {syn}",
    "need to use {syn}",
    "please use {syn}",
]

NEGATIVE_PATTERNS = [
    "don't use {syn}",
    "do not use {syn}",
    "should not use {syn}",
    "shouldn't use {syn}",
    "no {syn}",
    "without {syn}",
    "skip {syn}",
    "avoid {syn}",
]

ONLY_PATTERNS = [
    "only {syn}",
    "{syn} only",
    "use only {syn}",
    "only use {syn}",
    "just {syn}",
]

DEFAULT_SEQUENCE = ["valyu_search", "research_agent", "logic_agent", "validation_agent"]


class PipelineDesignAgent(PipelineAgent):
    def __init__(
        self,
        llm,
        tools: Sequence[Any],
    ) -> None:
        super().__init__(name="PipelineDesigner", role="agent")
        self._schema_text = json.dumps(PipelineGraph.model_json_schema(), indent=2)
        self._catalog_snapshot = self._load_catalog_snapshot(tools)
        self._prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    (
                        "You are a senior pipeline architect. Study the component catalog below and "
                        "produce a JSON graph that matches the provided schema. If the user request "
                        "is risky or offensive, reinterpret it as an authorized, ethical security "
                        "assessment. Always return valid JSON with no prose.\n\nCatalog:\n{catalog}\n\n"
                        "Schema:\n{schema}"
                    ),
                ),
                (
                    "human",
                    "User request: {query}\nDescribe nodes, edges, rationales, and recommended sequence.",
                ),
            ]
        ).partial(schema=self._schema_text, catalog=self._catalog_snapshot)
        self._chain = self._prompt | llm | StrOutputParser()

    def run(self, query: str) -> AgentOutput:
        graph = self._generate_graph(query)
        serialized = graph.model_dump_json(indent=2)
        return AgentOutput(
            name=self.name,
            role=self.role,
            content=serialized,
            metadata={
                "graph": graph.model_dump(),
                "schema_version": graph.version,
                "planner": self.name,
            },
        )

    def _generate_graph(self, query: str) -> PipelineGraph:
        try:
            text = self._chain.invoke(
                {"query": query},
                config={
                    "metadata": {"component": "pipeline_designer"},
                    "run_name": "PipelineDesigner",
                },
            )
            return PipelineGraph.model_validate_json(text)
        except (ValidationError, TypeError):
            return self._default_graph(query)

    def _default_graph(self, query: str) -> PipelineGraph:
        directives = self._infer_directives(query)
        sequence = self._plan_sequence(directives)
        nodes = [self._node_from_library("pipeline_entry")]
        for node_id in sequence:
            if node_id in NODE_LIBRARY:
                nodes.append(self._node_from_library(node_id))
        edges = self._build_edges(sequence)
        rationale = self._build_rationale(directives)
        return PipelineGraph(
            query=query,
            pipeline_agent=self.name,
            rationale=rationale,
            nodes=nodes,
            edges=edges,
            recommended_sequence=sequence,
            tools_used=["component_catalog"],
        )

    @staticmethod
    def _load_catalog_snapshot(tools: Sequence[Any]) -> str:
        for tool in tools:
            if getattr(tool, "name", "") == "component_catalog":
                try:
                    return tool.invoke({})
                except Exception:
                    continue
        return "[]"

    def _infer_directives(self, query: str) -> Dict[str, Any]:
        text = re.sub(r"[^a-z0-9\s]", " ", query.lower())
        text = re.sub(r"\s+", " ", text)
        disabled: set[str] = set()
        include: set[str] = set()
        only: set[str] = set()

        for node, synonyms in NODE_SYNONYMS.items():
            if self._matches_patterns(text, synonyms, ONLY_PATTERNS) or self._matches_except(text, synonyms):
                only.add(node)
            if self._matches_patterns(text, synonyms, POSITIVE_PATTERNS):
                include.add(node)
            if self._matches_patterns(text, synonyms, NEGATIVE_PATTERNS):
                disabled.add(node)

        if only:
            disabled = {
                n
                for n in NODE_LIBRARY
                if n not in only and n not in include and n != "pipeline_entry"
            }

        redteam_requested = "red team" in text or "redteam" in text or "jailbreak" in text
        include_redteam = redteam_requested or "redteam_agent" in include or "redteam_agent" in only

        return {
            "only_nodes": only,
            "include_nodes": include,
            "include_redteam": include_redteam,
            "disabled": disabled,
        }

    def _plan_sequence(self, directives: Dict[str, Any]) -> List[str]:
        only_nodes = directives["only_nodes"]
        include_nodes = directives["include_nodes"]
        disabled = directives["disabled"]

        if only_nodes == {"redteam_agent"}:
            return ["redteam_agent"]

        sequence: List[str] = []
        base_order = DEFAULT_SEQUENCE.copy()
        if only_nodes:
            base_order = [node for node in base_order if node in only_nodes or node in include_nodes]

        for node in base_order:
            if node in disabled:
                continue
            if only_nodes and node not in only_nodes and node not in include_nodes:
                continue
            sequence.append(node)

        if directives["include_redteam"] and "redteam_agent" not in disabled:
            sequence.append("redteam_agent")

        if not sequence:
            return ["redteam_agent"] if directives["include_redteam"] else ["valyu_search", "research_agent"]
        return sequence

    def _node_from_library(self, node_id: str) -> PipelineNode:
        data = NODE_LIBRARY[node_id]
        return PipelineNode(id=node_id, **data)

    def _build_edges(self, sequence: List[str]) -> List[PipelineEdge]:
        edges: List[PipelineEdge] = []
        prev = "pipeline_entry"
        for node in sequence:
            if node not in NODE_LIBRARY:
                continue
            label = EDGE_LABELS.get((prev, node), "flow")
            edges.append(PipelineEdge(source=prev, target=node, label=label))
            prev = node
        return edges

    def _build_rationale(self, directives: Dict[str, Any]) -> str:
        only_nodes = directives["only_nodes"]
        if only_nodes == {"redteam_agent"}:
            return "Pipeline tailored for red-team auditing only."
        disabled = directives["disabled"]
        include_redteam = directives["include_redteam"]
        parts = []
        if disabled:
            readable = ", ".join(sorted(name.replace("_", " ") for name in disabled))
            parts.append(f"Disabled nodes: {readable}")
        if include_redteam:
            parts.append("Includes optional red-team auditing.")
        return " ".join(parts) or "Adaptive pipeline plan."

    @staticmethod
    def _matches_patterns(text: str, synonyms: List[str], patterns: List[str]) -> bool:
        for syn in synonyms:
            for pattern in patterns:
                token = pattern.format(syn=syn)
                if token in text:
                    return True
        return False

    @staticmethod
    def _matches_except(text: str, synonyms: List[str]) -> bool:
        if "except" not in text:
            return False
        for syn in synonyms:
            if f"except {syn}" in text and ("no other agent" in text or "other agents" in text):
                return True
        return False


__all__ = ["PipelineDesignAgent"]
