"""Logic agent that performs structured reasoning."""
from __future__ import annotations

from textwrap import dedent

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableSequence

from .base import AgentOutput, PipelineAgent
from ..config import Settings


class LogicAgent(PipelineAgent):
    def __init__(self, llm: RunnableSequence, settings: Settings) -> None:
        super().__init__(name="Logic", role="agent")
        template = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    dedent(
                        """
                        You are an elite problem solver that performs deliberate reasoning.
                        Read the research summary, derive actionable conclusions, and respond in
                        structured JSON with fields `analysis`, `answer`, and `assumptions`.
                        Keep citations referencing search indices when possible.
                        """
                    ).strip(),
                ),
                (
                    "human",
                    "User query: {query}\nResearch summary: {research_summary}",
                ),
            ]
        )
        self._chain: RunnableSequence = template | llm | StrOutputParser()
        self._max_tokens = settings.max_logic_tokens

    def run(self, query: str, research_summary: str) -> AgentOutput:
        response = self._chain.invoke(
            {
                "query": query,
                "research_summary": research_summary,
                "max_tokens": self._max_tokens,
            },
            config={
                "metadata": {"component": "logic_agent"},
                "run_name": "LogicAgent",
            },
        )
        return AgentOutput(
            name=self.name,
            role=self.role,
            content=response,
            metadata={"token_limit": self._max_tokens},
        )


__all__ = ["LogicAgent"]
