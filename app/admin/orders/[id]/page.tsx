'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, PackageSearch } from 'lucide-react';
import { getOrderById, updateOrder } from '@/lib/store';
import { currency, formatDate, orderStatusMeta } from '@/lib/format';
import { Badge, Button, Card, EmptyState } from '@/components/ui';
import type { Order, OrderStatus } from '@/lib/types';
import { ensureDemoOrders } from '../seed';

interface StatusAction {
  label: string;
  to: OrderStatus;
  variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  needsConfirm: boolean;
  note: string;
  confirmTitle: string;
  confirmBody: string;
}

const ACTIONS: StatusAction[] = [
  {
    label: 'Confirm',
    to: 'confirmed',
    variant: 'primary',
    needsConfirm: false,
    note: 'Order confirmed by admin. Preparing for shipment.',
    confirmTitle: 'Confirm this order?',
    confirmBody: 'The customer will be notified that their order is confirmed and being prepared.',
  },
  {
    label: 'Ship',
    to: 'shipped',
    variant: 'primary',
    needsConfirm: false,
    note: 'Order shipped by admin.',
    confirmTitle: 'Mark as shipped?',
    confirmBody: 'This will mark the order as shipped. Make sure the package has left the warehouse.',
  },
  {
    label: 'Deliver',
    to: 'delivered',
    variant: 'primary',
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
    variant: 'outline',
    needsConfirm: true,
    note: 'Order refunded by admin.',
    confirmTitle: 'Refund this order?',
    confirmBody: 'This will issue a full refund to the original payment method. This cannot be undone.',
  },
];

const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

const TERMINAL: OrderStatus[] = ['cancelled', 'refunded'];

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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

  if (!loaded) {
    return <p className="text-sm text-slate-500">Loading order…</p>;
  }

  if (!order) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Order not found"
        hint="This order may have been deleted, or the link is incorrect."
        action={
          <Link href="/admin/orders">
            <Button variant="secondary">Back to orders</Button>
          </Link>
        }
      />
    );
  }

  const meta = orderStatusMeta[order.status];
  const isTerminal = TERMINAL.includes(order.status);
  const itemCount = order.items.reduce((n, i) => n + i.qty, 0);

  const applyStatus = (action: StatusAction) => {
    const entry = { status: action.to, at: new Date().toISOString(), note: action.note };
    const updated: Order = { ...order, status: action.to, timeline: [...order.timeline, entry] };
    updateOrder(order.id, { status: action.to, timeline: updated.timeline });
    setOrder(updated);
    setPendingAction(null);
  };

  const handleAction = (action: StatusAction) => {
    if (action.needsConfirm) {
      setPendingAction(action);
    } else {
      applyStatus(action);
    }
  };

  const timeline = order.timeline.slice().reverse();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Order #{order.number}</h1>
            <Badge>
              <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${meta.dot}`} aria-hidden="true" />
              {meta.label}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Placed {formatDate(order.createdAt)} · {itemCount} item{itemCount === 1 ? '' : 's'} ·{' '}
            {currency(order.total)}
          </p>
        </div>
      </div>

      <Card className="p-4 sm:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Order actions</h2>
        {isTerminal ? (
          <p className="mt-3 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">
            This order is <strong className="font-semibold">{meta.label.toLowerCase()}</strong>. Terminal
            orders cannot be changed — no further actions are available.
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Move the order through its lifecycle. Cancellations and refunds ask for confirmation first.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {ACTIONS.map((action) => {
            const allowed = ALLOWED[order.status].includes(action.to) && !isTerminal;
            return (
              <Button
                key={action.label}
                variant={action.variant}
                size="sm"
                disabled={!allowed}
                onClick={() => handleAction(action)}
                title={allowed ? action.confirmTitle : `Not available while ${meta.label.toLowerCase()}`}
              >
                {action.label}
              </Button>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-4 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">Items</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="pb-2 pr-4 font-semibold">Product</th>
                    <th scope="col" className="px-2 pb-2 font-semibold">Qty</th>
                    <th scope="col" className="px-2 pb-2 text-right font-semibold">Price</th>
                    <th scope="col" className="py-2 pl-2 text-right font-semibold">Line total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, i) => (
                    <tr key={`${item.productId}-${i}`}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={56}
                            height={56}
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium text-slate-900">{item.name}</div>
                            {(item.color || item.size) && (
                              <div className="text-xs text-slate-500">
                                {[item.color, item.size].filter(Boolean).join(' · ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-slate-600">× {item.qty}</td>
                      <td className="px-2 py-3 text-right text-slate-600">{currency(item.price)}</td>
                      <td className="py-3 pl-2 text-right font-semibold text-slate-900">
                        {currency(item.price * item.qty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">Status timeline</h2>
            <ol className="mt-4 space-y-0">
              {timeline.map((entry, i) => {
                const m = orderStatusMeta[entry.status];
                const latest = i === 0;
                return (
                  <li key={`${entry.status}-${entry.at}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < timeline.length - 1 && (
                      <span className="absolute left-[7px] top-5 h-full w-px bg-slate-200" aria-hidden="true" />
                    )}
                    <span
                      className={`mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-white shadow ${
                        latest ? m.dot : 'bg-slate-300'
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm font-semibold ${latest ? 'text-slate-900' : 'text-slate-600'}`}>
                          {m.label}
                        </span>
                        {latest && (
                          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatDate(entry.at)} · {formatTime(entry.at)}
                      </p>
                      {entry.note && <p className="mt-1 text-sm text-slate-600">{entry.note}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-4 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">Customer</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div>
                <dt className="sr-only">Name</dt>
                <dd className="font-medium text-slate-900">{order.name}</dd>
              </div>
              <div>
                <dt className="sr-only">Email</dt>
                <dd className="text-slate-600">{order.email}</dd>
              </div>
            </dl>
            <h3 className="mt-5 text-sm font-semibold text-slate-900">Shipping address</h3>
            <address className="mt-2 text-sm not-italic leading-relaxed text-slate-600">
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
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">Payment</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Method</dt>
                <dd className="font-medium text-slate-900">{order.paymentMethod}</dd>
              </div>
              {order.paymentLast4 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Card</dt>
                  <dd className="font-medium text-slate-900">···· {order.paymentLast4}</dd>
                </div>
              )}
              {order.couponCode && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Coupon</dt>
                  <dd className="font-medium text-slate-900">{order.couponCode}</dd>
                </div>
              )}
            </dl>
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Demo store — no real payment was processed.
            </p>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">Totals</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="text-slate-900">{currency(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Discount</dt>
                  <dd className="font-medium text-emerald-600">−{currency(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Shipping</dt>
                <dd className="text-slate-900">
                  {order.shipping === 0 ? 'Free' : currency(order.shipping)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Tax</dt>
                <dd className="text-slate-900">{currency(order.tax)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="font-bold text-slate-900">{currency(order.total)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      {pendingAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setPendingAction(null)}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="confirm-dialog-title" className="text-lg font-semibold text-slate-900">
              {pendingAction.confirmTitle}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{pendingAction.confirmBody}</p>
            <p className="mt-2 text-sm text-slate-500">
              Order <strong className="font-semibold text-slate-700">#{order.number}</strong> will move to{' '}
              <strong className="font-semibold text-slate-700">
                {orderStatusMeta[pendingAction.to].label}
              </strong>
              .
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPendingAction(null)}>
                Keep order
              </Button>
              <Button variant="danger" size="sm" onClick={() => applyStatus(pendingAction)}>
                Yes, {pendingAction.label.toLowerCase()} it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
