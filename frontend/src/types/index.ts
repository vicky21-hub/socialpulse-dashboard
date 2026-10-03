export interface Post {
  id?: number;
  post_id: string;
  platform: 'Instagram' | 'YouTube' | string;
  post_date: string;
  post_time: string;
  content_type: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  reach: number;
  followers: number;
  engagement_rate: number;
  hashtags: string;
  created_at?: string;
}

export interface KPISummary {
  total_posts: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_impressions: number;
  total_reach: number;
  avg_engagement_rate: number;
  aggregate_engagement_rate: number;
  avg_likes: number;
  avg_comments: number;
  avg_shares: number;
  avg_impressions: number;
  engagement_rate_formula: string;
}

export interface TimeSeriesPoint {
  period: string;
  total_posts: number;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  reach: number;
  avg_engagement_rate: number;
}

export interface PlatformStat {
  platform: string;
  posts: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_impressions: number;
  total_reach: number;
  avg_likes: number;
  avg_comments: number;
  avg_shares: number;
  avg_engagement_rate: number;
}

export interface ContentTypeStat {
  content_type: string;
  platform: string;
  posts: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_impressions: number;
  avg_likes: number;
  avg_comments: number;
  avg_shares: number;
  avg_impressions: number;
  avg_engagement_rate: number;
}

export interface HeatmapHourSlot {
  hour: number;
  label: string;
  avg_engagement_rate: number;
  post_count: number;
}

export interface HeatmapDayRow {
  day: string;
  hours: HeatmapHourSlot[];
}

export interface OptimalSlot {
  day: string;
  time_window: string;
  avg_engagement_rate: number;
  sample_posts: number;
}

export interface BestPostingTimeResponse {
  status: string;
  best_day: string;
  best_day_engagement: number;
  best_time: string;
  best_hour: number;
  best_hour_engagement: number;
  day_breakdown: Array<{
    day_num: number;
    day_name: string;
    posts: number;
    avg_engagement_rate: number;
    avg_likes: number;
    avg_comments: number;
    avg_impressions: number;
  }>;
  hour_breakdown: Array<{
    hour: number;
    posts: number;
    avg_engagement_rate: number;
    avg_likes: number;
    avg_impressions: number;
  }>;
  heatmap_matrix: HeatmapDayRow[];
  top_slots: OptimalSlot[];
}

export interface ActionableRecommendation {
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
}

export interface RecommendationData {
  overall_avg_engagement: number;
  best_platform: {
    name: string;
    avg_engagement_rate: number;
    diff_from_average: number;
  };
  best_content_type: {
    name: string;
    avg_engagement_rate: number;
    advantage_pct: number;
  };
  best_posting_day: {
    day: string;
    avg_engagement_rate: number;
  };
  best_posting_time: {
    window: string;
    avg_engagement_rate: number;
  };
  top_slots: OptimalSlot[];
  low_performing_content: Array<{
    content_type: string;
    avg_engagement_rate: number;
    pct_below_average: number;
    posts_count: number;
  }>;
  recommended_frequency: {
    frequency: string;
    note: string;
  };
  top_hashtags: Array<{
    hashtag: string;
    count: number;
    avg_engagement_rate: number;
    total_impressions: number;
    avg_likes: number;
  }>;
  top_posts: Array<{
    post_id: string;
    platform: string;
    content_type: string;
    engagement_rate: number;
    likes: number;
    comments: number;
    shares: number;
    caption_snippet: string;
  }>;
  actionable_recommendations: ActionableRecommendation[];
}

export interface FilterState {
  platform: string;
  contentType: string;
  startDate: string;
  endDate: string;
  engagementLevel: string;
  search: string;
}

export interface DashboardResponse {
  status: string;
  kpis: KPISummary;
  engagement_over_time: TimeSeriesPoint[];
  platform_breakdown: PlatformStat[];
  content_type_breakdown: ContentTypeStat[];
  best_posting_time: {
    best_day: string;
    best_time: string;
    top_slots: OptimalSlot[];
  };
  recommendations_summary: ActionableRecommendation[];
  total_records: number;
}

export interface PostsResponse {
  status: string;
  posts: Post[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Runtime fallbacks and constants to prevent bundler export resolution mismatches
export const DEFAULT_FILTER_STATE: FilterState = {
  platform: 'All',
  contentType: 'All',
  startDate: '',
  endDate: '',
  engagementLevel: 'All',
  search: '',
};

export const FilterState = DEFAULT_FILTER_STATE;
export const Post = {};
export const KPISummary = {};
export const TimeSeriesPoint = {};
export const PlatformStat = {};
export const ContentTypeStat = {};
export const BestPostingTimeResponse = {};
export const RecommendationData = {};
export const DashboardResponse = {};
export const PostsResponse = {};
