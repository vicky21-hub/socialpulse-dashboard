from flask import Blueprint, request, jsonify
from ..database import get_posts_dataframe
from ..recommendations import generate_recommendations

recommendations_bp = Blueprint("recommendations", __name__)

@recommendations_bp.route("/api/recommendations", methods=["GET"])
def get_recommendations():
    try:
        platform = request.args.get("platform")
        content_type = request.args.get("content_type")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")

        df = get_posts_dataframe(
            platform=platform,
            content_type=content_type,
            start_date=start_date,
            end_date=end_date
        )

        insights = generate_recommendations(df)
        return jsonify({
            "status": "success",
            "data": insights
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
