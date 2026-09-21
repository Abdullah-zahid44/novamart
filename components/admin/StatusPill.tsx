import type { OrderStatus } from "@/lib/types";

/**
 * Dark-theme status pill for the admin console.
 * Uses the mission-control palette (no indigo/blue): amber → pending,
 * orange → confirmed, gold → shipped, green → delivered, red → cancelled,
 * muted → refunded.
 */
const STYLES: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#E0A458" },
  confirmed: { label: "Confirmed", color: "#E4572E" },
  shipped: { label: "Shipped", color: "#C99A2C" },
  delivered: { label: "Delivered", color: "#7FB069" },
  cancelled: { label: "Cancelled", color: "#E26D5A" },
  refunded: { label: "Refunded", color: "#A39A89" },
};

export default function StatusPill({ status }: { status: OrderStatus }) {
  const meta = STYLES[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ color: meta.color, backgroundColor: `${meta.color}1F` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  );
}
