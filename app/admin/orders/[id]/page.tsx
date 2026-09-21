'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MapPin, PackageSearch, Receipt, User } from 'lucide-react';
import { getOrderById, updateOrder } from '@/lib/store';
import { currency, formatDate, orderStatusMeta } from '@/lib/format';
import type { Order, OrderStatus } from '@/lib/types';
import { ensureDemoOrders } from '../seed';
import {
  Btn,
  ConfirmDialog,
  EmptyBox,
  Panel,
  SERIF,
  StatusPill,
} from '../../_ui';

interface StatusAction {
  label: string;
  to: OrderStatus;
  variant: 'primary' | 'secondary' | 'danger';
  needsConfirm: boolean;
  note: string;
  confirmTitle: string;
  confirmBody: string;
}

const ACTIONS: StatusAction[] = [
  {
    label: 'Confirm',
    to: 'confirmed',
    variant: 'secondary',
    needsConfirm: false,
    note: 'Order confirmed by admin. Preparing for shipment.',
    confirmTitle: 'Confirm this order?',
    confirmBody: 'The customer will be notified that their order is confirmed and being prepared.',
  },
  {
    label: 'Ship',
    to: 'shipped',
    variant: 'secondary',
    needsConfirm: false,
    note: 'Order shipped by admin.',
    confirmTitle: 'Mark as shipped?',
    confirmBody: 'This will mark the order as shipped. Make sure the package has left the warehouse.',
  },
  {
    label: 'Deliver',
    to: 'delivered',
    variant: 'secondary',
    needsConfirm: false,
    note: 'Order marked as delivered by admin.',
    confirmTitle: 'Mark as delivered?',
    confirmBody: 'This will mark the order as delivered to the customer.',
  },
  {
    label: 'Cancel',
    to: 'cancelled',
    variant: 'danger',
    needsConfirm: true,
    note: 'Order cancelled by admin.',
    confirmTitle: 'Cancel this order?',
    confirmBody: 'Cancelling stops fulfillment and releases the reserved stock. This cannot be undone.',
  },
  {
    label: 'Refund',
    to: 'refunded',
    variant: 'danger',
    needsConfirm: true,
    note: 'Order refunded by admin.',
    confirmTitle: 'Refund this order?',
    confirmBody: 'This will issue a full refund to the original payment method. This cannot be undone.',
  },
];

/** The happy-path next step for each status — powers the "Advance status" button. */
const NEXT: Partial<Record<OrderStatus, StatusAction>> = {
  pending: ACTIONS[0],
  confirmed: ACTIONS[1],
  shipped: ACTIONS[2],
};

