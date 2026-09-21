import type { OrderStatus } from './types';

/** Format a number as USD, e.g. $1,234.50 */
export function currency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);
}

/** Format an ISO date, e.g. Sep 21, 2026 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Order status label + colored dot (tailwind bg class) for badges/timelines */
export const orderStatusMeta: Record<OrderStatus, { label: string; dot: string }> = {
  pending: { label: 'Pending', dot: 'bg-amber-400' },
  confirmed: { label: 'Confirmed', dot: 'bg-sky-500' },
  shipped: { label: 'Shipped', dot: 'bg-indigo-500' },
  delivered: { label: 'Delivered', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', dot: 'bg-rose-500' },
  refunded: { label: 'Refunded', dot: 'bg-slate-400' },
};
