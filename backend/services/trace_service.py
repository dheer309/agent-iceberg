from uuid import uuid4

from backend.utils.node_utils import create_node

# In-memory storage
TRACES = {}

def save_trace(data):
    """Save a new trace in memory."""
    trace_id = str(uuid4())
    steps = data.get("steps", ["observe", "reason", "tool_call", "act"])
    nodes = []
    for step in steps:
        node_type = "tool_call" if step.lower() == "tool_call" else "llm_call"
        node = create_node(step, node_type)
        nodes.append(node)
    TRACES[trace_id] = {"trace_id": trace_id, "nodes": nodes}
    print(f"[TRACE SAVED] {trace_id}")
    return trace_id

def get_trace(trace_id):
    """Retrieve a trace from memory."""
    return TRACES.get(trace_id)

def get_node(trace_id, node_id):
    """Retrieve a single node from a trace."""
    trace = get_trace(trace_id)
    if not trace:
        return None
    return next((n for n in trace["nodes"] if n["id"] == node_id), None)