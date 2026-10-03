import sqlite3
import os
import pandas as pd
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "social_media.db")
DEFAULT_CSV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "social_media_data.csv")

def get_connection():
    """Return a connection to the SQLite database with Row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id TEXT UNIQUE NOT NULL,
            platform TEXT NOT NULL,
            post_date TEXT NOT NULL,
            post_time TEXT NOT NULL,
            content_type TEXT NOT NULL,
            caption TEXT,
            likes INTEGER NOT NULL DEFAULT 0,
            comments INTEGER NOT NULL DEFAULT 0,
            shares INTEGER NOT NULL DEFAULT 0,
            impressions INTEGER NOT NULL DEFAULT 0,
            reach INTEGER NOT NULL DEFAULT 0,
            followers INTEGER NOT NULL DEFAULT 0,
            engagement_rate REAL NOT NULL DEFAULT 0.0,
            hashtags TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS upload_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            records_count INTEGER NOT NULL,
            status TEXT NOT NULL,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Indices for fast filtering and analytics queries
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(post_date);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_posts_content_type ON posts(content_type);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_posts_engagement ON posts(engagement_rate);")

    conn.commit()
    conn.close()

def load_csv_to_db(csv_path: str = DEFAULT_CSV_PATH, overwrite: bool = False) -> int:
    """Load records from a CSV file into the SQLite database."""
    init_db()

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found at: {csv_path}")

    df = pd.read_csv(csv_path)

    # Basic cleaning and validation
    required_cols = [
        "post_id", "platform", "post_date", "post_time", "content_type",
        "caption", "likes", "comments", "shares", "impressions",
        "reach", "followers", "engagement_rate", "hashtags"
    ]
    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns in CSV: {', '.join(missing)}")

    # Ensure correct data types
    df["likes"] = pd.to_numeric(df["likes"], errors="coerce").fillna(0).astype(int)
    df["comments"] = pd.to_numeric(df["comments"], errors="coerce").fillna(0).astype(int)
    df["shares"] = pd.to_numeric(df["shares"], errors="coerce").fillna(0).astype(int)
    df["impressions"] = pd.to_numeric(df["impressions"], errors="coerce").fillna(1).astype(int)
    df["reach"] = pd.to_numeric(df["reach"], errors="coerce").fillna(0).astype(int)
    df["followers"] = pd.to_numeric(df["followers"], errors="coerce").fillna(0).astype(int)
    
    # Recalculate engagement rate if missing or zero
    df["engagement_rate"] = df.apply(
        lambda r: round(((r["likes"] + r["comments"] + r["shares"]) / max(1, r["impressions"])) * 100, 2)
        if pd.isna(r["engagement_rate"]) or r["engagement_rate"] == 0
        else round(float(r["engagement_rate"]), 2),
        axis=1
    )
    df["caption"] = df["caption"].fillna("").astype(str)
    df["hashtags"] = df["hashtags"].fillna("").astype(str)

    conn = get_connection()
    cursor = conn.cursor()

    if overwrite:
        cursor.execute("DELETE FROM posts;")

    inserted = 0
    for _, row in df.iterrows():
        try:
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
        except Exception as e:
            print(f"Error inserting row {row['post_id']}: {e}")

    cursor.execute("""
        INSERT INTO upload_logs (filename, records_count, status)
        VALUES (?, ?, ?)
    """, (os.path.basename(csv_path), inserted, "SUCCESS"))

    conn.commit()
    conn.close()
    return inserted

def get_posts_dataframe(
    platform: Optional[str] = None,
    content_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    engagement_level: Optional[str] = None
) -> pd.DataFrame:
    """Fetch posts matching filters and return as a pandas DataFrame."""
    conn = get_connection()
    query = "SELECT * FROM posts WHERE 1=1"
    params = []

    if platform and platform.lower() != "all":
        query += " AND LOWER(platform) = LOWER(?)"
        params.append(platform)

    if content_type and content_type.lower() != "all":
        query += " AND LOWER(content_type) = LOWER(?)"
        params.append(content_type)

    if start_date:
        query += " AND post_date >= ?"
        params.append(start_date)

    if end_date:
        query += " AND post_date <= ?"
        params.append(end_date)

    if engagement_level:
        if engagement_level.lower() == "high":
            query += " AND engagement_rate >= 8.0"
        elif engagement_level.lower() == "medium":
            query += " AND engagement_rate >= 4.0 AND engagement_rate < 8.0"
        elif engagement_level.lower() == "low":
            query += " AND engagement_rate < 4.0"

    df = pd.read_sql_query(query, conn, params=params)
    conn.close()
    return df

if __name__ == "__main__":
    init_db()
    count = load_csv_to_db(overwrite=True)
    print(f"Database initialized and populated with {count} posts.")
