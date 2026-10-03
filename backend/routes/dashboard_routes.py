from flask import Blueprint, request, jsonify
from ..database import get_posts_dataframe
from ..analytics import (
    calculate_kpi_summary,
    get_engagement_over_time,
    get_platform_comparison,
    get_content_type_comparison,
    get_best_posting_times
)
from ..recommendations import generate_recommendations

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    platform = request.args.get("platform")
    content_type = request.args.get("content_type")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    engagement_level = request.args.get("engagement_level")

    try:
        df = get_posts_dataframe(
            platform=platform,
            content_type=content_type,
            start_date=start_date,
            end_date=end_date,
            engagement_level=engagement_level
        )

        kpis = calculate_kpi_summary(df)
        time_series = get_engagement_over_time(df, granularity="daily")
        platforms = get_platform_comparison(df)
        content_types = get_content_type_comparison(df)
        best_times = get_best_posting_times(df)
        recommendations = generate_recommendations(df)

        # Quick summary response for the dashboard overview
        return jsonify({
            "status": "success",
            "kpis": kpis,
            "engagement_over_time": time_series[-30:] if len(time_series) > 30 else time_series,
            "platform_breakdown": platforms,
            "content_type_breakdown": content_types,
            "best_posting_time": {
                "best_day": best_times.get("best_day"),
                "best_time": best_times.get("best_time"),
                "top_slots": best_times.get("top_slots", [])
            },
            "recommendations_summary": recommendations.get("actionable_recommendations", [])[:3],
            "total_records": len(df)
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
