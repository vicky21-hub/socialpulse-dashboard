from flask import Blueprint, request, jsonify
from ..database import get_posts_dataframe, get_connection
import pandas as pd

posts_bp = Blueprint("posts", __name__)

@posts_bp.route("/api/posts", methods=["GET"])
def get_posts():
    try:
        platform = request.args.get("platform")
        content_type = request.args.get("content_type")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        engagement_level = request.args.get("engagement_level")
        search = request.args.get("search", "").strip()
        sort_by = request.args.get("sort_by", "post_date")
        sort_order = request.args.get("sort_order", "desc")
        page = max(1, int(request.args.get("page", 1)))
        per_page = max(1, min(100, int(request.args.get("per_page", 10))))

        df = get_posts_dataframe(
            platform=platform,
            content_type=content_type,
            start_date=start_date,
            end_date=end_date,
            engagement_level=engagement_level
        )

        if search:
            search_lower = search.lower()
            mask = (
                df["caption"].astype(str).str.lower().str.contains(search_lower, regex=False) |
                df["hashtags"].astype(str).str.lower().str.contains(search_lower, regex=False) |
                df["post_id"].astype(str).str.lower().str.contains(search_lower, regex=False)
            )
            df = df[mask]

        # Valid sort columns
        valid_sort_cols = {
            "post_date", "post_id", "platform", "content_type",
            "likes", "comments", "shares", "impressions", "reach",
            "followers", "engagement_rate"
        }
        if sort_by not in valid_sort_cols:
            sort_by = "post_date"

        ascending = (sort_order.lower() == "asc")
        df = df.sort_values(by=sort_by, ascending=ascending)

        total_count = len(df)
        total_pages = max(1, (total_count + per_page - 1) // per_page)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paged_df = df.iloc[start_idx:end_idx]

        posts_list = paged_df.to_dict(orient="records")

        return jsonify({
            "status": "success",
            "posts": posts_list,
            "total_count": total_count,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@posts_bp.route("/api/posts/<post_id>", methods=["GET"])
def get_post_detail(post_id: str):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM posts WHERE post_id = ?", (post_id,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return jsonify({"status": "error", "message": "Post not found"}), 404

        post = dict(row)
        return jsonify({"status": "success", "post": post}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
