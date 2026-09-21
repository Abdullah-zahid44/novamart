import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps {
  className?: string;
  children: ReactNode;
}

/** Rounded-xl white card with subtle border + shadow. */
export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      {children}
    </div>
  );
}
