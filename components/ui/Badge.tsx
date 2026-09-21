import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Product } from '@/lib/types';

export type BadgeVariant =
  | 'new'
  | 'sale'
  | 'hot'
  | 'bestseller'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

const variantStyles: Record<BadgeVariant, string> = {
  new: 'bg-forest text-paper',
  sale: 'bg-accent text-white',
  hot: 'bg-ink text-paper',
  bestseller: 'bg-accent-deep text-white',
  info: 'bg-sand text-ink',
  success: 'bg-forest text-paper',
  warning: 'bg-gold text-ink',
  danger: 'bg-rose-600 text-white',
  neutral: 'bg-sand text-muted',
};

/** Map a Product badge to its Badge variant. */
export const productBadgeVariant: Record<NonNullable<Product['badge']>, BadgeVariant> = {
  NEW: 'new',
  SALE: 'sale',
  HOT: 'hot',
  BESTSELLER: 'bestseller',
};

export interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

/** Small pill badge. */
export function Badge({ variant = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
