"""Simple FastAPI backend that exposes pipeline control endpoints."""
from __future__ import annotations

import uuid
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from src.pipeline import PipelineState, build_pipeline

app = FastAPI(title="Multi-Agent Pipeline API")
pipeline = build_pipeline()
SESSIONS: Dict[str, PipelineState] = {}


class StartRequest(BaseModel):
    query: str = Field(..., description="User prompt to solve")
    enable_redteam: bool = Field(False, description="Turn on the red-team audit loop")
    redteam_loops: Optional[int] = Field(
        None, ge=1, le=50, description="Override the number of red-team iterations"
    )


class SessionResponse(BaseModel):
    session_id: str
    completed_nodes: Dict[str, Any]
    next_node: Optional[str]
    is_complete: bool
    pipeline_graph: Dict[str, Any]
    redteam_enabled: bool
    redteam_loops: int


class StepRequest(BaseModel):
    steps: int = Field(1, ge=1, le=10)


class NodeRequest(BaseModel):
    node_id: str


class OverrideRequest(NodeRequest):
    payload: Any


def _get_state(session_id: str) -> PipelineState:
    state = SESSIONS.get(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Unknown session")
    return state


def _response(session_id: str, new_data: Dict[str, Any]) -> SessionResponse:
    state = _get_state(session_id)
    return SessionResponse(
        session_id=session_id,
        completed_nodes=new_data,
        next_node=state.pending_stage(),
        is_complete=state.is_complete(),
        pipeline_graph=state.pipeline_graph,
        redteam_enabled=state.redteam_enabled,
        redteam_loops=state.redteam_loops,
    )


@app.post("/sessions", response_model=SessionResponse)
def start_session(payload: StartRequest) -> SessionResponse:
    state = pipeline.initialize_state(
        payload.query,
        enable_redteam=payload.enable_redteam,
        redteam_loops=payload.redteam_loops,
    )
    session_id = str(uuid.uuid4())
    SESSIONS[session_id] = state
    return _response(session_id, {"pipeline_designer": state.agent_outputs["pipeline_designer"]})


@app.post("/sessions/{session_id}/step", response_model=SessionResponse)
def run_steps(session_id: str, request: StepRequest) -> SessionResponse:
    state = _get_state(session_id)
    before = set(state.agent_outputs.keys())
    pipeline.run_steps(state, steps=request.steps)
    after = state.agent_outputs
    new_data = {k: after[k] for k in after if k not in before}
    return _response(session_id, new_data)


@app.post("/sessions/{session_id}/regenerate", response_model=SessionResponse)
def regenerate(session_id: str, request: NodeRequest) -> SessionResponse:
    state = _get_state(session_id)
    pipeline.regenerate_node(state, request.node_id)
    payload = state.agent_outputs.get(request.node_id)
    return _response(session_id, {request.node_id: payload} if payload else {})


@app.post("/sessions/{session_id}/override", response_model=SessionResponse)
def override_node(session_id: str, request: OverrideRequest) -> SessionResponse:
    state = _get_state(session_id)
    pipeline.set_node_input(state, request.node_id, request.payload)
    payload = state.agent_outputs.get(request.node_id)
    return _response(session_id, {request.node_id: payload} if payload else {})


@app.post("/sessions/{session_id}/disable", response_model=SessionResponse)
def disable_node(session_id: str, request: NodeRequest) -> SessionResponse:
    state = _get_state(session_id)
    pipeline.disable_node(state, request.node_id)
    return _response(session_id, {"pipeline_graph": state.pipeline_graph})


@app.get("/sessions/{session_id}")
def get_state(session_id: str) -> Dict[str, Any]:
    state = _get_state(session_id)
    return state.to_dict()


@app.delete("/sessions/{session_id}")
def drop_session(session_id: str) -> Dict[str, str]:
    if session_id in SESSIONS:
        del SESSIONS[session_id]
    return {"status": "deleted"}
