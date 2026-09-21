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
  new: 'bg-emerald-100 text-emerald-800',
  sale: 'bg-rose-100 text-rose-800',
  hot: 'bg-amber-100 text-amber-900',
  bestseller: 'bg-indigo-100 text-indigo-800',
  info: 'bg-sky-100 text-sky-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-900',
  danger: 'bg-rose-100 text-rose-800',
  neutral: 'bg-slate-100 text-slate-700',
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
