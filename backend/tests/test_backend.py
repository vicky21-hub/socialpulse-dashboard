import unittest
import json
import io
import pandas as pd
import os
import sys

# Ensure backend can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app import create_app
from backend.database import init_db, load_csv_to_db, get_posts_dataframe, DEFAULT_CSV_PATH
from backend.models import validate_csv_data
from backend.analytics import (
    calculate_kpi_summary,
    get_engagement_over_time,
    get_platform_comparison,
    get_content_type_comparison,
    get_best_posting_times,
    get_hashtag_analytics
)
from backend.recommendations import generate_recommendations

class TestSocialMediaDashboard(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()
        load_csv_to_db(DEFAULT_CSV_PATH, overwrite=True)
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def setUp(self):
        self.df = get_posts_dataframe()

    # 1. Test Engagement Rate Calculation
    def test_engagement_rate_formula(self):
        """Test formula: Engagement Rate = (likes + comments + shares) / impressions * 100"""
        likes = 500
        comments = 50
        shares = 50
        impressions = 10000
        # (500 + 50 + 50) / 10000 * 100 = 600 / 100 = 6.0%
        expected_rate = round(((likes + comments + shares) / impressions) * 100, 2)
        self.assertEqual(expected_rate, 6.0)

        # Check in actual dataset
        for _, row in self.df.head(10).iterrows():
            calculated = round(((row["likes"] + row["comments"] + row["shares"]) / row["impressions"]) * 100, 2)
            self.assertAlmostEqual(calculated, row["engagement_rate"], places=1)

    # 2. Test CSV Validation
    def test_csv_validation_valid(self):
        valid_df = pd.DataFrame([{
            "post_id": "TEST_01",
            "platform": "Instagram",
            "post_date": "2025-11-01",
            "post_time": "14:30",
            "content_type": "Reels",
            "caption": "Test caption #test",
            "likes": 120,
            "comments": 20,
            "shares": 10,
            "impressions": 2000,
            "reach": 1800,
            "followers": 15000,
            "engagement_rate": 7.5,
            "hashtags": "#test"
        }])
        is_valid, errors, stats = validate_csv_data(valid_df)
        self.assertTrue(is_valid)
        self.assertEqual(len(errors), 0)
        self.assertEqual(stats["total_rows"], 1)

    def test_csv_validation_missing_columns(self):
        invalid_df = pd.DataFrame([{"post_id": "TEST_02", "platform": "YouTube"}])
        is_valid, errors, stats = validate_csv_data(invalid_df)
        self.assertFalse(is_valid)
        self.assertTrue(any("Missing required columns" in e for e in errors))

    def test_csv_validation_invalid_data(self):
        invalid_df = pd.DataFrame([{
            "post_id": "TEST_03",
            "platform": "UnknownPlatform",
            "post_date": "invalid-date",
            "post_time": "14:30",
            "content_type": "Reels",
            "caption": "Test",
            "likes": -5,
            "comments": 0,
            "shares": 0,
            "impressions": 0,
            "reach": 0,
            "followers": 100,
            "engagement_rate": 0,
            "hashtags": ""
        }])
        is_valid, errors, stats = validate_csv_data(invalid_df)
        self.assertFalse(is_valid)
        self.assertTrue(len(errors) >= 2)

    # 3. Test Analytics Functions
    def test_kpi_summary(self):
        kpis = calculate_kpi_summary(self.df)
        self.assertGreater(kpis["total_posts"], 0)
        self.assertGreater(kpis["total_likes"], 0)
        self.assertGreater(kpis["avg_engagement_rate"], 0.0)
        self.assertIn("aggregate_engagement_rate", kpis)

    def test_engagement_over_time(self):
        series = get_engagement_over_time(self.df, granularity="daily")
        self.assertIsInstance(series, list)
        self.assertGreater(len(series), 0)
        self.assertIn("period", series[0])
        self.assertIn("avg_engagement_rate", series[0])

    def test_platform_comparison(self):
        platforms = get_platform_comparison(self.df)
        self.assertIsInstance(platforms, list)
        names = [p["platform"] for p in platforms]
        self.assertIn("Instagram", names)
        self.assertIn("YouTube", names)

    def test_content_type_comparison(self):
        content_types = get_content_type_comparison(self.df)
        self.assertIsInstance(content_types, list)
        self.assertGreater(len(content_types), 0)

    def test_best_posting_times(self):
        best_times = get_best_posting_times(self.df)
        self.assertIn("best_day", best_times)
        self.assertIn("best_time", best_times)
        self.assertIn("heatmap_matrix", best_times)
        self.assertEqual(len(best_times["heatmap_matrix"]), 7)  # 7 days

    def test_hashtag_analytics(self):
        tags = get_hashtag_analytics(self.df, top_n=5)
        self.assertIsInstance(tags, list)
        self.assertGreater(len(tags), 0)
        self.assertTrue(tags[0]["hashtag"].startswith("#"))

    # 4. Test Recommendation Engine
    def test_recommendation_engine(self):
        recs = generate_recommendations(self.df)
        self.assertIn("best_platform", recs)
        self.assertIn("best_content_type", recs)
        self.assertIn("best_posting_day", recs)
        self.assertIn("best_posting_time", recs)
        self.assertIn("actionable_recommendations", recs)
        self.assertGreater(len(recs["actionable_recommendations"]), 0)

    # 5. Test API Endpoints
    def test_api_health(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "ok")

    def test_api_dashboard(self):
        res = self.client.get("/api/dashboard")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("kpis", data)
        self.assertIn("platform_breakdown", data)

    def test_api_posts_with_pagination(self):
        res = self.client.get("/api/posts?page=1&per_page=5")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(len(data["posts"]), 5)
        self.assertGreater(data["total_count"], 0)

    def test_api_posts_filters(self):
        res = self.client.get("/api/posts?platform=Instagram")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        for p in data["posts"]:
            self.assertEqual(p["platform"], "Instagram")

    def test_api_analytics(self):
        res = self.client.get("/api/analytics?granularity=weekly")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["granularity"], "weekly")

    def test_api_best_posting_time(self):
        res = self.client.get("/api/best-posting-time")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("best_day", data)

    def test_api_recommendations(self):
        res = self.client.get("/api/recommendations")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("best_platform", data["data"])

    def test_api_upload_invalid_file(self):
        data = {"file": (io.BytesIO(b"not a valid csv content"), "test.txt")}
        res = self.client.post("/api/upload", data=data, content_type="multipart/form-data")
        self.assertEqual(res.status_code, 400)

    def test_api_predict(self):
        payload = {
            "platform": "Instagram",
            "content_type": "Reels",
            "hour": 19,
            "day_of_week": 3,
            "caption": "Check out this amazing tutorial #techtrends #coding",
            "hashtags": "#techtrends #coding"
        }
        res = self.client.post("/api/predict", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("predicted_engagement_rate", data)
        self.assertGreater(data["predicted_engagement_rate"], 0.0)

if __name__ == "__main__":
    unittest.main()
