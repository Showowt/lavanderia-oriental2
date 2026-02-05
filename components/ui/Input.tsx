'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'block w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-all duration-200 ease-out',
            'text-slate-900 placeholder:text-slate-400',
            'focus:outline-none focus:ring-4 focus:ring-offset-0',
            'hover:border-slate-300',
            error
              ? 'border-error-300 focus:border-error-500 focus:ring-error-500/10'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/10',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed disabled:hover:border-slate-200',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-error-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

// Textarea variant
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'block w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-all duration-200 ease-out',
            'text-slate-900 placeholder:text-slate-400',
            'focus:outline-none focus:ring-4 focus:ring-offset-0',
            'hover:border-slate-300',
            error
              ? 'border-error-300 focus:border-error-500 focus:ring-error-500/10'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/10',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed disabled:hover:border-slate-200',
            'resize-none',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-error-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
