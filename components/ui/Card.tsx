import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  interactive?: boolean;
}

export function Card({ children, className, hover, interactive }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/60 shadow-soft transition-all duration-200 ease-out',
        hover && 'hover:border-slate-300 hover:shadow-medium hover:-translate-y-0.5',
        interactive && 'cursor-pointer hover:border-brand-200 hover:shadow-md',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function CardHeader({
  title,
  description,
  actions,
  className,
  icon,
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-4 border-b border-slate-100',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function CardContent({
  children,
  className,
  noPadding = false,
}: CardContentProps) {
  return (
    <div className={cn(!noPadding && 'p-6', className)}>{children}</div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl',
        className
      )}
    >
      {children}
    </div>
  );
}
