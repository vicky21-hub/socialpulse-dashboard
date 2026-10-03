from flask import Blueprint, request, jsonify
from ..database import get_posts_dataframe
from ..analytics import (
    calculate_kpi_summary,
    get_engagement_over_time,
    get_platform_comparison,
    get_content_type_comparison,
    get_best_posting_times,
    get_hashtag_analytics,
    get_top_posts,
    EngagementPredictor
)

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/api/analytics", methods=["GET"])
def get_analytics():
    try:
        platform = request.args.get("platform")
        content_type = request.args.get("content_type")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        engagement_level = request.args.get("engagement_level")
        granularity = request.args.get("granularity", "daily")

        df = get_posts_dataframe(
            platform=platform,
            content_type=content_type,
            start_date=start_date,
            end_date=end_date,
            engagement_level=engagement_level
        )

        time_series = get_engagement_over_time(df, granularity=granularity)
        top_posts = get_top_posts(df, limit=5, ascending=False)
        bottom_posts = get_top_posts(df, limit=5, ascending=True)

        return jsonify({
            "status": "success",
            "granularity": granularity,
            "time_series": time_series,
            "top_posts": top_posts,
            "bottom_posts": bottom_posts,
            "total_records": len(df)
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@analytics_bp.route("/api/platforms", methods=["GET"])
def get_platforms():
    try:
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        content_type = request.args.get("content_type")

        df = get_posts_dataframe(
            content_type=content_type,
            start_date=start_date,
            end_date=end_date
        )

        comparison = get_platform_comparison(df)
        return jsonify({
            "status": "success",
            "platforms": comparison
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@analytics_bp.route("/api/content-types", methods=["GET"])
def get_content_types():
    try:
        platform = request.args.get("platform")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")

        df = get_posts_dataframe(
            platform=platform,
            start_date=start_date,
            end_date=end_date
        )

        content_types = get_content_type_comparison(df)
        return jsonify({
            "status": "success",
            "content_types": content_types
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@analytics_bp.route("/api/best-posting-time", methods=["GET"])
def get_best_posting_time():
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

        best_times = get_best_posting_times(df)
        return jsonify({
            "status": "success",
            **best_times
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@analytics_bp.route("/api/hashtags", methods=["GET"])
def get_hashtags():
    try:
        platform = request.args.get("platform")
        df = get_posts_dataframe(platform=platform)
        hashtags = get_hashtag_analytics(df, top_n=15)
        return jsonify({
            "status": "success",
            "hashtags": hashtags
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@analytics_bp.route("/api/predict", methods=["POST"])
def predict_engagement():
    try:
        data = request.get_json() or {}
        platform = data.get("platform", "Instagram")
        content_type = data.get("content_type", "Reels")
        hour = int(data.get("hour", 18))
        day_of_week = int(data.get("day_of_week", 3)) # 0=Monday, 6=Sunday
        caption = data.get("caption", "")
        hashtags = data.get("hashtags", "")

        df = get_posts_dataframe()
        if not EngagementPredictor._is_trained:
            EngagementPredictor.train(df)

        predicted_rate = EngagementPredictor.predict(
            platform=platform,
            content_type=content_type,
            hour=hour,
            day_of_week=day_of_week,
            caption=caption,
            hashtags=hashtags
        )

        avg_baseline = round(float(df["engagement_rate"].mean()), 2)
        performance_tier = "High" if predicted_rate >= 8.0 else ("Medium" if predicted_rate >= 5.0 else "Average")

        return jsonify({
            "status": "success",
            "predicted_engagement_rate": predicted_rate,
            "account_baseline_rate": avg_baseline,
            "performance_tier": performance_tier,
            "diff_from_baseline": round(predicted_rate - avg_baseline, 2),
            "recommendation": (
                "Excellent combination! This post profile exhibits strong predictive engagement signals."
                if predicted_rate >= avg_baseline
                else "Consider shifting to a peak hour (18:00 - 21:00) or high-yield format like Reels/Shorts."
            )
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
