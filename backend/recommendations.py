import pandas as pd
import numpy as np
from typing import Dict, Any, List
from .analytics import get_best_posting_times, get_hashtag_analytics, get_content_type_comparison

def generate_recommendations(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Data-driven recommendation engine.
    Calculates dynamic recommendations purely from the dataset metrics.
    """
    if df.empty:
        return {
            "summary": "No data available to generate recommendations.",
            "metrics": {},
            "recommendations": []
        }

    overall_avg_engagement = round(float(df["engagement_rate"].mean()), 2)
    total_posts = len(df)

    # 1. Best & Worst Platforms
    platform_group = df.groupby("platform").agg(
        avg_eng=("engagement_rate", "mean"),
        posts=("post_id", "count"),
        total_impressions=("impressions", "sum")
    ).reset_index()

    best_platform_row = platform_group.loc[platform_group["avg_eng"].idxmax()]
    best_platform = best_platform_row["platform"]
    best_platform_eng = round(float(best_platform_row["avg_eng"]), 2)
    platform_diff = round(best_platform_eng - overall_avg_engagement, 2)

    # 2. Content Type Analysis (Best & Underperforming)
    type_group = df.groupby("content_type").agg(
        avg_eng=("engagement_rate", "mean"),
        posts=("post_id", "count"),
        total_likes=("likes", "mean"),
        total_shares=("shares", "mean")
    ).reset_index()

    best_type_row = type_group.loc[type_group["avg_eng"].idxmax()]
    best_content_type = best_type_row["content_type"]
    best_content_type_eng = round(float(best_type_row["avg_eng"]), 2)
    type_advantage_pct = round(((best_content_type_eng - overall_avg_engagement) / max(0.1, overall_avg_engagement)) * 100, 1)

    # Underperforming content types (below overall average)
    low_eng_types = type_group[type_group["avg_eng"] < overall_avg_engagement].sort_values("avg_eng")
    low_performing_list = []
    for _, row in low_eng_types.iterrows():
        pct_below = round(((overall_avg_engagement - row["avg_eng"]) / max(0.1, overall_avg_engagement)) * 100, 1)
        low_performing_list.append({
            "content_type": row["content_type"],
            "avg_engagement_rate": round(float(row["avg_eng"]), 2),
            "pct_below_average": pct_below,
            "posts_count": int(row["posts"])
        })

    # 3. Best Posting Time & Day
    posting_times = get_best_posting_times(df)
    best_day = posting_times.get("best_day", "N/A")
    best_day_eng = posting_times.get("best_day_engagement", 0.0)
    best_time = posting_times.get("best_time", "N/A")
    best_hour_eng = posting_times.get("best_hour_engagement", 0.0)
    top_slots = posting_times.get("top_slots", [])

    # 4. Recommended Posting Frequency
    temp_df = df.copy()
    temp_df["post_date"] = pd.to_datetime(temp_df["post_date"])
    date_span_days = max(1, (temp_df["post_date"].max() - temp_df["post_date"].min()).days)
    weeks = max(1.0, date_span_days / 7.0)
    current_freq_per_week = round(total_posts / weeks, 1)

    if current_freq_per_week < 3.0:
        recommended_frequency = "3 - 5 posts per week"
        frequency_note = f"Current cadence is {current_freq_per_week} posts/week. Increasing to 3-5 posts/week will build algorithmic momentum and compound reach."
    elif current_freq_per_week > 10.0:
        recommended_frequency = "5 - 7 high-quality posts per week"
        frequency_note = f"Current cadence is {current_freq_per_week} posts/week. Dialing back slightly to focus on high-production formats ({best_content_type}) can prevent audience fatigue."
    else:
        recommended_frequency = f"{max(4, int(round(current_freq_per_week)))} - {int(round(current_freq_per_week)) + 2} posts per week"
        frequency_note = f"Current frequency of {current_freq_per_week} posts/week is healthy. Maintain consistency during peak engagement windows ({best_day}s around {best_time})."

    # 5. Top Performing Hashtags
    hashtag_data = get_hashtag_analytics(df, top_n=5)
    top_hashtags = [h["hashtag"] for h in hashtag_data]

    # 6. Top Performing Posts
    top_posts_df = df.sort_values("engagement_rate", ascending=False).head(3)
    top_posts = []
    for _, p in top_posts_df.iterrows():
        top_posts.append({
            "post_id": p["post_id"],
            "platform": p["platform"],
            "content_type": p["content_type"],
            "engagement_rate": round(float(p["engagement_rate"]), 2),
            "likes": int(p["likes"]),
            "comments": int(p["comments"]),
            "shares": int(p["shares"]),
            "caption_snippet": (str(p["caption"])[:90] + "...") if len(str(p["caption"])) > 90 else str(p["caption"])
        })

    # 7. Actionable Recommendations List
    actionable_items = [
        {
            "category": "Content Format",
            "priority": "HIGH",
            "title": f"Double down on {best_content_type}",
            "description": f"{best_content_type} delivers the highest engagement rate at {best_content_type_eng}% ({type_advantage_pct}% above your account baseline of {overall_avg_engagement}%). Prioritize this format for key announcements and educational tutorials."
        },
        {
            "category": "Timing & Scheduling",
            "priority": "HIGH",
            "title": f"Schedule prime posts for {best_day}s around {best_time}",
            "description": f"Data indicates engagement peaks on {best_day} (avg {best_day_eng}%) and during the {best_time} window (avg {best_hour_eng}%). Queue high-priority content in these slots."
        },
        {
            "category": "Hashtag Strategy",
            "priority": "MEDIUM",
            "title": f"Incorporate top converting hashtags ({', '.join(top_hashtags[:3]) if top_hashtags else 'n/a'})",
            "description": f"Posts utilizing {', '.join(top_hashtags[:3]) if top_hashtags else 'strategic tags'} demonstrate superior reach-to-engagement conversion. Use 3-5 relevant tags per post."
        }
    ]

    if low_performing_list:
        worst_item = low_performing_list[0]
        actionable_items.append({
            "category": "Content Optimization",
            "priority": "MEDIUM",
            "title": f"Repurpose underperforming {worst_item['content_type']}",
            "description": f"{worst_item['content_type']} averages {worst_item['avg_engagement_rate']}%, which is {worst_item['pct_below_average']}% below your baseline. Consider converting static posts into carousels, short video breakdowns, or pairing them with engaging questions in the caption."
        })

    actionable_items.append({
        "category": "Cadence & Consistency",
        "priority": "LOW",
        "title": f"Target cadence: {recommended_frequency}",
        "description": frequency_note
    })

    return {
        "overall_avg_engagement": overall_avg_engagement,
        "best_platform": {
            "name": best_platform,
            "avg_engagement_rate": best_platform_eng,
            "diff_from_average": platform_diff
        },
        "best_content_type": {
            "name": best_content_type,
            "avg_engagement_rate": best_content_type_eng,
            "advantage_pct": type_advantage_pct
        },
        "best_posting_day": {
            "day": best_day,
            "avg_engagement_rate": best_day_eng
        },
        "best_posting_time": {
            "window": best_time,
            "avg_engagement_rate": best_hour_eng
        },
        "top_slots": top_slots,
        "low_performing_content": low_performing_list,
        "recommended_frequency": {
            "frequency": recommended_frequency,
            "note": frequency_note
        },
        "top_hashtags": hashtag_data,
        "top_posts": top_posts,
        "actionable_recommendations": actionable_items
    }
