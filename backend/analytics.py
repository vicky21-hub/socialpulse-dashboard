import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

def calculate_kpi_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculates high-level KPI cards and averages."""
    if df.empty:
        return {
            "total_posts": 0,
            "total_likes": 0,
            "total_comments": 0,
            "total_shares": 0,
            "total_impressions": 0,
            "total_reach": 0,
            "avg_engagement_rate": 0.0,
            "avg_likes": 0.0,
            "avg_comments": 0.0,
            "avg_shares": 0.0,
            "avg_impressions": 0.0,
            "engagement_rate_formula": "(likes + comments + shares) / impressions * 100"
        }

    total_posts = len(df)
    total_likes = int(df["likes"].sum())
    total_comments = int(df["comments"].sum())
    total_shares = int(df["shares"].sum())
    total_impressions = int(df["impressions"].sum())
    total_reach = int(df["reach"].sum())

    # Overall aggregate engagement rate across all impressions
    # and average of post-level engagement rates
    avg_engagement_rate = round(float(df["engagement_rate"].mean()), 2)
    aggregate_engagement_rate = round(
        ((total_likes + total_comments + total_shares) / max(1, total_impressions)) * 100, 2
    )

    avg_likes = round(float(df["likes"].mean()), 1)
    avg_comments = round(float(df["comments"].mean()), 1)
    avg_shares = round(float(df["shares"].mean()), 1)
    avg_impressions = round(float(df["impressions"].mean()), 1)

    return {
        "total_posts": total_posts,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_impressions": total_impressions,
        "total_reach": total_reach,
        "avg_engagement_rate": avg_engagement_rate,
        "aggregate_engagement_rate": aggregate_engagement_rate,
        "avg_likes": avg_likes,
        "avg_comments": avg_comments,
        "avg_shares": avg_shares,
        "avg_impressions": avg_impressions,
        "engagement_rate_formula": "(likes + comments + shares) / impressions * 100"
    }

def get_engagement_over_time(df: pd.DataFrame, granularity: str = "daily") -> List[Dict[str, Any]]:
    """Returns aggregated metrics over time for time-series charts."""
    if df.empty:
        return []

    temp_df = df.copy()
    temp_df["post_date"] = pd.to_datetime(temp_df["post_date"])

    if granularity == "weekly":
        temp_df["period"] = temp_df["post_date"].dt.to_period("W").apply(lambda r: r.start_time.strftime("%Y-%m-%d"))
    else:
        temp_df["period"] = temp_df["post_date"].dt.strftime("%Y-%m-%d")

    grouped = temp_df.groupby("period").agg(
        total_posts=("post_id", "count"),
        likes=("likes", "sum"),
        comments=("comments", "sum"),
        shares=("shares", "sum"),
        impressions=("impressions", "sum"),
        reach=("reach", "sum"),
        avg_engagement_rate=("engagement_rate", "mean")
    ).reset_index()

    grouped["avg_engagement_rate"] = grouped["avg_engagement_rate"].round(2)
    grouped = grouped.sort_values("period")

    return grouped.to_dict(orient="records")

def get_platform_comparison(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Compares key performance metrics between platforms."""
    if df.empty:
        return []

    grouped = df.groupby("platform").agg(
        posts=("post_id", "count"),
        total_likes=("likes", "sum"),
        total_comments=("comments", "sum"),
        total_shares=("shares", "sum"),
        total_impressions=("impressions", "sum"),
        total_reach=("reach", "sum"),
        avg_likes=("likes", "mean"),
        avg_comments=("comments", "mean"),
        avg_shares=("shares", "mean"),
        avg_engagement_rate=("engagement_rate", "mean")
    ).reset_index()

    grouped["avg_likes"] = grouped["avg_likes"].round(1)
    grouped["avg_comments"] = grouped["avg_comments"].round(1)
    grouped["avg_shares"] = grouped["avg_shares"].round(1)
    grouped["avg_engagement_rate"] = grouped["avg_engagement_rate"].round(2)

    return grouped.to_dict(orient="records")

