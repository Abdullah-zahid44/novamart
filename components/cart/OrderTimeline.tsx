import { formatDate, orderStatusMeta } from '@/lib/format';
import type { Order } from '@/lib/types';

interface OrderTimelineProps {
  timeline: Order['timeline'];
}

/** Vertical status timeline used on the order-success and tracking pages. */
export function OrderTimeline({ timeline }: OrderTimelineProps) {
  const steps = [...timeline].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <ol>
      {steps.map((entry, i) => {
        const meta = orderStatusMeta[entry.status];
        const last = i === steps.length - 1;
        return (
          <li key={`${entry.status}-${entry.at}-${i}`} className="relative flex gap-3 pb-6 last:pb-0">
            {!last && (
              <span aria-hidden className="absolute left-[7px] top-5 h-[calc(100%-1rem)] w-0.5 bg-line" />
            )}
            <span
              aria-hidden
              className={`relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full ${meta.dot} ring-4 ring-card`}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{meta.label}</p>
              <p className="text-xs text-muted">{formatDate(entry.at)}</p>
              {entry.note && <p className="mt-0.5 text-xs text-muted">{entry.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
