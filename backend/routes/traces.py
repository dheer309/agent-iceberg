from flask import Blueprint, request, jsonify
from backend.services.trace_service import save_trace, get_trace

traces_bp = Blueprint("traces", __name__)

@traces_bp.route("/", methods=["POST"])
def upload_trace():
    data = request.json
    trace_id = save_trace(data)
    return jsonify({"status": "ok", "trace_id": trace_id})

@traces_bp.route("/<trace_id>", methods=["GET"])
def fetch_trace(trace_id):
    trace = get_trace(trace_id)
    if not trace:
        return jsonify({"error": "Trace not found"}), 404
    return jsonify(trace)