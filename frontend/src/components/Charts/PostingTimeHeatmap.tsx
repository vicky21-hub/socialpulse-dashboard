import React, { useState } from 'react';
import type {
  HeatmapDayRow,
  OptimalSlot,
  BestPostingTimeResponse,
} from '../types';
import { Clock, Calendar, Sparkles, Flame } from 'lucide-react';

interface PostingTimeHeatmapProps {
  data: BestPostingTimeResponse | null;
}

export const PostingTimeHeatmap: React.FC<PostingTimeHeatmapProps> = ({ data }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    day: string;
    hour: number;
    rate: number;
    count: number;
  } | null>(null);

  if (!data || !data.heatmap_matrix || data.heatmap_matrix.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 text-center text-xs text-slate-400">
        No timing data available.
      </div>
    );
  }

  // Calculate min and max engagement rate in heatmap matrix to scale colors
  let maxRate = 0.1;
  data.heatmap_matrix.forEach(row => {
    row.hours.forEach(h => {
      if (h.avg_engagement_rate > maxRate) {
        maxRate = h.avg_engagement_rate;
      }
    });
  });

  const getCellColor = (rate: number, count: number) => {
    if (count === 0 || rate === 0) {
      return 'bg-slate-100/60 dark:bg-slate-800/40 text-transparent';
    }
    const ratio = rate / maxRate;
    if (ratio >= 0.85) return 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400/50';
    if (ratio >= 0.70) return 'bg-indigo-500 text-white';
    if (ratio >= 0.50) return 'bg-indigo-400 text-white';
    if (ratio >= 0.35) return 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900/60 dark:text-indigo-200';
    return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400';
  };

  const hoursList = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" />
            <span>Optimal Posting Times & Heatmap</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Engagement rate distribution across all 168 hours of the week
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span>Lower</span>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-sm bg-indigo-100 dark:bg-indigo-950/40" />
            <div className="h-3 w-3 rounded-sm bg-indigo-300 dark:bg-indigo-800" />
            <div className="h-3 w-3 rounded-sm bg-indigo-500" />
            <div className="h-3 w-3 rounded-sm bg-indigo-600 ring-1 ring-indigo-400" />
          </div>
          <span>Peak</span>
        </div>
      </div>

      {/* KPI Highlights for Best Day & Best Time */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-indigo-100 dark:border-indigo-800/40 bg-indigo-50/50 dark:bg-indigo-950/30 p-3.5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Optimal Day
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {data.best_day}
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                ({data.best_day_engagement}%)
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-100 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Optimal Time Window
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {data.best_time}
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                ({data.best_hour_engagement}%)
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-100 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/30 p-3.5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Top Golden Window
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {data.top_slots?.[0]
                ? `${data.top_slots[0].day} ${data.top_slots[0].time_window} (${data.top_slots[0].avg_engagement_rate}%)`
                : 'Consistent scheduling'}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[720px]">
          {/* Hour headers */}
          <div className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 text-[10px] text-slate-400 font-medium pb-1.5 text-center">
            <div className="text-left font-semibold">Day</div>
            {hoursList.map(h => (
              <div key={h} className="truncate">
                {h % 3 === 0 ? `${h}h` : ''}
              </div>
            ))}
          </div>

          {/* Rows per day */}
          <div className="space-y-1.5">
            {data.heatmap_matrix.map(row => (
              <div
                key={row.day}
                className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 items-center"
              >
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                  {row.day.slice(0, 3)}
                </div>
                {row.hours.map(slot => (
                  <div
                    key={slot.hour}
                    onMouseEnter={() =>
                      setHoveredCell({
                        day: row.day,
                        hour: slot.hour,
                        rate: slot.avg_engagement_rate,
                        count: slot.post_count,
                      })
                    }
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`h-7 rounded transition-all cursor-pointer flex items-center justify-center text-[10px] ${getCellColor(
                      slot.avg_engagement_rate,
                      slot.post_count
                    )} hover:scale-110 hover:shadow-md hover:z-10`}
                  >
                    {slot.post_count > 0 && slot.avg_engagement_rate >= 8.5 ? (
                      <span className="text-[9px]">★</span>
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover info footer */}
      <div className="flex items-center justify-between min-h-[28px] rounded-xl bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300">
        {hoveredCell ? (
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-900 dark:text-white">
              {hoveredCell.day} at {String(hoveredCell.hour).padStart(2, '0')}:00
            </span>
            <span>
              Avg Engagement:{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">
                {hoveredCell.rate}%
              </strong>
            </span>
            <span>
              Posts Sampled: <strong>{hoveredCell.count}</strong>
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">
            Hover over any cell in the heatmap above to view detailed hourly engagement metrics.
          </span>
        )}

        <span className="text-[10px] text-slate-400">★ = Elite Performance (&gt;8.5%)</span>
      </div>
    </div>
  );
};
