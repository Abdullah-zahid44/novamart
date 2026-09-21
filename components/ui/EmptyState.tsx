import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
}

/** Centered placeholder for empty lists (cart, wishlist, search results…). */
export function EmptyState({ icon: Icon, title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sand">
        <Icon size={28} className="text-muted" aria-hidden />
      </div>
      <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
      {hint && <p className="mt-1.5 max-w-sm text-sm text-muted">{hint}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