const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function SectionHead({ icon: Icon, title }: { icon: typeof User; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-[#E4572E]" />
      <h2 className="text-[15px] font-semibold text-[#F2EBDD]">{title}</h2>
    </div>
  );
}

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pendingAction, setPendingAction] = useState<StatusAction | null>(null);

  useEffect(() => {
    ensureDemoOrders();
    setOrder(getOrderById(params.id) ?? null);
    setLoaded(true);
  }, [params.id]);

  const applyStatus = (action: StatusAction) => {
    if (!order) return;
    const entry = { status: action.to, at: new Date().toISOString(), note: action.note };
    const timeline = [...order.timeline, entry];
    updateOrder(order.id, { status: action.to, timeline });
    setOrder({ ...order, status: action.to, timeline });
    setPendingAction(null);
  };

  const timeline = useMemo(() => (order ? order.timeline.slice().reverse() : []), [order]);

  if (!loaded) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 animate-pulse rounded bg-[#1E1A14]" />
        <div className="h-64 animate-pulse rounded-[14px] bg-[#1E1A14]" />
      </div>
    );
  }

  if (!order) {
    return (
      <EmptyBox
        icon={PackageSearch}
        title="Order not found"
        hint="This order may have been deleted, or the link is incorrect."
        action={
          <Link href="/admin/orders">
            <Btn variant="secondary">
              <ArrowLeft className="h-4 w-4" /> Back to orders
            </Btn>
          </Link>
        }
      />
    );
  }

  const meta = orderStatusMeta[order.status];
  const isTerminal = order.status === 'cancelled' || order.status === 'refunded';
  const itemCount = order.items.reduce((n, i) => n + i.qty, 0);
  const nextAction = NEXT[order.status];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#A39A89] transition hover:text-[#E4572E]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className={`text-3xl font-semibold tracking-tight text-[#F2EBDD] ${SERIF}`}>
              Order <span className="font-mono text-[0.85em]">#{order.number}</span>
            </h1>
            <StatusPill status={order.status} />
          </div>
          <p className="mt-1.5 text-sm text-[#A39A89]">
            Placed {formatDate(order.createdAt)} · {itemCount} item{itemCount === 1 ? '' : 's'} ·{' '}
            <span className="font-semibold text-[#F2EBDD]">{currency(order.total)}</span>
          </p>
        </div>
        {nextAction && !isTerminal && (
          <Btn onClick={() => applyStatus(nextAction)}>
            Advance status: {nextAction.label} <ArrowRight className="h-4 w-4" />
          </Btn>
        )}
      </div>

      <Panel className="p-5">
        <SectionHead icon={Receipt} title="Fulfillment" />
        {isTerminal ? (
          <p className="mt-3 rounded-lg border border-[#2E2820] bg-[#14110D] px-4 py-3 text-sm text-[#A39A89]">
            This order is <strong className="font-semibold text-[#F2EBDD]">{meta.label.toLowerCase()}</strong> —
            terminal orders can&apos;t be moved. The full history is below.
          </p>
        ) : (
          <p className="mt-2 text-sm text-[#A39A89]">
            Move the order through its lifecycle. Cancellations and refunds ask for confirmation first.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {ACTIONS.map((action) => {
            const allowed = ALLOWED[order.status].includes(action.to) && !isTerminal;
            return (
              <Btn
                key={action.label}
                variant={action.variant}
                size="sm"
                disabled={!allowed}
                onClick={() =>
                  action.needsConfirm ? setPendingAction(action) : applyStatus(action)
                }
                title={allowed ? action.confirmTitle : `Not available while ${meta.label.toLowerCase()}`}
              >
                {action.label}
              </Btn>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel className="p-5 sm:p-6">
            <SectionHead icon={PackageSearch} title={`Items (${itemCount})`} />
            <ul className="mt-4 divide-y divide-[#2E2820]/60">
              {order.items.map((item, i) => (
                <li key={`${item.productId}-${i}`} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-14 w-14 shrink-0 rounded-lg border border-[#2E2820] object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[#F2EBDD]">{item.name}</p>
                    {(item.color || item.size) && (
                      <p className="text-xs text-[#A39A89]">
                        {[item.color, item.size].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm tabular-nums text-[#A39A89]">× {item.qty}</p>
                  <p className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums text-[#F2EBDD]">
                    {currency(item.price * item.qty)}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <SectionHead icon={ArrowRight} title="Status timeline" />
            <ol className="mt-5">
              {timeline.map((entry, i) => {
                const m = orderStatusMeta[entry.status];
                const latest = i === 0;
                return (
                  <li key={`${entry.status}-${entry.at}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < timeline.length - 1 && (
                      <span className="absolute left-[6px] top-5 h-full w-px bg-[#2E2820]" aria-hidden="true" />
                    )}
                    <span
                      className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#1E1A14] ${
                        latest ? 'bg-[#E4572E]' : 'bg-[#2E2820]'
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm font-semibold ${latest ? 'text-[#F2EBDD]' : 'text-[#A39A89]'}`}>
                          {m.label}
                        </span>
                        {latest && (
                          <span className="rounded-full border border-[#E4572E]/30 bg-[#E4572E]/10 px-2 py-0.5 text-[11px] font-semibold text-[#E4572E]">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-[#A39A89]">
                        {formatDate(entry.at)} · {formatTime(entry.at)}
                      </p>
                      {entry.note && <p className="mt-1 text-sm text-[#A39A89]">{entry.note}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="p-5">
            <SectionHead icon={User} title="Customer" />
            <p className="mt-3 font-medium text-[#F2EBDD]">{order.name}</p>
            <p className="text-sm text-[#A39A89]">{order.email}</p>
            <div className="mt-4 border-t border-[#2E2820] pt-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#E4572E]" />
                <h3 className="text-[13px] font-semibold text-[#F2EBDD]">Shipping address</h3>
              </div>
              <address className="mt-2 text-sm not-italic leading-relaxed text-[#A39A89]">
                {order.address.fullName}
                <br />
                {order.address.street}
                <br />
                {order.address.city}, {order.address.postal}
                <br />
                {order.address.country}
                <br />
                {order.address.phone}
              </address>
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionHead icon={Receipt} title="Payment & totals" />
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#A39A89]">Method</dt>
                <dd className="font-medium text-[#F2EBDD]">{order.paymentMethod}</dd>
              </div>
              {order.paymentLast4 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#A39A89]">Card</dt>
                  <dd className="font-mono text-[#F2EBDD]">···· {order.paymentLast4}</dd>
                </div>
              )}
              {order.couponCode && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#A39A89]">Coupon</dt>
                  <dd className="font-mono font-semibold text-[#E0A458]">{order.couponCode}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 border-t border-[#2E2820] pt-2.5">
                <dt className="text-[#A39A89]">Subtotal</dt>
                <dd className="tabular-nums text-[#F2EBDD]">{currency(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#A39A89]">Discount</dt>
                  <dd className="font-medium tabular-nums text-[#7FB069]">−{currency(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-[#A39A89]">Shipping</dt>
                <dd className="tabular-nums text-[#F2EBDD]">
                  {order.shipping === 0 ? 'Free' : currency(order.shipping)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#A39A89]">Tax</dt>
                <dd className="tabular-nums text-[#F2EBDD]">{currency(order.tax)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-[#2E2820] pt-2.5">
                <dt className="font-semibold text-[#F2EBDD]">Total</dt>
                <dd className="font-bold tabular-nums text-[#F2EBDD]">{currency(order.total)}</dd>
              </div>
            </dl>
            <p className="mt-4 rounded-lg border border-[#2E2820] bg-[#14110D] px-3 py-2.5 text-xs leading-relaxed text-[#A39A89]">
              Demo store — no real payment was processed for this order.
            </p>
          </Panel>
        </div>
      </div>

      {pendingAction && (
        <ConfirmDialog
          title={pendingAction.confirmTitle}
          body={
            <>
              <p>{pendingAction.confirmBody}</p>
              <p className="mt-2">
                Order <strong className="font-semibold text-[#F2EBDD]">#{order.number}</strong> will
                move to{' '}
                <strong className="font-semibold text-[#F2EBDD]">
                  {orderStatusMeta[pendingAction.to].label}
                </strong>
                .
              </p>
            </>
          }
          confirmLabel={`Yes, ${pendingAction.label.toLowerCase()} it`}
          danger={pendingAction.variant === 'danger'}
          onCancel={() => setPendingAction(null)}
          onConfirm={() => applyStatus(pendingAction)}
        />
      )}
    </div>
  );
}
