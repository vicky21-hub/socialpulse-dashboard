import React, { useEffect, useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { apiService } from '../services/api';
import type { RecommendationData } from '../types';
import {
  Lightbulb,
  Sparkles,
  Calendar,
  Clock,
  Video,
  Hash,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Flame,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { filters, refreshTrigger } = useFilters();
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await apiService.getRecommendations(filters);
        if (isMounted) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecommendations();
    return () => {
      isMounted = false;
    };
  }, [filters, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Executive Strategy Banner */}
      <div className="rounded-3xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-semibold text-indigo-200 mb-4 border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Algorithmic Optimization Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Data-Driven Social Growth Blueprint
          </h2>
          <p className="mt-2 text-sm text-indigo-100 leading-relaxed">
            All insights below are computed directly from your publication history (baseline engagement rate:{' '}
            <strong className="text-white underline">{data.overall_avg_engagement}%</strong>). These tactics
            pinpoint your highest-converting formats, golden posting hours, and content bottlenecks.
          </p>
        </div>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Best Platform */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Best Performing Platform</span>
            <div className="h-8 w-8 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.best_platform.name}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{data.best_platform.avg_engagement_rate}% avg engagement</span>
            </div>
          </div>
        </div>

        {/* 2. Best Content Format */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Winning Format</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Video className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.best_content_type.name}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              <span>+{data.best_content_type.advantage_pct}% vs baseline</span>
            </div>
          </div>
        </div>

        {/* 3. Best Posting Day */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Peak Engagement Day</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.best_posting_day.day}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <span>{data.best_posting_day.avg_engagement_rate}% avg engagement</span>
            </div>
          </div>
        </div>

        {/* 4. Best Posting Window */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Prime Hourly Window</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.best_posting_time.window}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>{data.best_posting_time.avg_engagement_rate}% peak engagement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Strategy Roadmap Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-indigo-500" />
            <span>Priority Tactical Action Plan</span>
          </h3>
          <span className="text-xs text-slate-400">Ranked by Expected Impact</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.actionable_recommendations.map((rec, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rec.priority === 'HIGH'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                      : rec.priority === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                  }`}
                >
                  {rec.priority} PRIORITY · {rec.category}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                {rec.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {rec.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Low-Performing Content Alert & Recommended Cadence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low-Performing Content Warning */}
        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm mb-3">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Format Drag Analysis (Underperforming Content)</span>
          </div>

          {data.low_performing_content.length === 0 ? (
            <p className="text-xs text-slate-500">All content types are performing at or above baseline.</p>
          ) : (
            <div className="space-y-3">
              {data.low_performing_content.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-white/90 dark:bg-slate-900/80 p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-1">
                    <span>{item.content_type}</span>
                    <span className="text-rose-600 dark:text-rose-400">
                      -{item.pct_below_average}% below average
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    Averages {item.avg_engagement_rate}% engagement across {item.posts_count} posts.
                    Recommendation: Test transforming these into carousel slides or fast-paced video summaries.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Frequency & Top Golden Slots */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm mb-3">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span>Recommended Cadence &amp; Golden Slots</span>
            </div>

            <div className="rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 p-4 mb-4">
              <div className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold mb-1">
                Target Publishing Cadence
              </div>
              <div className="text-lg font-extrabold text-indigo-900 dark:text-indigo-200">
                {data.recommended_frequency.frequency}
              </div>
              <p className="mt-1 text-xs text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
                {data.recommended_frequency.note}
              </p>
            </div>

            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Top 3 Highest-Yield Publishing Windows:
            </div>
            <div className="space-y-2">
              {data.top_slots.map((slot, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    #{idx + 1} {slot.day} ({slot.time_window})
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {slot.avg_engagement_rate}% Avg Eng.
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 High-Performing Posts Showcase */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-rose-500" />
              <span>Hall of Fame: Top Performing Content</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The highest engagement benchmarks in your current dataset
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.top_posts.map((post, idx) => (
            <div
              key={post.post_id}
              className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold">
                    #{idx + 1} {post.platform} {post.content_type}
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {post.engagement_rate}%
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  "{post.caption_snippet}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-3 gap-1 text-[11px] text-slate-500 text-center font-medium">
                <div>
                  <span className="block text-slate-800 dark:text-slate-200 font-bold">
                    {post.likes.toLocaleString('en-US')}
                  </span>
                  <span className="text-[10px]">Likes</span>
                </div>
                <div>
                  <span className="block text-slate-800 dark:text-slate-200 font-bold">
                    {post.comments.toLocaleString('en-US')}
                  </span>
                  <span className="text-[10px]">Comments</span>
                </div>
                <div>
                  <span className="block text-slate-800 dark:text-slate-200 font-bold">
                    {post.shares.toLocaleString('en-US')}
                  </span>
                  <span className="text-[10px]">Shares</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
