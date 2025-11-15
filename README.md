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
