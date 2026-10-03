import React from 'react';
import { useFilters } from '../context/FilterContext';
import { Filter, RotateCcw, Calendar, Search } from 'lucide-react';

export const FilterBar: React.FC = () => {
  const {
    filters,
    setPlatform,
    setContentType,
    setDateRange,
    setEngagementLevel,
    setSearch,
    resetFilters,
  } = useFilters();

  const platforms = ['All', 'Instagram', 'YouTube'];
  const contentTypes = ['All', 'Reels', 'Videos', 'Shorts', 'Images', 'Posts'];
  const engagementLevels = ['All', 'High', 'Medium', 'Low'];

  const hasActiveFilters =
    filters.platform !== 'All' ||
    filters.contentType !== 'All' ||
    filters.engagementLevel !== 'All' ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate) ||
    Boolean(filters.search);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-sm backdrop-blur-md mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side: Platform selector and Content Type */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </div>

          {/* Platform Pills */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
            {platforms.map(p => {
              const active = filters.platform === p;
              return (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                    active
                      ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Content Type Select */}
          <div className="relative">
            <select
              value={filters.contentType}
              onChange={e => setContentType(e.target.value)}
              aria-label="Filter by Content Type"
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200"
            >
              {contentTypes.map(t => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Content Types' : t}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              ▼
            </span>
          </div>

          {/* Engagement Level */}
          <div className="relative">
            <select
              value={filters.engagementLevel}
              onChange={e => setEngagementLevel(e.target.value)}
              aria-label="Filter by Engagement Level"
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200"
            >
              <option value="All">All Engagement</option>
              <option value="High">High (≥8%)</option>
              <option value="Medium">Medium (4-8%)</option>
              <option value="Low">Low (&lt;4%)</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              ▼
            </span>
          </div>
        </div>

        {/* Right side: Search, Date range, and Reset */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative min-w-[180px] flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search captions or #tags..."
              value={filters.search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="date"
              value={filters.startDate}
              onChange={e => setDateRange(e.target.value, filters.endDate)}
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-1 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
              title="Start Date"
            />
            <span>to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setDateRange(filters.startDate, e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-1 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
              title="End Date"
            />
          </div>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
