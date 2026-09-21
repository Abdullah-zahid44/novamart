import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps {
  className?: string;
  children: ReactNode;
}

/** Warm card: card bg, 1px line border, 14px radius (DESIGN_BRIEF §2). */
export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('rounded-[14px] border border-line bg-card', className)}>{children}</div>
  );
}
