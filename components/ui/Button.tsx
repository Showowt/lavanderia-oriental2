'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-out focus:outline-none focus:ring-4 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none';

    const variants = {
      primary:
        'bg-brand-600 text-white hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-md focus:ring-brand-500/30 active:translate-y-0 active:shadow-sm',
      secondary:
        'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:-translate-y-0.5 focus:ring-slate-500/20 active:translate-y-0',
      danger:
        'bg-error-600 text-white hover:bg-error-700 hover:-translate-y-0.5 hover:shadow-md focus:ring-error-500/30 active:translate-y-0',
      ghost:
        'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500/20',
      accent:
        'bg-accent-500 text-white hover:bg-accent-600 hover:-translate-y-0.5 hover:shadow-md focus:ring-accent-500/30 active:translate-y-0',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" className="mr-2" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
