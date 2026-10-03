import React, { useEffect, useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { apiService } from '../services/api';
import type { DashboardResponse } from '../types';
import { MetricCard } from '../components/MetricCard';
import { TimeSeriesChart } from '../components/Charts/TimeSeriesChart';
import { PlatformComparisonChart } from '../components/Charts/PlatformComparisonChart';
import { ContentTypeBarChart } from '../components/Charts/ContentTypeBarChart';
import {
  FileText,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Percent,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { filters, refreshTrigger } = useFilters();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiService.getDashboard(filters);
        if (isMounted) {
          setData(res);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load dashboard data. Ensure Flask backend is running on port 5000.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [filters, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse"
            >
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
              <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
              <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
          ))}
        </div>

        {/* Skeleton Charts */}
        <div className="h-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900/50 dark:bg-rose-950/20 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-500 mb-2" />
        <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">
          Backend Connection Error
        </h3>
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 max-w-md mx-auto">
          {error}
        </p>
        <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
          Backend expected at <code className="bg-rose-100 dark:bg-rose-900/60 px-1 py-0.5 rounded">http://127.0.0.1:5000</code>
        </p>
      </div>
    );
  }

  if (!data) return null;

  const kpis = data.kpis;

  return (
    <div className="space-y-6">
      {/* 6 Required KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Posts"
          value={kpis.total_posts.toLocaleString('en-US')}
          subtitle={`Avg ${kpis.avg_likes.toLocaleString('en-US')} likes/post`}
          icon={FileText}
          color="indigo"
          formulaHint="Count of posts in dataset"
        />

        <MetricCard
          title="Total Likes"
          value={kpis.total_likes.toLocaleString('en-US')}
          subtitle={`Avg ${kpis.avg_likes.toLocaleString('en-US')} / post`}
          icon={Heart}
          color="rose"
          formulaHint="Sum of all user likes"
        />

        <MetricCard
          title="Total Comments"
          value={kpis.total_comments.toLocaleString('en-US')}
          subtitle={`Avg ${kpis.avg_comments.toLocaleString('en-US')} / post`}
          icon={MessageCircle}
          color="amber"
          formulaHint="Sum of discussion comments"
        />

        <MetricCard
          title="Total Shares"
          value={kpis.total_shares.toLocaleString('en-US')}
          subtitle={`Avg ${kpis.avg_shares.toLocaleString('en-US')} / post`}
          icon={Share2}
          color="emerald"
          formulaHint="Total content redistributions"
        />

        <MetricCard
          title="Total Impressions"
          value={kpis.total_impressions.toLocaleString('en-US')}
          subtitle={`Avg ${kpis.avg_impressions.toLocaleString('en-US')} / post`}
          icon={Eye}
          color="sky"
          formulaHint="Total content views / impressions"
        />

        <MetricCard
          title="Avg Engagement"
          value={`${kpis.avg_engagement_rate}%`}
          subtitle={`Aggregate: ${kpis.aggregate_engagement_rate}%`}
          icon={Percent}
          color="purple"
          formulaHint="Formula: (likes + comments + shares) / impressions × 100"
        />
      </div>

      {/* Main Time Series Chart */}
      <TimeSeriesChart data={data.engagement_over_time} />

      {/* Grid: Platform Comparison & Content Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlatformComparisonChart data={data.platform_breakdown} />
        <ContentTypeBarChart data={data.content_type_breakdown} />
      </div>

      {/* Bottom Highlights: Best Posting Time & AI Recommendations Quick Sneak */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best Posting Time Snippet */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span>Optimal Timing Peak</span>
            </h3>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
            >
              <span>Heatmap</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3 mt-4">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Best Performing Day</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {data.best_posting_time.best_day}
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Best Time Window</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {data.best_posting_time.best_time}
              </span>
            </div>

            {data.best_posting_time.top_slots?.[0] && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                Highest recorded engagement:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {data.best_posting_time.top_slots[0].day}{' '}
                  {data.best_posting_time.top_slots[0].time_window}
                </strong>{' '}
                at{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {data.best_posting_time.top_slots[0].avg_engagement_rate}%
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Strategic Recommendations Summary */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span>Calculated Strategy Insights</span>
              </h3>
              <button
                onClick={() => onNavigate('recommendations')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
              >
                <span>Full Strategy Engine</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2.5 mt-3">
              {data.recommendations_summary.map((rec, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        rec.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          : rec.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                      }`}
                    >
                      {rec.priority}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {rec.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {rec.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
