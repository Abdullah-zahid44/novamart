'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface QtySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  small?: boolean;
}

/** Stepper for quantities with min/max clamping. */
export function QtySelector({ value, onChange, min = 1, max = 99, small = false }: QtySelectorProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const btn = cn(
    'flex items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition-colors',
    'hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40',
    small ? 'h-7 w-7' : 'h-9 w-9',
  );
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className={btn}
      >
        <Minus size={small ? 14 : 16} />
      </button>
      <span
        aria-live="polite"
        className={cn('min-w-8 text-center font-medium tabular-nums', small ? 'text-sm' : 'text-base')}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className={btn}
      >
        <Plus size={small ? 14 : 16} />
      </button>
    </div>
  );
}
