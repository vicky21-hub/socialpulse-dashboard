import React from 'react';

type IconComponent = React.ComponentType<{ className?: string }>;

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconComponent;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';
  formulaHint?: string;
}

const colorStyles = {
  indigo: {
    iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  rose: {
    iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
  sky: {
    iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  },
  purple: {
    iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo',
  formulaHint,
}) => {
  const styles = colorStyles[color] || colorStyles.indigo;
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm hover:shadow-md transition-all duration-200 group"
      title={formulaHint}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {value}
            </span>
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${styles.iconBg} transition-transform duration-200 group-hover:scale-110`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {(trend || formulaHint) && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5 text-xs text-slate-500 dark:text-slate-400">
          {trend ? (
            <span className={`inline-flex items-center gap-1 font-medium ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              <span>{trend.isPositive ? 'up' : 'down'}</span>
              <span>{trend.value}</span>
            </span>
          ) : <span />}
          {formulaHint && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[170px]">{formulaHint}</span>
          )}
        </div>
      )}
    </div>
  );
};