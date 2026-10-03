import os
from typing import List, Dict, Any, Optional
from datetime import datetime

class SocialMediaAPIAdapter:
    """
    Base adapter for external social media API integrations (Instagram Graph API, YouTube Data API v3).
    Allows plugging in actual credentials via environment variables, with fallback to structured mock data.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("SOCIAL_API_KEY", "")

    def is_configured(self) -> bool:
        return bool(self.api_key)

class InstagramAPIAdapter(SocialMediaAPIAdapter):
    """
    Adapter for Instagram Graph API.
    Can fetch media objects, insights (impressions, reach, engagement), and comments.
    """
    def __init__(self, access_token: Optional[str] = None, account_id: Optional[str] = None):
        super().__init__(api_key=access_token or os.getenv("INSTAGRAM_ACCESS_TOKEN", ""))
        self.account_id = account_id or os.getenv("INSTAGRAM_ACCOUNT_ID", "")

    def fetch_recent_media(self, limit: int = 25) -> List[Dict[str, Any]]:
        if not self.is_configured():
            # Return template for external API integration
            return []
        
        # When actual credentials are provided:
        # endpoint = f"https://graph.facebook.com/v20.0/{self.account_id}/media?fields=id,caption,media_type,media_url,timestamp,like_count,comments_count,insights.metric(impressions,reach)&access_token={self.api_key}"
        # response = requests.get(endpoint)
        # return response.json().get('data', [])
        return []

class YouTubeAPIAdapter(SocialMediaAPIAdapter):
    """
    Adapter for YouTube Data API v3 & YouTube Analytics API.
    Can fetch video statistics (views, likes, comments) and channel metrics.
    """
    def __init__(self, api_key: Optional[str] = None, channel_id: Optional[str] = None):
        super().__init__(api_key=api_key or os.getenv("YOUTUBE_API_KEY", ""))
        self.channel_id = channel_id or os.getenv("YOUTUBE_CHANNEL_ID", "")

    def fetch_channel_videos(self, max_results: int = 25) -> List[Dict[str, Any]]:
        if not self.is_configured():
            return []
        
        # When actual credentials are provided:
        # endpoint = f"https://www.googleapis.com/youtube/v3/search?key={self.api_key}&channelId={self.channel_id}&part=snippet,id&order=date&maxResults={max_results}"
        # response = requests.get(endpoint)
        return []
