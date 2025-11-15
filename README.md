# Holistic Multi-Agent Network

A LangChain/LangSmith-ready pipeline that coordinates Holistic AI-powered agents to research, reason, and validate responses for complex user queries. The network contains:

| Component | Stack | Responsibility |
| --- | --- | --- |
| Pipeline Designer | `create_react_agent` + catalog tool | Chooses agents/tools and outputs a JSON graph for the UI |
| Valyu Search Tool | langchain-valyu integration | Dedicated Valyu search capability returning structured JSON |
| Research Agent | Holistic AI + tool access | Expands search coverage and organizes findings |
| Logic Agent | Holistic AI | Performs deliberate reasoning with structured outputs |
| Validation Agent | Holistic AI + tool access | Fact-checks, critiques, and flags issues |

All LLM calls go through Holistic AI's managed endpoint (set to the model you prefer) and are auto-instrumented for LangSmith tracing when credentials are provided.

## Prerequisites

- Python 3.11+
- Holistic AI team ID, API token, and invoke endpoint URL
- Valyu API key for proprietary + web search (`https://valyu.ai`)
- (Optional) LangSmith account for tracing

Export the required environment variables before running the pipeline:

```bash
# Holistic AI
export HOLISTIC_TEAM_ID=team_the_great_hack_2025_015
export HOLISTIC_API_TOKEN=dcKZApDJJdAW4BmQ-RnXE_6Scf5kyN0QCQIkfa0JVVk
export HOLISTIC_API_ENDPOINT=https://ctwa92wg1b.execute-api.us-east-1.amazonaws.com/prod/invoke
export HOLISTIC_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# Valyu search
export VALYU_API_KEY=vyu-...
export VALYU_SEARCH_TYPE=all
export VALYU_MAX_RESULTS=6
export VALYU_RELEVANCE_THRESHOLD=0.45

# LangSmith (optional)
export LANGSMITH_API_KEY=ls__...
export LANGSMITH_PROJECT=holistic-multi-agent
```

> Tip: create a local `.env` file with the values above and load it via `python-dotenv` or your process manager so that keys never land in version control.

Additional tunables are documented inside `src/config.py` (e.g., `MAX_SEARCH_ROUNDS`, `MAX_LOGIC_TOKENS`).

## Installation

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Running the Pipeline

```bash
python -m src.main "How will quantum networking impact financial data privacy?"
```

The command prints a JSON payload containing a `pipeline_graph` (for UI rendering), the web search traces, each downstream agent's reasoning, and the final validated answer. Use `--indent 4` to control formatting.

## Programmatic Control, Pause/Resume, and Node Operations

Instantiate the orchestrator and drive it step-by-step when you need richer UX (pause, resume, edit, disable nodes):

```python
from src.pipeline import build_pipeline

pipeline = build_pipeline()

# Start a run and capture the planner output
state = pipeline.initialize_state("How to harden a multi-agent network?")

# Execute two stages (e.g., Valyu search + research)
state = pipeline.run_steps(state, steps=2)

# Persist the checkpoint so you can pause in the UI
checkpoint = state.to_dict()  # store in your DB

# --- later, after the user resumes ---
state = PipelineState.from_dict(checkpoint)
state = pipeline.resume(state)       # finish remaining nodes
result = state.build_payload()       # same JSON payload as the CLI
```

### Editing a Node Before Resuming

- **Regenerate**: re-run a node with the existing upstream context.

  ```python
  pipeline.regenerate_node(state, "logic_agent")
  ```

- **Change Input**: let a human override the node input/output payload, then re-run downstream nodes with that injected data.

  ```python
  custom_logic = {"content": "User supplied analysis JSON"}
  pipeline.set_node_input(state, "logic_agent", custom_logic)
  ```

- **Disable/Delete**: remove a node from the pipeline graph + sequence so the orchestrator skips it entirely.

  ```python
  pipeline.disable_node(state, "validation_agent")
  ```

Each operation preserves the previous nodes' outputs, invalidates the downstream stages that depend on the edited node, and updates the `pipeline_graph`'s `recommended_sequence`. The frontend can expose Pause/Resume by simply saving `state.to_dict()` when the user stops and restoring it via `PipelineState.from_dict` + `pipeline.resume(state)` when they continue.

## HTTP Backend Example

For teams that prefer driving the orchestrator over HTTP/WebSockets, the repo now ships a FastAPI backend (`server.py`). It exposes session-based endpoints so the frontend can start, step, pause, edit, and disable nodes remotely.

### Run the API

```bash
uvicorn server:app --reload
```

### Endpoint Walkthrough

