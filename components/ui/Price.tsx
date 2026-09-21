import { currency } from '@/lib/format';
import { cn } from '@/lib/cn';

export interface PriceProps {
  value: number;
  compareAt?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

/** Price display with optional struck-through compare-at price + save %. */
export function Price({ value, compareAt, size = 'md', className }: PriceProps) {
  const onSale = compareAt != null && compareAt > value;
  const pct = onSale ? Math.round(((compareAt - value) / compareAt) * 100) : 0;
  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-2', className)}>
      <span className={cn('font-bold text-slate-900', sizeStyles[size])}>{currency(value)}</span>
      {onSale && (
        <>
          <span className="text-sm text-slate-400 line-through">{currency(compareAt)}</span>
          <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-700">
            Save {pct}%
          </span>
        </>
      )}
    </span>
  );
}
