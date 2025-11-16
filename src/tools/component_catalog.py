"""Tool that exposes available agents and tools to the pipeline designer."""
from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

from ..config import Settings

_COMPONENT_LIBRARY: List[Dict[str, Any]] = [
    {
        "id": "valyu_search",
        "label": "Valyu Search",
        "kind": "tool",
        "capabilities": ["web", "proprietary", "fact-checked"],
        "description": "Retrieves mixed proprietary + web evidence via Valyu.",
        "inputs": ["query"],
        "outputs": ["search_packet"],
    },
    {
        "id": "research_agent",
        "label": "Research Agent",
        "kind": "agent",
        "capabilities": ["summarize", "synthesize", "organize"],
        "description": "Organizes Valyu search packets into a structured brief.",
        "inputs": ["query", "search_packet"],
        "outputs": ["research_summary"],
    },
    {
        "id": "logic_agent",
        "label": "Logic Agent",
        "kind": "agent",
        "capabilities": ["reason", "solve", "json"],
        "description": "Performs deliberate reasoning and produces analysis JSON.",
        "inputs": ["query", "research_summary"],
        "outputs": ["final_answer"],
    },
    {
        "id": "validation_agent",
        "label": "Validation Agent",
        "kind": "agent",
        "capabilities": ["fact-check", "risk", "critique"],
        "description": "Critiques answers, runs fact-check search, and emits verdict JSON.",
        "inputs": ["query", "final_answer", "research_summary"],
        "outputs": ["validation_report"],
    },
]


class CatalogInput(BaseModel):
    component_id: Optional[str] = Field(
        default=None,
        description="Optional component id to retrieve a single node (e.g. logic_agent).",
    )
    capability: Optional[str] = Field(
        default=None,
        description="Optional capability filter (reason, fact-check, json, etc).",
    )


def _fetch_catalog(
    component_id: Optional[str] = None,
    capability: Optional[str] = None,
    *,
    settings: Settings,
) -> str:
    components = list(_COMPONENT_LIBRARY)
    if component_id:
        components = [item for item in components if item["id"] == component_id]
    if capability:
        components = [
            item for item in components if capability in item.get("capabilities", [])
        ]
    payload = {
        "components": components,
        "defaults": {
            "holistic_model": settings.holistic_model_id,
            "holistic_endpoint": settings.holistic_api_endpoint,
            "valyu_search_type": settings.valyu_search_type,
            "max_logic_tokens": settings.max_logic_tokens,
        },
    }
    return json.dumps(payload, indent=2)


def build_component_catalog_tool(settings: Settings) -> StructuredTool:
    """Create a StructuredTool wrapper for the component catalog."""

    def _runner(component_id: Optional[str] = None, capability: Optional[str] = None) -> str:
        return _fetch_catalog(
            component_id=component_id, capability=capability, settings=settings
        )

    return StructuredTool.from_function(
        func=_runner,
        name="component_catalog",
        description=(
            "Use this to inspect available agents/tools before designing the pipeline. "
            "You can optionally filter by `component_id` or `capability`."
        ),
        args_schema=CatalogInput,
    )


__all__ = ["build_component_catalog_tool"]
