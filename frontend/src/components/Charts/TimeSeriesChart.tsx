import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { TimeSeriesPoint } from '../types';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data }) => {
  const [metric, setMetric] = useState<string>('engagement_rate');

  const metricConfigs: Record<
    string,
    { label: string; key: keyof TimeSeriesPoint; color: string; unit: string }
  > = {
    engagement_rate: {
      label: 'Engagement Rate',
      key: 'avg_engagement_rate',
      color: '#6366f1',
      unit: '%',
    },
    impressions: {
      label: 'Impressions',
      key: 'impressions',
      color: '#0ea5e9',
      unit: '',
    },
    likes: {
      label: 'Likes',
      key: 'likes',
      color: '#ec4899',
      unit: '',
    },
    comments: {
      label: 'Comments',
      key: 'comments',
      color: '#f59e0b',
      unit: '',
    },
    shares: {
      label: 'Shares',
      key: 'shares',
      color: '#10b981',
      unit: '',
    },
  };

  const activeConfig = metricConfigs[metric];

  const formatYAxis = (val: number) => {
    if (activeConfig.unit === '%') return `${val}%`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return String(val);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            Performance Trends Over Time
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Timeline progression of content reception and viral reach
          </p>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
          {Object.entries(metricConfigs).map(([key, cfg]) => {
            const isSelected = metric === key;
            return (
              <button
                key={key}
                onClick={() => setMetric(key)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No time-series data available for the selected filters.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={val => {
                  const parts = val.split('-');
                  return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={formatYAxis}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as TimeSeriesPoint;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 text-xs space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
                        <p className="text-slate-500">
                          Posts Published: <span className="font-medium text-slate-800 dark:text-slate-200">{item.total_posts}</span>
                        </p>
                        <p style={{ color: activeConfig.color }} className="font-bold">
                          {activeConfig.label}: {item[activeConfig.key as keyof TimeSeriesPoint]}
                          {activeConfig.unit}
                        </p>
                        <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 grid grid-cols-2 gap-x-3">
                          <span>Likes: {item.likes.toLocaleString()}</span>
                          <span>Shares: {item.shares.toLocaleString()}</span>
                          <span>Comments: {item.comments.toLocaleString()}</span>
                          <span>Impr: {item.impressions.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={activeConfig.key as string}
                stroke={activeConfig.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#metricGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
