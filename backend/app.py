import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS

# Add parent directory to path to allow relative imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import init_db, load_csv_to_db, DB_PATH
from backend.routes.dashboard_routes import dashboard_bp
from backend.routes.posts_routes import posts_bp
from backend.routes.analytics_routes import analytics_bp
from backend.routes.recommendations_routes import recommendations_bp
from backend.routes.upload_routes import upload_bp

def create_app():
    app = Flask(__name__)
    
    # Configure CORS for frontend access
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(upload_bp)

    @app.route("/", methods=["GET"])
    def root():
        return jsonify({
            "name": "Social Media Engagement Dashboard API",
            "version": "1.0.0",
            "status": "healthy",
            "endpoints": [
                "/api/dashboard",
                "/api/posts",
                "/api/analytics",
                "/api/platforms",
                "/api/content-types",
                "/api/best-posting-time",
                "/api/recommendations",
                "/api/hashtags",
                "/api/predict",
                "/api/upload",
                "/api/reset-data",
                "/api/export"
            ]
        })

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "database": os.path.exists(DB_PATH)}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"status": "error", "message": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"status": "error", "message": "Internal server error"}), 500

    return app

# Initialize DB on import/start
init_db()
app = create_app()

if __name__ == "__main__":
    # Ensure sample data loaded if database is empty
    from backend.database import get_connection
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM posts")
    count = cur.fetchone()[0]
    conn.close()
    if count == 0:
        print("Database empty. Loading sample data...")
        load_csv_to_db(overwrite=True)

    print("Starting Social Media Engagement Dashboard API on http://127.0.0.1:5000 ...")
    app.run(host="127.0.0.1", port=5000, debug=True)
