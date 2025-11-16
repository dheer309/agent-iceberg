"""Validation agent that critiques outputs."""
from __future__ import annotations

import json
from textwrap import dedent
from typing import Any, Dict

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableSequence

from .base import AgentOutput, PipelineAgent
from ..config import Settings
from ..tools.web_search import ValyuSearchTool


class ValidationAgent(PipelineAgent):
    def __init__(
        self,
        llm: RunnableSequence,
        search_tool: ValyuSearchTool,
        settings: Settings,
    ) -> None:
        super().__init__(name="Validation", role="agent")
        self._llm = llm
        self._search = search_tool
        self._settings = settings
        template = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    dedent(
                        """
                        You are a critical reviewer verifying AI generated answers.
                        Identify factual issues, missing context, and policy risks.
                        Respond as JSON with fields `verdict` (pass|fail), `issues`, `next_action` and `current_response` (which is the best response to human query for now).
                        Use the validation search packet for cross reference.
                        """
                    ).strip(),
                ),
                (
                    "human",
                    "User query: {query}\nProposed answer: {answer}\nResearch summary: {research_summary}\nValidation search: {validation_payload}",
                ),
            ]
        )
        self._chain: RunnableSequence = template | self._llm | StrOutputParser()

    def run(
        self,
        query: str,
        proposed_answer: str,
        research_summary: str,
    ) -> AgentOutput:
        validation_payload = self._search.run(f"fact check: {query}")
        response = self._chain.invoke(
            {
                "query": query,
                "answer": proposed_answer,
                "research_summary": research_summary,
                "validation_payload": json.dumps(validation_payload),
            },
            config={
                "metadata": {"component": "validation_agent"},
                "run_name": "ValidationAgent",
            },
        )
        return AgentOutput(
            name=self.name,
            role=self.role,
            content=response,
            metadata={"validation_search": validation_payload},
        )


__all__ = ["ValidationAgent"]