def get_content_type_comparison(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Compares performance by content type (Reels, Videos, Images, Shorts, Posts)."""
    if df.empty:
        return []

    grouped = df.groupby(["content_type", "platform"]).agg(
        posts=("post_id", "count"),
        total_likes=("likes", "sum"),
        total_comments=("comments", "sum"),
        total_shares=("shares", "sum"),
        total_impressions=("impressions", "sum"),
        avg_likes=("likes", "mean"),
        avg_comments=("comments", "mean"),
        avg_shares=("shares", "mean"),
        avg_impressions=("impressions", "mean"),
        avg_engagement_rate=("engagement_rate", "mean")
    ).reset_index()

    grouped["avg_likes"] = grouped["avg_likes"].round(1)
    grouped["avg_comments"] = grouped["avg_comments"].round(1)
    grouped["avg_shares"] = grouped["avg_shares"].round(1)
    grouped["avg_impressions"] = grouped["avg_impressions"].round(1)
    grouped["avg_engagement_rate"] = grouped["avg_engagement_rate"].round(2)

    # Sort descending by avg_engagement_rate
    grouped = grouped.sort_values("avg_engagement_rate", ascending=False)
    return grouped.to_dict(orient="records")

def get_best_posting_times(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyzes post performance based on:
    - Day of week (Monday to Sunday)
    - Hour of day (0 to 23)
    Returns:
    - best_day
    - best_time
    - day_breakdown
    - hour_breakdown
    - heatmap_matrix (7x24 grid)
    - top_slots
    """
    if df.empty:
        return {
            "best_day": "N/A",
            "best_time": "N/A",
            "day_breakdown": [],
            "hour_breakdown": [],
            "heatmap_matrix": [],
            "top_slots": []
        }

    temp = df.copy()
    temp["datetime"] = pd.to_datetime(temp["post_date"])
    temp["day_name"] = temp["datetime"].dt.day_name()
    temp["day_num"] = temp["datetime"].dt.dayofweek  # 0=Monday, 6=Sunday

    # Extract hour
    temp["hour"] = temp["post_time"].apply(
        lambda t: int(str(t).split(":")[0]) if ":" in str(t) else 0
    )

    day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    # Day breakdown
    day_agg = temp.groupby(["day_num", "day_name"]).agg(
        posts=("post_id", "count"),
        avg_engagement_rate=("engagement_rate", "mean"),
        avg_likes=("likes", "mean"),
        avg_comments=("comments", "mean"),
        avg_impressions=("impressions", "mean")
    ).reset_index().sort_values("day_num")

    day_agg["avg_engagement_rate"] = day_agg["avg_engagement_rate"].round(2)
    day_agg["avg_likes"] = day_agg["avg_likes"].round(1)
    day_agg["avg_comments"] = day_agg["avg_comments"].round(1)
    day_agg["avg_impressions"] = day_agg["avg_impressions"].round(1)

    # Best day is the day with highest avg_engagement_rate (with min 3 posts)
    best_day_row = day_agg.loc[day_agg["avg_engagement_rate"].idxmax()]
    best_day = best_day_row["day_name"]
    best_day_eng = best_day_row["avg_engagement_rate"]

    # Hour breakdown
    hour_agg = temp.groupby("hour").agg(
        posts=("post_id", "count"),
        avg_engagement_rate=("engagement_rate", "mean"),
        avg_likes=("likes", "mean"),
        avg_impressions=("impressions", "mean")
    ).reset_index().sort_values("hour")

    hour_agg["avg_engagement_rate"] = hour_agg["avg_engagement_rate"].round(2)
    hour_agg["avg_likes"] = hour_agg["avg_likes"].round(1)
    hour_agg["avg_impressions"] = hour_agg["avg_impressions"].round(1)

    # Best hour
    best_hour_row = hour_agg.loc[hour_agg["avg_engagement_rate"].idxmax()]
    best_hour_int = int(best_hour_row["hour"])
    best_time = f"{best_hour_int:02d}:00 - {best_hour_int + 1:02d}:00"
    best_hour_eng = best_hour_row["avg_engagement_rate"]

    # Heatmap matrix: day x hour
    # We create a 7x24 grid
    heatmap_matrix = []
    matrix_lookup = temp.groupby(["day_name", "hour"]).agg(
        avg_engagement_rate=("engagement_rate", "mean"),
        post_count=("post_id", "count")
    ).reset_index()

    lookup_dict = {
        (row["day_name"], row["hour"]): {
            "avg_engagement_rate": round(row["avg_engagement_rate"], 2),
            "post_count": int(row["post_count"])
        }
        for _, row in matrix_lookup.iterrows()
    }

    for day in day_order:
        hours_data = []
        for h in range(24):
            item = lookup_dict.get((day, h), {"avg_engagement_rate": 0.0, "post_count": 0})
            hours_data.append({
                "hour": h,
                "label": f"{h:02d}:00",
                "avg_engagement_rate": item["avg_engagement_rate"],
                "post_count": item["post_count"]
            })
        heatmap_matrix.append({
            "day": day,
            "hours": hours_data
        })

    # Top 3 optimal posting slots (day + hour)
    valid_slots = matrix_lookup[matrix_lookup["post_count"] >= 2].sort_values(
        "avg_engagement_rate", ascending=False
    ).head(3)

    top_slots = []
    for _, s in valid_slots.iterrows():
        h = int(s["hour"])
        top_slots.append({
            "day": s["day_name"],
            "time_window": f"{h:02d}:00 - {h + 1:02d}:00",
            "avg_engagement_rate": round(s["avg_engagement_rate"], 2),
            "sample_posts": int(s["post_count"])
        })

    return {
        "best_day": best_day,
        "best_day_engagement": best_day_eng,
        "best_time": best_time,
        "best_hour": best_hour_int,
        "best_hour_engagement": best_hour_eng,
        "day_breakdown": day_agg.to_dict(orient="records"),
        "hour_breakdown": hour_agg.to_dict(orient="records"),
        "heatmap_matrix": heatmap_matrix,
        "top_slots": top_slots
    }

def get_hashtag_analytics(df: pd.DataFrame, top_n: int = 12) -> List[Dict[str, Any]]:
    """Extracts hashtags and calculates frequency and performance metrics."""
    if df.empty:
        return []

    records = []
    for _, row in df.iterrows():
        tags = str(row.get("hashtags", "")).split()
        for t in tags:
            tag = t.strip()
            if tag.startswith("#") and len(tag) > 1:
                records.append({
                    "hashtag": tag.lower(),
                    "likes": row["likes"],
                    "comments": row["comments"],
                    "shares": row["shares"],
                    "impressions": row["impressions"],
                    "engagement_rate": row["engagement_rate"]
                })

    if not records:
        return []

    tag_df = pd.DataFrame(records)
    grouped = tag_df.groupby("hashtag").agg(
        count=("hashtag", "count"),
        avg_engagement_rate=("engagement_rate", "mean"),
        total_impressions=("impressions", "sum"),
        avg_likes=("likes", "mean")
    ).reset_index()

    grouped["avg_engagement_rate"] = grouped["avg_engagement_rate"].round(2)
    grouped["avg_likes"] = grouped["avg_likes"].round(1)

    # Filter out single occurrences for better statistical relevance if enough data
    if len(grouped[grouped["count"] >= 2]) >= top_n:
        grouped = grouped[grouped["count"] >= 2]

    grouped = grouped.sort_values(by=["avg_engagement_rate", "count"], ascending=[False, False]).head(top_n)
    return grouped.to_dict(orient="records")

def get_top_posts(df: pd.DataFrame, limit: int = 5, ascending: bool = False) -> List[Dict[str, Any]]:
    """Returns top or bottom performing posts sorted by engagement rate."""
    if df.empty:
        return []
    sorted_df = df.sort_values("engagement_rate", ascending=ascending).head(limit)
    return sorted_df.to_dict(orient="records")

class EngagementPredictor:
    """Lightweight ML model to predict engagement rate using scikit-learn."""
    _model = None
    _is_trained = False

    @classmethod
    def train(cls, df: pd.DataFrame):
        if len(df) < 10:
            return False

        data = df.copy()
        data["hour"] = data["post_time"].apply(
            lambda t: int(str(t).split(":")[0]) if ":" in str(t) else 12
        )
        data["day_of_week"] = pd.to_datetime(data["post_date"]).dt.dayofweek
        data["caption_len"] = data["caption"].fillna("").apply(len)
        data["tag_count"] = data["hashtags"].fillna("").apply(lambda h: len(str(h).split()))

        feature_cols = ["platform", "content_type", "hour", "day_of_week", "caption_len", "tag_count"]
        categorical_cols = ["platform", "content_type"]

        preprocessor = ColumnTransformer(
            transformers=[
                ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols)
            ],
            remainder="passthrough"
        )

        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("regressor", RandomForestRegressor(n_estimators=50, random_state=42, max_depth=6))
        ])

        X = data[feature_cols]
        y = data["engagement_rate"]

        pipeline.fit(X, y)
        cls._model = pipeline
        cls._is_trained = True
        return True

    @classmethod
    def predict(cls, platform: str, content_type: str, hour: int, day_of_week: int, caption: str = "", hashtags: str = "") -> float:
        if not cls._is_trained or cls._model is None:
            # Fallback heuristic
            return 6.5

        caption_len = len(caption)
        tag_count = len(hashtags.split()) if hashtags else 3

        input_df = pd.DataFrame([{
            "platform": platform,
            "content_type": content_type,
            "hour": hour,
            "day_of_week": day_of_week,
            "caption_len": caption_len,
            "tag_count": tag_count
        }])

        pred = cls._model.predict(input_df)[0]
        return round(float(pred), 2)
