import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import type { ContentTypeStat } from '../../types';

interface ContentTypeBarChartProps {
  data: ContentTypeStat[];
}

export const ContentTypeBarChart: React.FC<ContentTypeBarChartProps> = ({ data }) => {
  const typeColors: Record<string, string> = {
    Reels: '#ec4899',
    Shorts: '#ef4444',
    Videos: '#f97316',
    Posts: '#8b5cf6',
    Images: '#3b82f6',
  };

  const chartData = data.map(item => ({
    type: item.content_type,
    platform: item.platform,
    'Engagement Rate (%)': item.avg_engagement_rate,
    'Avg Likes': item.avg_likes,
    'Avg Comments': item.avg_comments,
    'Avg Shares': item.avg_shares,
    'Avg Impressions': item.avg_impressions,
    posts: item.posts,
  }));

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            Content Format Effectiveness
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Average engagement rates by format (Reels, Videos, Shorts, Posts, Images)
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No content type data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                unit="%"
              />
              <YAxis
                dataKey="type"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-bold text-slate-900 dark:text-white">{d.type}</span>
                          <span className="text-[10px] text-slate-400">({d.platform})</span>
                        </div>
                        <p className="text-indigo-600 dark:text-indigo-400 font-bold">
                          Engagement Rate: {d['Engagement Rate (%)']}%
                        </p>
                        <p className="text-slate-500">Sample Count: {d.posts} posts</p>
                        <p className="text-slate-500">Avg Likes: {d['Avg Likes']?.toLocaleString()}</p>
                        <p className="text-slate-500">Avg Shares: {d['Avg Shares']?.toLocaleString()}</p>
                        <p className="text-slate-500">Avg Impressions: {d['Avg Impressions']?.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="Engagement Rate (%)" radius={[0, 8, 8, 0]}>
                {chartData.map(entry => (
                  <Cell
                    key={entry.type}
                    fill={typeColors[entry.type] || '#6366f1'}
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
