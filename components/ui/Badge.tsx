import { cn, getStatusColor, getStatusText } from '@/lib/utils';

interface BadgeProps {
  status?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
  children?: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ status, variant, children, className, dot }: BadgeProps) {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-600',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    danger: 'bg-error-100 text-error-700',
    info: 'bg-blue-100 text-blue-700',
    brand: 'bg-brand-100 text-brand-700',
  };

  const dotColors = {
    default: 'bg-slate-400',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-error-500',
    info: 'bg-blue-500',
    brand: 'bg-brand-500',
  };

  const colorClass = status
    ? getStatusColor(status)
    : variant
    ? variantClasses[variant]
    : variantClasses.default;

  const dotColor = variant ? dotColors[variant] : dotColors.default;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
        colorClass,
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />
      )}
      {status ? getStatusText(status) : children}
    </span>
  );
}
