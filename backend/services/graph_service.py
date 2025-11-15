from backend.services.trace_service import get_trace

def build_graph_from_trace(trace):
    """Convert a trace into nodes + edges for frontend visualization."""
    nodes = [{"id": n["id"], "label": n["action"], "type": n["type"]} for n in trace["nodes"]]
    edges = [{"source": trace["nodes"][i]["id"], "target": trace["nodes"][i+1]["id"]}
             for i in range(len(trace["nodes"])-1)]
    return {"nodes": nodes, "edges": edges}

def get_graph_for_trace(trace_id):
    trace = get_trace(trace_id)
    if not trace:
        return None
    return build_graph_from_trace(trace)