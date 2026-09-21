import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Warm field shell shared by Input / Textarea / Select. */
export const fieldCls = (error?: string) =>
  cn(
    'w-full rounded-xl border bg-card px-3.5 text-sm text-ink',
    'placeholder:text-muted/60 transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    error
      ? 'border-[#E26D5A] focus:border-[#E26D5A] focus:ring-[#E26D5A]/20'
      : 'border-line focus:border-accent focus:ring-accent/20',
  );

export const labelCls = 'mb-1.5 block text-sm font-medium text-ink/80';

export const errorCls = 'mt-1 text-xs text-[#B23A17]';

export function FieldError({ children }: { children: ReactNode }) {
  return <p className={errorCls}>{children}</p>;
}
