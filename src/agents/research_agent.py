"""Research agent responsible for gathering and organizing context."""
from __future__ import annotations

import json
from textwrap import dedent
from typing import Any, Dict, List

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableSequence

from .base import AgentOutput, PipelineAgent
from ..config import Settings
from ..tools.web_search import ValyuSearchTool


class ResearchAgent(PipelineAgent):
    def __init__(
        self,
        llm: RunnableSequence,
        search_tool: ValyuSearchTool,
        settings: Settings,
    ) -> None:
        super().__init__(name="Research", role="agent")
        self._llm = llm
        self._search_tool = search_tool
        self._settings = settings
        template = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    dedent(
                        """
                        You are a synthesizer that expands on search results.
                        Extract 3-5 key findings, connect them, and keep a JSON friendly tone.
                        Cite each finding with the origin index in the provided search payload.
                        """
                    ).strip(),
                ),
                (
                    "human",
                    "User query: {query}\nSearch payload: {search_payload}",
                ),
            ]
        )
        self._chain: RunnableSequence = template | self._llm | StrOutputParser()

    def run(self, query: str, search_data: Dict[str, Any] | None = None) -> AgentOutput:
        packets: List[Dict[str, Any]] = []
        if search_data:
            packets.append(search_data)
        packets.extend(self._expand_search(query))
        merged_payload = {
            "query": query,
            "sources": [packet for packet in packets if packet.get("results")],
        }
        response = self._chain.invoke(
            {"query": query, "search_payload": json.dumps(merged_payload)},
            config={
                "metadata": {"component": "research_agent"},
                "run_name": "ResearchAgent",
            },
        )
        return AgentOutput(
            name=self.name,
            role=self.role,
            content=response,
            metadata={"searches": merged_payload["sources"]},
        )

    def _expand_search(self, query: str) -> List[Dict[str, Any]]:
        batches = []
        attempt_queries = [query]
        if " latest" not in query.lower():
            attempt_queries.append(f"{query} latest developments")
        attempt_queries.append(f"foundational background on {query}")
        for follow_up in attempt_queries[: self._settings.max_search_rounds]:
            batches.append(self._search_tool.run(follow_up))
        return batches


__all__ = ["ResearchAgent"]
