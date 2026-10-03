from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any, List, Tuple
import pandas as pd
import re

@dataclass
class Post:
    post_id: str
    platform: str
    post_date: str
    post_time: str
    content_type: str
    caption: str
    likes: int
    comments: int
    shares: int
    impressions: int
    reach: int
    followers: int
    engagement_rate: float
    hashtags: str
    id: Optional[int] = None
    created_at: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

REQUIRED_CSV_COLUMNS = [
    "post_id", "platform", "post_date", "post_time", "content_type",
    "caption", "likes", "comments", "shares", "impressions",
    "reach", "followers", "engagement_rate", "hashtags"
]

NUMERIC_COLUMNS = ["likes", "comments", "shares", "impressions", "reach", "followers"]

def validate_csv_data(df: pd.DataFrame) -> Tuple[bool, List[str], Dict[str, Any]]:
    """
    Validates an uploaded social media CSV dataframe.
    Returns:
        (is_valid: bool, errors: list[str], summary_stats: dict)
    """
    errors = []
    
    # 1. Check required columns
    missing_cols = [c for c in REQUIRED_CSV_COLUMNS if c not in df.columns]
    if missing_cols:
        errors.append(f"Missing required columns: {', '.join(missing_cols)}")
        return False, errors, {}

    # 2. Check for empty dataframe
    if len(df) == 0:
        errors.append("The uploaded CSV contains 0 data rows.")
        return False, errors, {}

    # 3. Check for platform values
    valid_platforms = {"instagram", "youtube"}
    found_platforms = set(df["platform"].dropna().str.strip().str.lower())
    unrecognized = found_platforms - valid_platforms
    if unrecognized:
        errors.append(f"Unrecognized platforms: {', '.join(unrecognized)}. Supported: Instagram, YouTube.")

    # 4. Check date format (YYYY-MM-DD)
    date_sample = df["post_date"].dropna().astype(str).str.strip()
    date_regex = re.compile(r"^\d{4}-\d{2}-\d{2}$")
    invalid_dates = sum(not date_regex.match(d) for d in date_sample)
    if invalid_dates > 0:
        errors.append(f"{invalid_dates} rows have invalid date format. Expected YYYY-MM-DD.")

    # 5. Check numeric types and non-negativity
    for col in NUMERIC_COLUMNS:
        non_numeric = pd.to_numeric(df[col], errors="coerce").isna().sum()
        if non_numeric > 0:
            errors.append(f"Column '{col}' has {non_numeric} non-numeric or missing values.")
        else:
            negative = (df[col] < 0).sum()
            if negative > 0:
                errors.append(f"Column '{col}' has {negative} negative values.")

    # Check impressions > 0
    zero_impressions = (pd.to_numeric(df["impressions"], errors="coerce") <= 0).sum()
    if zero_impressions > 0:
        errors.append(f"{zero_impressions} rows have zero or negative impressions (must be > 0).")

    is_valid = len(errors) == 0

    stats = {
        "total_rows": len(df),
        "platforms": list(df["platform"].unique()) if "platform" in df.columns else [],
        "content_types": list(df["content_type"].unique()) if "content_type" in df.columns else [],
        "date_range": {
            "start": str(df["post_date"].min()) if "post_date" in df.columns else None,
            "end": str(df["post_date"].max()) if "post_date" in df.columns else None,
        }
    }

    return is_valid, errors, stats
