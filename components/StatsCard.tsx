import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  color?: 'brand' | 'success' | 'warning' | 'error' | 'accent';
}

const colorVariants = {
  brand: 'bg-brand-50 text-brand-600',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  error: 'bg-error-50 text-error-600',
  accent: 'bg-accent-50 text-accent-600',
};

const iconGradients = {
  brand: 'from-brand-400 to-brand-600',
  success: 'from-success-500 to-success-600',
  warning: 'from-warning-400 to-warning-600',
  error: 'from-error-400 to-error-600',
  accent: 'from-accent-400 to-accent-600',
};

export function StatsCard({
  title,
  value,
  icon,
  trend,
  className,
  color = 'brand',
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/60 p-6 shadow-soft hover:shadow-medium transition-all duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full',
                  trend.isPositive
                    ? 'bg-success-100 text-success-700'
                    : 'bg-error-100 text-error-700'
                )}
              >
                {trend.isPositive ? (
                  <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-400">vs ayer</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            colorVariants[color]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
