import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import type { PlatformStat } from '../types';

interface PlatformComparisonChartProps {
  data: PlatformStat[];
}

export const PlatformComparisonChart: React.FC<PlatformComparisonChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    platform: item.platform,
    'Avg Engagement (%)': item.avg_engagement_rate,
    'Avg Likes': item.avg_likes,
    'Avg Comments': item.avg_comments,
    'Avg Shares': item.avg_shares,
    posts: item.posts,
    impressions: item.total_impressions,
  }));

  const platformColors: Record<string, string> = {
    Instagram: '#ec4899',
    YouTube: '#ef4444',
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            Platform Benchmarking
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instagram vs YouTube comparative engagement rates
          </p>
        </div>
      </div>

      {/* Mini summary badges */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {data.map(p => (
          <div
            key={p.platform}
            className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: platformColors[p.platform] || '#6366f1' }}>
                {p.platform}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {p.posts} posts
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {p.avg_engagement_rate}%
                </div>
                <div className="text-[10px] text-slate-400">Avg Engagement</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {p.total_impressions.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400">Total Impr.</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-60 w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No platform comparison data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis dataKey="platform" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 text-xs space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white">{d.platform}</p>
                        <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          Avg Engagement: {d['Avg Engagement (%)']}%
                        </p>
                        <p className="text-slate-500">Avg Likes: {d['Avg Likes']}</p>
                        <p className="text-slate-500">Avg Comments: {d['Avg Comments']}</p>
                        <p className="text-slate-500">Avg Shares: {d['Avg Shares']}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="Avg Engagement (%)" radius={[8, 8, 0, 0]}>
                {chartData.map(entry => (
                  <Cell
                    key={entry.platform}
                    fill={platformColors[entry.platform] || '#6366f1'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
