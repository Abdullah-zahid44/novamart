import type { SelectHTMLAttributes } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { errorCls, fieldCls, labelCls } from './fieldBase';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  /** Shorthand for building <option> children programmatically. Ignored when children are given. */
  options?: SelectOption[];
  placeholder?: string;
  children?: ReactNode;
}

/** Labeled native select with chevron. Accepts either <option> children or an `options` array. */
export function Select({ label, error, options, placeholder, id, className, children, ...rest }: SelectProps) {
  const inputId =
    id ?? (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={labelCls}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          aria-invalid={!!error}
          className={cn(fieldCls(error), 'h-11 appearance-none pl-3.5 pr-10', className)}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children ?? (options ?? []).map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
      {error && <p className={errorCls}>{error}</p>}
    </div>
  );
}
