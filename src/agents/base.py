"""Base classes shared across agents."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, Optional


@dataclass
class AgentOutput:
    name: str
    role: str
    content: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_json(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "role": self.role,
            "content": self.content,
            "metadata": self.metadata,
        }


class PipelineAgent:
    name: str
    role: str

    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role

    def run(self, **kwargs: Any) -> AgentOutput:  # pragma: no cover - abstract
        raise NotImplementedError


__all__ = ["AgentOutput", "PipelineAgent"]
