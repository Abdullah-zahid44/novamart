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
      <span className={cn('tnum font-semibold text-ink', sizeStyles[size])}>{currency(value)}</span>
      {onSale && (
        <>
          <span className="text-sm text-muted line-through">{currency(compareAt)}</span>
          <span className="rounded-full bg-accent px-1.5 py-0.5 text-xs font-semibold text-white">
            Save {pct}%
          </span>
        </>
      )}
    </span>
  );
}