1. **Start a session**
   ```bash
   curl -X POST http://localhost:8000/sessions \
        -H "Content-Type: application/json" \
        -d '{"query": "How to harden a multiagent network?"}'
   ```
   Response includes a `session_id`, the planner output, the next node, and the full pipeline graph.

2. **Step through the graph**
   ```bash
   curl -X POST http://localhost:8000/sessions/f178dcc2-0425-4a4e-8b18-7ee0ec594ae1/step \
        -H "Content-Type: application/json" \
        -d '{"steps": 1}'
   ```
   Repeat to stream node-by-node progress. Stop calling this endpoint to “pause”.

3. **Regenerate a node**
   ```bash
   curl -X POST http://localhost:8000/sessions/f178dcc2-0425-4a4e-8b18-7ee0ec594ae1/regenerate \
        -H "Content-Type: application/json" \
        -d '{"node_id": "logic_agent"}'
   ```

4. **Override a node’s input/output**
   ```bash
   curl -X POST http://localhost:8000/sessions/f178dcc2-0425-4a4e-8b18-7ee0ec594ae1/override \
        -H "Content-Type: application/json" \
        -d '{"node_id": "logic_agent", "payload": {"content": "Human-authored reasoning..."}}'
   ```

5. **Disable a node**
   ```bash
   curl -X POST http://localhost:8000/sessions/<session_id>/disable \
        -H "Content-Type: application/json" \
        -d '{"node_id": "validation_agent"}'
   ```

6. **Inspect or persist state**
   ```bash
   curl http://localhost:8000/sessions/<session_id>
   ```
   The response matches `PipelineState.to_dict()`, making it easy to store checkpoints. To resume, deserialize the dict, call `PipelineState.from_dict`, and keep stepping via the `/step` endpoint.

With these APIs, the frontend can pause simply by not calling `/step`, present editable node UIs backed by `/override` or `/regenerate`, and resume by invoking `/step` again when the user is ready.

## Architecture Overview

1. **Pipeline Designer** — A ReAct-style LangChain agent (backed by Holistic AI) inspects the component catalog tool and emits a Pydantic-validated JSON graph (`PipelineGraph`) describing nodes, edges, and execution order.
2. **Valyu Search Tool** — The official `langchain-valyu` client retrieves primary and follow-up search packets (proprietary + web sources) and timestamps every call for traceability.
3. **Research Agent** — A Holistic AI chat model ingests compacted search payloads and extracts 3–5 key findings, citing the relevant sources. It can automatically run extra contextual queries.
4. **Logic Agent** — The SOTA reasoning agent turns the structured research summary into JSON with `analysis`, `answer`, and `assumptions` fields, so downstream systems can consume the output easily.
5. **Validation Agent** — A separate Holistic AI call performs critical review. It reruns a fact-check search, compares it with the proposed solution, and returns a JSON verdict (`pass`/`fail`, `issues`, `next_action`).

All steps use the same Holistic AI chat model object to minimize latency. LangSmith tracing is enabled automatically when `LANGSMITH_API_KEY` is present, providing call graphs, per-agent telemetry, and dataset evaluation hooks.

## Customization

- **Changing models** — Update `HOLISTIC_MODEL_ID` (and endpoint/token/team ID if needed) to whichever Holistic AI offering you plan to call.
- **Search depth** — Modify `MAX_SEARCH_ROUNDS` or `VALYU_MAX_RESULTS` to tune the amount of evidence collected by the Research and Validation agents.

## Pipeline Graph Output

Every run now includes a `pipeline_graph` block plus an entry under `agents.pipeline_designer`. The JSON is validated against `src/schemas.py::PipelineGraph`, so the front-end can render the graph without extra guarding. Nodes expose ids, labels, descriptions, I/O hints, metadata, and the `recommended_sequence` array mirrors the edges for quick execution previews.

## LangSmith Integration

The helper `configure_langsmith` sets `LANGCHAIN_TRACING_V2`, endpoint, and project name when a LangSmith API key exists. That means every invocation of the multi-agent pipeline automatically streams traces and metrics to LangSmith without extra code.

## Project Tree

```
.
├── README.md
├── requirements.txt
└── src
    ├── agents
    │   ├── base.py
    │   ├── logic_agent.py
    │   ├── pipeline_design_agent.py
    │   ├── research_agent.py
    │   └── validation_agent.py
    ├── config.py
    ├── clients
    │   └── holistic_ai.py
    ├── main.py
    ├── pipeline.py
    ├── schemas.py
    └── tools
        ├── component_catalog.py
        └── web_search.py
```

You now have a reusable scaffold for multi-agent experimentation anchored on Holistic AI's managed endpoint.
