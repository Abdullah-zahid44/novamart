import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface StarsProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const px: Record<NonNullable<StarsProps['size']>, number> = { sm: 14, md: 16, lg: 20 };

/** 5-star rating display (filled per rounded value). */
export function Stars({ value, size = 'sm', className }: StarsProps) {
  const filled = Math.round(value);
  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      role="img"
      aria-label={`Rated ${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={px[size]}
          aria-hidden
          className={i <= filled ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
        />
      ))}
    </span>
  );
}
