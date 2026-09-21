import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface StarsProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const px: Record<NonNullable<StarsProps['size']>, number> = { sm: 14, md: 16, lg: 20 };

/** 5-star rating display, gold fill (DESIGN_BRIEF §2 — gold is for stars only). */
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
          className={i <= filled ? 'fill-gold text-gold' : 'fill-line text-line'}
        />
      ))}
    </span>
  );
}
