import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useFilters } from '../context/FilterContext';
import { apiService } from '../services/api';
import {
  Menu,
  Sun,
  Moon,
  Download,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { filters, triggerRefresh } = useFilters();
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard Overview',
      subtitle: 'Real-time performance KPIs, engagement trends, and growth indicators',
    },
    analytics: {
      title: 'Engagement Analytics',
      subtitle: 'Deep-dive comparison across platforms, content types, and time dimensions',
    },
    posts: {
      title: 'Posts Explorer',
      subtitle: 'Inspect, filter, search, and sort individual social media publications',
    },
    recommendations: {
      title: 'Content Strategy Recommendations',
      subtitle: 'Data-driven tactical guidance and algorithmic optimization insights',
    },
    upload: {
      title: 'Data Management & Upload',
      subtitle: 'Import custom CSV datasets, validate schema, or restore sample archives',
    },
  };

  const currentMeta = titles[activeTab] || {
    title: 'Engagement Dashboard',
    subtitle: 'Track and analyze social media metrics',
  };

  const handleResetSampleData = async () => {
    if (confirm('Restore the database with the default 250 sample records?')) {
      try {
        setIsResetting(true);
        const res = await apiService.resetData();
        setResetMessage('Sample data restored!');
        triggerRefresh();
        setTimeout(() => setResetMessage(null), 3000);
      } catch (err) {
        console.error('Failed to reset sample data:', err);
        alert('Failed to reset sample data. Make sure backend is running.');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleExportCSV = () => {
    window.open(apiService.getExportUrl(filters), '_blank');
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobileMenu}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {currentMeta.title}
          </h2>
          <p className="hidden sm:block text-xs font-medium text-slate-500 dark:text-slate-400">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Toast alert if sample data restored */}
        {resetMessage && (
          <span className="hidden md:inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{resetMessage}</span>
          </span>
        )}

        {/* Refresh data */}
        <button
          onClick={triggerRefresh}
          title="Refresh current data view"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        {/* Export CSV */}
        <button
          onClick={handleExportCSV}
          title="Export filtered data to CSV"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          <span>Export CSV</span>
        </button>

        {/* Restore Sample Data */}
        <button
          onClick={handleResetSampleData}
          disabled={isResetting}
          title="Reset database to default sample dataset"
          className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
        >
          <RotateCcw className={`h-3.5 w-3.5 text-slate-500 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Sample Data</span>
        </button>

        {/* Dark / Light toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4 text-slate-700" />
          ) : (
            <Sun className="h-4 w-4 text-amber-400" />
          )}
        </button>
      </div>
    </header>
  );
};
