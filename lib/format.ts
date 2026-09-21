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

/** Order status label + colored dot (tailwind bg class) for badges/timelines.
 *  Warm editorial palette per DESIGN_BRIEF.md — no indigo/blue. */
export const orderStatusMeta: Record<OrderStatus, { label: string; dot: string }> = {
  pending: { label: 'Pending', dot: 'bg-[#E0A458]' },
  confirmed: { label: 'Confirmed', dot: 'bg-[#E4572E]' },
  shipped: { label: 'Shipped', dot: 'bg-[#C99A2C]' },
  delivered: { label: 'Delivered', dot: 'bg-[#7FB069]' },
  cancelled: { label: 'Cancelled', dot: 'bg-[#E26D5A]' },
  refunded: { label: 'Refunded', dot: 'bg-[#A39A89]' },
};
