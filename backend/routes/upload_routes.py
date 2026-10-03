import io
import os
import pandas as pd
from flask import Blueprint, request, jsonify, Response
from ..models import validate_csv_data
from ..database import (
    load_csv_to_db,
    get_connection,
    get_posts_dataframe,
    DEFAULT_CSV_PATH
)
from ..analytics import calculate_kpi_summary

upload_bp = Blueprint("upload", __name__)

@upload_bp.route("/api/upload", methods=["POST"])
def upload_csv():
    try:
        # Check if file is provided in request.files
        if "file" not in request.files:
            return jsonify({
                "status": "error",
                "message": "No file uploaded. Please upload a CSV file with the key 'file'."
            }), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"status": "error", "message": "No selected file."}), 400

        if not file.filename.lower().endswith(".csv"):
            return jsonify({"status": "error", "message": "Invalid file format. Only CSV files are supported."}), 400

        mode = request.form.get("mode", "replace") # 'replace' or 'append'

        # Read CSV into DataFrame
        try:
            stream = io.StringIO(file.stream.read().decode("utf-8-sig"), newline=None)
            df = pd.read_csv(stream)
        except Exception as read_err:
            return jsonify({
                "status": "error",
                "message": f"Could not parse CSV file: {str(read_err)}"
            }), 400

        # Validate CSV structure and content
        is_valid, errors, stats = validate_csv_data(df)
        if not is_valid:
            return jsonify({
                "status": "validation_failed",
                "message": "CSV validation encountered errors.",
                "errors": errors,
                "stats": stats
            }), 422

        # Normalize and prepare data
        df["likes"] = pd.to_numeric(df["likes"], errors="coerce").fillna(0).astype(int)
        df["comments"] = pd.to_numeric(df["comments"], errors="coerce").fillna(0).astype(int)
        df["shares"] = pd.to_numeric(df["shares"], errors="coerce").fillna(0).astype(int)
        df["impressions"] = pd.to_numeric(df["impressions"], errors="coerce").fillna(1).astype(int)
        df["reach"] = pd.to_numeric(df["reach"], errors="coerce").fillna(0).astype(int)
        df["followers"] = pd.to_numeric(df["followers"], errors="coerce").fillna(0).astype(int)

        # Engagement Rate = (likes + comments + shares) / impressions * 100
        df["engagement_rate"] = df.apply(
            lambda r: round(((r["likes"] + r["comments"] + r["shares"]) / max(1, r["impressions"])) * 100, 2)
            if ("engagement_rate" not in df.columns or pd.isna(r["engagement_rate"]) or r["engagement_rate"] == 0)
            else round(float(r["engagement_rate"]), 2),
            axis=1
        )
        df["caption"] = df["caption"].fillna("").astype(str)
        df["hashtags"] = df["hashtags"].fillna("").astype(str)

        conn = get_connection()
        cursor = conn.cursor()

        if mode == "replace":
            cursor.execute("DELETE FROM posts;")

        inserted = 0
        for _, row in df.iterrows():
            cursor.execute("""
                INSERT OR REPLACE INTO posts (
                    post_id, platform, post_date, post_time, content_type,
                    caption, likes, comments, shares, impressions,
                    reach, followers, engagement_rate, hashtags
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                str(row["post_id"]),
                str(row["platform"]),
                str(row["post_date"]),
                str(row["post_time"]),
                str(row["content_type"]),
                str(row["caption"]),
                int(row["likes"]),
                int(row["comments"]),
                int(row["shares"]),
                int(row["impressions"]),
                int(row["reach"]),
                int(row["followers"]),
                float(row["engagement_rate"]),
                str(row["hashtags"])
            ))
            inserted += 1

        cursor.execute("""
            INSERT INTO upload_logs (filename, records_count, status)
            VALUES (?, ?, ?)
        """, (file.filename, inserted, "SUCCESS"))

        conn.commit()
        conn.close()

        # Recalculate metrics on new dataset
        new_df = get_posts_dataframe()
        updated_kpis = calculate_kpi_summary(new_df)

        preview_rows = df.head(10).to_dict(orient="records")

        return jsonify({
            "status": "success",
            "message": f"Successfully processed {inserted} records in '{mode}' mode.",
            "inserted_records": inserted,
            "preview": preview_rows,
            "updated_kpis": updated_kpis,
            "stats": stats
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@upload_bp.route("/api/reset-data", methods=["POST"])
def reset_to_default_data():
    """Resets database to default sample dataset."""
    try:
        count = load_csv_to_db(DEFAULT_CSV_PATH, overwrite=True)
        df = get_posts_dataframe()
        kpis = calculate_kpi_summary(df)
        return jsonify({
            "status": "success",
            "message": f"Database successfully reset with {count} sample records.",
            "kpis": kpis
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@upload_bp.route("/api/export", methods=["GET"])
def export_csv():
    """Exports current posts (with optional active filters) as downloadable CSV."""
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

        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_data = csv_buffer.getvalue()

        return Response(
            csv_data,
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment;filename=engagement_data_export.csv"}
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
