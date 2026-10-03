import axios from 'axios';
import type {
  DashboardResponse,
  PostsResponse,
  BestPostingTimeResponse,
  RecommendationData,
  FilterState,
  KPISummary,
  PlatformStat,
  ContentTypeStat,
  TimeSeriesPoint,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

function buildFilterParams(filters: Partial<FilterState>) {
  const params: Record<string, string> = {};
  if (filters.platform && filters.platform !== 'All') {
    params.platform = filters.platform;
  }
  if (filters.contentType && filters.contentType !== 'All') {
    params.content_type = filters.contentType;
  }
  if (filters.startDate) {
    params.start_date = filters.startDate;
  }
  if (filters.endDate) {
    params.end_date = filters.endDate;
  }
  if (filters.engagementLevel && filters.engagementLevel !== 'All') {
    params.engagement_level = filters.engagementLevel;
  }
  if (filters.search) {
    params.search = filters.search;
  }
  return params;
}

export const apiService = {
  async getDashboard(filters: Partial<FilterState>): Promise<DashboardResponse> {
    const res = await client.get('/api/dashboard', {
      params: buildFilterParams(filters),
    });
    return res.data;
  },

  async getPosts(
    filters: Partial<FilterState>,
    page = 1,
    perPage = 10,
    sortBy = 'post_date',
    sortOrder = 'desc'
  ): Promise<PostsResponse> {
    const params = {
      ...buildFilterParams(filters),
      page: String(page),
      per_page: String(perPage),
      sort_by: sortBy,
      sort_order: sortOrder,
    };
    const res = await client.get('/api/posts', { params });
    return res.data;
  },

  async getAnalytics(
    filters: Partial<FilterState>,
    granularity: 'daily' | 'weekly' = 'daily'
  ): Promise<{
    time_series: TimeSeriesPoint[];
    top_posts: any[];
    bottom_posts: any[];
  }> {
    const res = await client.get('/api/analytics', {
      params: {
        ...buildFilterParams(filters),
        granularity,
      },
    });
    return res.data;
  },

  async getPlatforms(filters: Partial<FilterState>): Promise<{ platforms: PlatformStat[] }> {
    const res = await client.get('/api/platforms', {
      params: buildFilterParams(filters),
    });
    return res.data;
  },

  async getContentTypes(filters: Partial<FilterState>): Promise<{ content_types: ContentTypeStat[] }> {
    const res = await client.get('/api/content-types', {
      params: buildFilterParams(filters),
    });
    return res.data;
  },

  async getBestPostingTime(filters: Partial<FilterState>): Promise<BestPostingTimeResponse> {
    const res = await client.get('/api/best-posting-time', {
      params: buildFilterParams(filters),
    });
    return res.data;
  },

  async getRecommendations(filters: Partial<FilterState>): Promise<{ data: RecommendationData }> {
    const res = await client.get('/api/recommendations', {
      params: buildFilterParams(filters),
    });
    return res.data;
  },

  async getHashtags(platform?: string): Promise<{ hashtags: any[] }> {
    const params: Record<string, string> = {};
    if (platform && platform !== 'All') {
      params.platform = platform;
    }
    const res = await client.get('/api/hashtags', { params });
    return res.data;
  },

  async predictEngagement(payload: {
    platform: string;
    content_type: string;
    hour: number;
    day_of_week: number;
    caption?: string;
    hashtags?: string;
  }) {
    const res = await client.post('/api/predict', payload);
    return res.data;
  },

  async uploadCSV(file: File, mode: 'replace' | 'append' = 'replace') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);

    const res = await client.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async resetData(): Promise<{ status: string; message: string; kpis: KPISummary }> {
    const res = await client.post('/api/reset-data');
    return res.data;
  },

  getExportUrl(filters: Partial<FilterState>): string {
    const params = new URLSearchParams(buildFilterParams(filters));
    return `${API_BASE_URL}/api/export?${params.toString()}`;
  },
};
