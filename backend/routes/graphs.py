from flask import Blueprint, jsonify
from backend.services.graph_service import get_graph_for_trace

graphs_bp = Blueprint("graphs", __name__)

@graphs_bp.route("/<trace_id>", methods=["GET"])
def get_graph(trace_id):
    graph = get_graph_for_trace(trace_id)
    return jsonify(graph)