from flask import Blueprint, jsonify
from backend.services.graph_service import get_graph_for_trace
from backend.services.trace_service import get_node

graphs_bp = Blueprint("graphs", __name__)

@graphs_bp.route("/<trace_id>", methods=["GET"])
def fetch_graph(trace_id):
    graph = get_graph_for_trace(trace_id)
    if not graph:
        return jsonify({"error": "Trace not found"}), 404
    return jsonify(graph)

@graphs_bp.route("/nodes/<trace_id>/<node_id>", methods=["GET"])
def fetch_node(trace_id, node_id):
    node = get_node(trace_id, node_id)
    if not node:
        return jsonify({"error": "Node not found"}), 404
    return jsonify(node)