import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { errorCls, fieldCls, labelCls } from './fieldBase';

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
        <label htmlFor={inputId} className={labelCls}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={!!error}
        className={cn(fieldCls(error), 'px-3.5 py-3', className)}
        {...rest}
      />
      {error ? (
        <p className={errorCls}>{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
