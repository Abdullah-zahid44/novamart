import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/** Labeled textarea with inline error / hint. */
export function Textarea({ label, error, hint, id, rows = 4, className, ...rest }: TextareaProps) {
  const inputId =
    id ?? (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={!!error}
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900',
          'placeholder:text-slate-400 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200',
          className,
        )}
        {...rest}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
