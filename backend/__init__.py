from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    # -------- Register Blueprints --------
    from backend.routes.traces import traces_bp
    from backend.routes.graphs import graphs_bp

    app.register_blueprint(traces_bp, url_prefix="/api/traces")
    app.register_blueprint(graphs_bp, url_prefix="/api/graphs")

    return app