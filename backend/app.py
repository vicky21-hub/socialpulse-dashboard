import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import init_db, load_csv_to_db, DB_PATH, get_connection
from backend.routes.dashboard_routes import dashboard_bp
from backend.routes.posts_routes import posts_bp
from backend.routes.analytics_routes import analytics_bp
from backend.routes.recommendations_routes import recommendations_bp
from backend.routes.upload_routes import upload_bp

def create_app():
    app = Flask(__name__)

    # Allow all origins in development; restrict to your Netlify URL in production
    allowed_origins = os.environ.get(
        "ALLOWED_ORIGINS",
        "*"  # Render will set this via env variable
    )
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    app.register_blueprint(dashboard_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(upload_bp)

    @app.route("/", methods=["GET"])
    def root():
        return jsonify({
            "name": "SocialPulse — Social Media Engagement Dashboard API",
            "version": "1.0.0",
            "status": "healthy",
            "endpoints": [
                "/api/dashboard", "/api/posts", "/api/analytics",
                "/api/platforms", "/api/content-types",
                "/api/best-posting-time", "/api/recommendations",
                "/api/hashtags", "/api/predict",
                "/api/upload", "/api/reset-data", "/api/export"
            ]
        })

    @app.route("/api/health", methods=["GET"])
    def health():
        db_exists = os.path.exists(DB_PATH)
        try:
            conn = get_connection()
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM posts")
            count = cur.fetchone()[0]
            conn.close()
        except Exception:
            count = 0
        return jsonify({
            "status": "ok",
            "database": db_exists,
            "posts_count": count
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"status": "error", "message": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"status": "error", "message": "Internal server error"}), 500

    return app


def _ensure_sample_data():
    """Always called on startup — loads sample data if DB is empty."""
    init_db()
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM posts")
        count = cur.fetchone()[0]
        conn.close()
        if count == 0:
            print("[startup] Database empty — loading 250 sample records...")
            loaded = load_csv_to_db(overwrite=True)
            print(f"[startup] Loaded {loaded} records into database.")
        else:
            print(f"[startup] Database ready with {count} posts.")
    except Exception as e:
        print(f"[startup] DB init warning: {e}")


# Always run on module load (covers gunicorn + direct run)
_ensure_sample_data()
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "development") == "development"
    print(f"Starting SocialPulse API on http://0.0.0.0:{port} ...")
    app.run(host="0.0.0.0", port=port, debug=debug)
