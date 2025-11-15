# Returns graph data that frontend (d3.js) will visualize

def get_graph_for_trace(trace_id):
    # TODO: build graph from trace or DB nodes
    return {
        "nodes": [
            {"id": "obs", "label": "Observe"},
            {"id": "reason", "label": "Reason"},
            {"id": "act", "label": "Act"}
        ],
        "edges": [
            {"source": "obs", "target": "reason"},
            {"source": "reason", "target": "act"}
        ]
    }