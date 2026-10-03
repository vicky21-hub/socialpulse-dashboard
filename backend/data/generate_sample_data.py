import os
import random
import csv
from datetime import datetime, timedelta

def generate_sample_data(num_records=250, output_path="social_media_data.csv"):
    random.seed(42)  # For reproducible realistic data

    platforms_config = {
        "Instagram": {
            "types": ["Reels", "Images", "Posts"],
            "type_weights": [0.45, 0.30, 0.25],
            "base_followers": 28500,
            "follower_growth": 25,
            "hashtag_pool": [
                "#socialmedia", "#marketingtips", "#contentcreator", "#growthmindset",
                "#digitalmarketing", "#techtrends", "#codinglife", "#webdev",
                "#reactjs", "#developercommunity", "#reelsviral", "#learninpublic",
                "#aitools", "#buildinpublic", "#designinspiration", "#startup"
            ],
            "captions": {
                "Reels": [
                    "5 Developer productivity hacks that saved me 10 hours this week! 🚀 Which one are you trying first?",
                    "How to build a full-stack dashboard in 30 minutes! Step-by-step breakdown 👇 #techtrends",
                    "Stop writing messy CSS! Here's how Tailwind CSS cleans up your code in seconds 💡",
                    "Behind the scenes of deploying a production cloud architecture ☁️ Check the bio link!",
                    "Top 3 Python libraries every data analyst MUST know in 2026 📊 Save this reel!",
                    "React hooks explained simply: useState vs useReducer vs useContext ⚡",
                    "A day in the life of a software engineer working remotely from Lisbon ☕💻",
                    "This secret tool turns CSV files into interactive charts instantly! 📈",
                    "AI coding agents just got 10x better. Here is what you need to know today! 🤖",
                    "How we scaled our database queries to handle 1M+ analytics requests ⚙️"
                ],
                "Images": [
                    "Cheat sheet: Git workflow command hierarchy for teams 🌿 Pin this to your desktop!",
                    "Architecture diagram: Microservices vs Monolith trade-offs in 2026 🏗️",
                    "Workspace setup refresh! Natural light + mechanical keyboard = 100% focus 🎧",
                    "Infographic: Social media engagement benchmarks by industry 📊",
                    "Frontend Roadmap 2026: From HTML/CSS fundamentals to Next.js and WebGL 🗺️",
                    "Clean code checklist before opening any Pull Request ✅ Tag a teammate!",
                    "Database indexing visualized: B-Trees explained simply 📚",
                    "UI/UX Design Tips: Color contrast, typography hierarchy, and spacing 🎨"
                ],
                "Posts": [
                    "Carousel: 7 critical lessons learned from building 12 SaaS products in 12 months 💼",
                    "Swipe to see our full Q3 social growth playbook + exact posting schedules 📅",
                    "Deep-dive: Why your engagement rate dropped and 4 actionable steps to fix it 📉➡️📈",
                    "The ultimate guide to building accessible web applications (WCAG 2.2 compliant) 🌐",
                    "Case study: How we reduced API latency by 68% using smart caching strategies ⚡"
                ]
            }
        },
        "YouTube": {
            "types": ["Videos", "Shorts"],
            "type_weights": [0.40, 0.60],
            "base_followers": 64200,  # YouTube subscribers
            "follower_growth": 50,
            "hashtag_pool": [
                "#shorts", "#youtubeshorts", "#tutorial", "#programming",
                "#softwareengineer", "#datascience", "#fullstack", "#machinelearning",
                "#code", "#techreview", "#aitools", "#pythonproject",
                "#careerintech", "#systemdesign", "#devlife"
            ],
            "captions": {
                "Videos": [
                    "Full Course: Building Modern Full-Stack Web Apps with Python & React (2026 Edition)",
                    "System Design Interview: How to Design YouTube & Instagram at Global Scale",
                    "Why Senior Developers Write LESS Code (Software Architecture Principles)",
                    "Data Analytics with Pandas and SQLite: Real-World Business Intelligence Project",
                    "I Built an AI-Powered Social Media Dashboard from Scratch - Complete Breakdown",
                    "Clean Code vs Quick Code: When Technical Debt Actually Makes Sense",
                    "REST API vs GraphQL vs gRPC: The Definitive Comparison for 2026",
                    "How to Land a Software Engineering Internship: Resume, Projects & Interview Tips"
                ],
                "Shorts": [
                    "Don't make this rookie SQL mistake! ❌ Quick query optimization tip #shorts",
                    "Python one-liner to parse JSON data like a pro 🐍 #programming",
                    "The difference between reach and impressions explained in 20 seconds! ⏱️",
                    "Top VS Code extensions every developer should install right now 🛠️",
                    "How recommendation algorithms decide what shows up on your feed 🧠",
                    "What is API rate limiting and why do platforms enforce it? 🚦",
                    "JavaScript Array methods you should master: map, filter, reduce 💥",
                    "Git stash explained in 15 seconds! Never lose your uncommitted changes again 💾"
                ]
            }
        }
    }

    start_date = datetime(2025, 10, 1)
    posts = []

    for i in range(1, num_records + 1):
        # Platform selection
        platform = "Instagram" if random.random() < 0.58 else "YouTube"
        cfg = platforms_config[platform]
        
        prefix = "IG" if platform == "Instagram" else "YT"
        post_id = f"{prefix}_{1000 + i}"

        # Content type
        content_type = random.choices(cfg["types"], weights=cfg["type_weights"])[0]

        # Date and Time
        days_offset = int((i / num_records) * 150) + random.randint(0, 3)
        current_date = start_date + timedelta(days=days_offset)
        post_date = current_date.strftime("%Y-%m-%d")

        # Certain hours have higher performance (e.g. 9-11 AM, 6-9 PM)
        popular_hours = [9, 10, 11, 14, 17, 18, 19, 20, 21]
        other_hours = [6, 7, 8, 12, 13, 15, 16, 22, 23]
        if random.random() < 0.70:
            hour = random.choice(popular_hours)
        else:
            hour = random.choice(other_hours)
        minute = random.choice([0, 15, 30, 45, 10, 20, 40, 50])
        post_time = f"{hour:02d}:{minute:02d}"

        # Caption
        caption_template = random.choice(cfg["captions"][content_type])
        
        # Hashtags (select 2-5 hashtags)
        num_tags = random.randint(2, 5)
        selected_tags = random.sample(cfg["hashtag_pool"], num_tags)
        hashtags_str = " ".join(selected_tags)
        full_caption = f"{caption_template} {hashtags_str}".strip()

        # Follower growth over time
        followers = cfg["base_followers"] + (i * cfg["follower_growth"]) + random.randint(-200, 200)

        # Baseline performance metrics modulated by content type, time, and day
        # Day of week bonus: Wednesday (2), Thursday (3), Sunday (6)
        day_of_week = current_date.weekday()
        day_multiplier = 1.0
        if day_of_week in [2, 3]:  # Wed, Thu
            day_multiplier = 1.25
        elif day_of_week == 6:     # Sun
            day_multiplier = 1.35
        elif day_of_week in [0, 1]: # Mon, Tue
            day_multiplier = 0.95
        else:                      # Fri, Sat
            day_multiplier = 1.05

        # Hour bonus: 18:00 - 21:00 or 9:00 - 11:00
        time_multiplier = 1.0
        if 18 <= hour <= 21:
            time_multiplier = 1.30
        elif 9 <= hour <= 11:
            time_multiplier = 1.20
        elif hour >= 22 or hour <= 7:
            time_multiplier = 0.75

        # Content type multiplier
        type_multiplier = {
            "Reels": 1.45,
            "Shorts": 1.40,
            "Videos": 1.15,
            "Posts": 1.00,
            "Images": 0.85
        }.get(content_type, 1.0)

        # Hashtag performance boost if high-performing tags are present
        tag_multiplier = 1.0
        high_perf_tags = {"#aitools", "#techtrends", "#reactjs", "#tutorial", "#developercommunity"}
        if any(tag in selected_tags for tag in high_perf_tags):
            tag_multiplier = 1.20

        combined_multiplier = day_multiplier * time_multiplier * type_multiplier * tag_multiplier * random.uniform(0.8, 1.25)

        # Realistic volume metrics
        if platform == "Instagram":
            base_impressions = int(followers * random.uniform(0.35, 0.75) * combined_multiplier)
            impressions = max(500, base_impressions)
            reach = int(impressions * random.uniform(0.72, 0.91))
            
            # Engagement rates typically 3% to 9%
            raw_eng_rate = random.uniform(3.2, 8.5) * (combined_multiplier / 1.1)
            total_engagements = int((raw_eng_rate / 100.0) * impressions)
            
            # Split engagements: likes (~75%), comments (~12%), shares (~13%)
            likes = int(total_engagements * random.uniform(0.70, 0.82))
            comments = int(total_engagements * random.uniform(0.08, 0.16))
            shares = max(0, total_engagements - likes - comments)
        else: # YouTube
            base_impressions = int(followers * random.uniform(0.40, 0.95) * combined_multiplier)
            impressions = max(800, base_impressions)
            reach = int(impressions * random.uniform(0.68, 0.88))

            raw_eng_rate = random.uniform(4.0, 9.8) * (combined_multiplier / 1.1)
            total_engagements = int((raw_eng_rate / 100.0) * impressions)

            # Split: likes (~70%), comments (~18%), shares (~12%)
            likes = int(total_engagements * random.uniform(0.65, 0.78))
            comments = int(total_engagements * random.uniform(0.12, 0.22))
            shares = max(0, total_engagements - likes - comments)

        # Calculate exact engagement rate using standard formula:
        # Engagement Rate = (likes + comments + shares) / impressions * 100
        engagement_rate = round(((likes + comments + shares) / impressions) * 100, 2)

        posts.append({
            "post_id": post_id,
            "platform": platform,
            "post_date": post_date,
            "post_time": post_time,
            "content_type": content_type,
            "caption": full_caption,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "impressions": impressions,
            "reach": reach,
            "followers": followers,
            "engagement_rate": engagement_rate,
            "hashtags": hashtags_str
        })

    # Write CSV
    fieldnames = [
        "post_id", "platform", "post_date", "post_time", "content_type",
        "caption", "likes", "comments", "shares", "impressions",
        "reach", "followers", "engagement_rate", "hashtags"
    ]

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(posts)

    print(f"Generated {len(posts)} records into {output_path}")
    return output_path

if __name__ == "__main__":
    generate_sample_data(num_records=250, output_path="social_media_data.csv")
