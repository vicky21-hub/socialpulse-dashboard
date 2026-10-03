import React, { useEffect, useState } from 'react';
import { useFilters } from '../context/FilterContext';
import { apiService } from '../services/api';
import type {
  BestPostingTimeResponse,
  PlatformStat,
  ContentTypeStat,
  TimeSeriesPoint,
} from '../types';
import { TimeSeriesChart } from '../components/Charts/TimeSeriesChart';
import { PostingTimeHeatmap } from '../components/Charts/PostingTimeHeatmap';
import { PlatformComparisonChart } from '../components/Charts/PlatformComparisonChart';
import { ContentTypeBarChart } from '../components/Charts/ContentTypeBarChart';
import {
  Sparkles,
  Hash,
  Brain,
  Sliders,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { filters, refreshTrigger } = useFilters();
  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [platforms, setPlatforms] = useState<PlatformStat[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentTypeStat[]>([]);
  const [postingTimes, setPostingTimes] = useState<BestPostingTimeResponse | null>(null);
  const [hashtags, setHashtags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ML Predictor state
  const [predPlatform, setPredPlatform] = useState('Instagram');
  const [predType, setPredType] = useState('Reels');
  const [predHour, setPredHour] = useState(19);
  const [predDay, setPredDay] = useState(3); // Thursday
  const [predCaption, setPredCaption] = useState('5 AI tools every developer must use in 2026! 🚀');
  const [predHashtags, setPredHashtags] = useState('#aitools #techtrends #webdev');
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [analyticsRes, platformsRes, contentTypesRes, postingTimeRes, hashtagsRes] =
          await Promise.all([
            apiService.getAnalytics(filters, granularity),
            apiService.getPlatforms(filters),
            apiService.getContentTypes(filters),
            apiService.getBestPostingTime(filters),
            apiService.getHashtags(filters.platform),
          ]);

        if (isMounted) {
          setTimeSeries(analyticsRes.time_series);
          setPlatforms(platformsRes.platforms);
          setContentTypes(contentTypesRes.content_types);
          setPostingTimes(postingTimeRes);
          setHashtags(hashtagsRes.hashtags);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load analytics.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalyticsData();
    return () => {
      isMounted = false;
    };
  }, [filters, granularity, refreshTrigger]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPredicting(true);
      const res = await apiService.predictEngagement({
        platform: predPlatform,
        content_type: predType,
        hour: Number(predHour),
        day_of_week: Number(predDay),
        caption: predCaption,
        hashtags: predHashtags,
      });
      setPredictionResult(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setPredicting(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900/50 dark:bg-rose-950/20 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-500 mb-2" />
        <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls: Daily vs Weekly Granularity */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Comprehensive Engagement Intelligence
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Temporal patterns, format mechanics, and algorithmic performance drivers
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
          <button
            onClick={() => setGranularity('daily')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              granularity === 'daily'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setGranularity('weekly')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              granularity === 'weekly'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Time Series Area Chart */}
      <TimeSeriesChart data={timeSeries} />

      {/* Heatmap Section */}
      <PostingTimeHeatmap data={postingTimes} />

      {/* Platform & Content Type deep dive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlatformComparisonChart data={platforms} />
        <ContentTypeBarChart data={contentTypes} />
      </div>

      {/* Hashtags Leaderboard & Scikit-Learn ML Engagement Predictor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hashtags Performance Leaderboard */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <Hash className="h-4 w-4 text-indigo-500" />
                <span>Top Converting Hashtags</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ranked by average engagement rate conversion
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="pb-2.5">Hashtag</th>
                  <th className="pb-2.5 text-center">Posts</th>
                  <th className="pb-2.5 text-right">Avg Engagement</th>
                  <th className="pb-2.5 text-right">Impressions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {hashtags.slice(0, 8).map(tag => (
                  <tr key={tag.hashtag} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                      {tag.hashtag}
                    </td>
                    <td className="py-2.5 text-center text-slate-600 dark:text-slate-300">
                      {tag.count}
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                      {tag.avg_engagement_rate}%
                    </td>
                    <td className="py-2.5 text-right text-slate-500 dark:text-slate-400">
                      {tag.total_impressions.toLocaleString('en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Machine Learning Engagement Predictor */}
        <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>AI Engagement Predictor</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scikit-Learn Random Forest model trained on your dataset
              </p>
            </div>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              ML Model
            </span>
          </div>

          <form onSubmit={handlePredict} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Platform
                </label>
                <select
                  value={predPlatform}
                  onChange={e => setPredPlatform(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Format
                </label>
                <select
                  value={predType}
                  onChange={e => setPredType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="Reels">Reels</option>
                  <option value="Videos">Videos</option>
                  <option value="Shorts">Shorts</option>
                  <option value="Posts">Posts</option>
                  <option value="Images">Images</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Day of Week
                </label>
                <select
                  value={predDay}
                  onChange={e => setPredDay(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  {daysOfWeek.map((day, idx) => (
                    <option key={day} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Hour of Day ({predHour}:00)
                </label>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={predHour}
                  onChange={e => setPredHour(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Planned Caption & Hashtags
              </label>
              <input
                type="text"
                value={predCaption}
                onChange={e => setPredCaption(e.target.value)}
                placeholder="Enter caption..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 mb-2"
              />
              <input
                type="text"
                value={predHashtags}
                onChange={e => setPredHashtags(e.target.value)}
                placeholder="#hashtags"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={predicting}
              className="w-full rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{predicting ? 'Calculating Simulation...' : 'Simulate & Predict Engagement'}</span>
            </button>
          </form>

          {/* Prediction Result Display */}
          {predictionResult && (
            <div className="mt-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-white/90 dark:bg-slate-800/80 p-3.5 text-xs space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Predicted Engagement Rate:</span>
                <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                  {predictionResult.predicted_engagement_rate}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Benchmark Comparison:</span>
                <span
                  className={`font-semibold ${
                    predictionResult.diff_from_baseline >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {predictionResult.diff_from_baseline >= 0 ? '+' : ''}
                  {predictionResult.diff_from_baseline}% vs baseline ({predictionResult.account_baseline_rate}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                {predictionResult.recommendation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
