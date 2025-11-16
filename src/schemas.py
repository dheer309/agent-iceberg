"""Pydantic schemas shared across the multi-agent pipeline."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class PipelineNode(BaseModel):
    id: str = Field(..., description="Unique identifier for the node.")
    label: str = Field(..., description="Human readable name shown in the UI.")
    kind: str = Field(..., description="Node type such as tool, agent, decision, or output.")
    description: str = Field(..., description="What the node does inside the pipeline.")
    inputs: List[str] = Field(
        default_factory=list, description="List of expected inputs or upstream data IDs."
    )
    outputs: List[str] = Field(
        default_factory=list, description="List of outputs or downstream data IDs."
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Arbitrary view data for front-end rendering."
    )


class PipelineEdge(BaseModel):
    source: str = Field(..., description="Source node id.")
    target: str = Field(..., description="Destination node id.")
    label: Optional[str] = Field(
        default=None, description="Optional description of what flows along the edge."
    )
    metadata: Dict[str, Any] = Field(default_factory=dict)


class PipelineGraph(BaseModel):
    query: str = Field(..., description="User request that triggered this pipeline plan.")
    pipeline_agent: str = Field(..., description="Name of the planner agent.")
    rationale: str = Field(..., description="Short reasoning summary for why the nodes were selected.")
    nodes: List[PipelineNode] = Field(..., description="Node definitions for rendering the graph.")
    edges: List[PipelineEdge] = Field(..., description="Connections representing data/control flow.")
    recommended_sequence: List[str] = Field(
        ..., description="Ordered list of node ids representing the execution path."
    )
    tools_used: List[str] = Field(
        default_factory=list,
        description="Identifiers of tools/agents leveraged while designing the pipeline.",
    )
    version: str = Field("1.0", description="Schema version for front-end syncing.")


__all__ = ["PipelineNode", "PipelineEdge", "PipelineGraph"]
