'use client';

import { Suspense, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { PackageSearch, Search } from 'lucide-react';
import { OrderTimeline } from '@/components/cart/OrderTimeline';
import { Field, TextInput } from '@/components/cart/fields';
import { Button } from '@/components/ui';
import { currency, formatDate, orderStatusMeta } from '@/lib/format';
import { getOrderByNumber } from '@/lib/store';
import type { Order } from '@/lib/types';

function TrackContent() {
  const params = useSearchParams();
  const [number, setNumber] = useState(() => params.get('number') ?? '');
  const [email, setEmail] = useState(() => params.get('email') ?? '');
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  const lookup = (num: string, em: string) => {
    const n = num.trim();
    const e = em.trim().toLowerCase();
    if (!n) {
      setError('Enter your order number.');
      setOrder(null);
      return;
    }
    const found = getOrderByNumber(n);
    if (!found) {
      setError(`We couldn't find order "${n}". Check the number and try again.`);
      setOrder(null);
      return;
    }
    if (e && found.email.trim().toLowerCase() !== e) {
      setError("That email doesn't match this order. Use the email from your order confirmation.");
      setOrder(null);
      return;
    }
    setError('');
    setOrder(found);
  };

  // Auto-look up when opened with ?number= (e.g. from the order confirmation page).
  useEffect(() => {
    const num = params.get('number');
    if (num) lookup(num, params.get('email') ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    lookup(number, email);
  };

  const meta = order ? orderStatusMeta[order.status] : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Track Your Order</h1>
      <p className="mt-2 text-slate-600">
        Enter your order number. Adding the email you checked out with keeps your order private.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-5"
        aria-label="Order lookup"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Order number" htmlFor="track-number">
            <TextInput
              id="track-number"
              value={number}
              onChange={e => setNumber(e.target.value)}
              placeholder="e.g. NM-001001"
              autoComplete="off"
            />
          </Field>
          <Field label="Email address (optional)" htmlFor="track-email">
            <TextInput
              id="track-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Field>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-rose-600">
            {error}
          </p>
        )}
        <Button variant="primary" size="md" type="submit" className="mt-4">
          <Search className="mr-2 h-4 w-4" />
          Track Order
        </Button>
      </form>

      {order && meta && (
        <div className="mt-6 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5" aria-label="Tracking result">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-lg font-semibold text-slate-900">{order.number}</p>
                <p className="text-xs text-slate-500">Placed {formatDate(order.createdAt)}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <span className={`h-2 w-2 rounded-full ${meta.dot}`} aria-hidden />
                {meta.label}
              </span>
            </div>
            <div className="mt-5">
              <OrderTimeline timeline={order.timeline} />
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5" aria-label="Order items">
              <h2 className="text-base font-semibold text-slate-900">Items</h2>
              <ul className="mt-3 space-y-3">
                {order.items.map((it, i) => (
                  <li key={`${it.productId}-${i}`} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <Image src={it.image} alt={it.name} fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{it.name}</p>
                      <p className="text-xs text-slate-500">Qty {it.qty}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-900">
                      {currency(it.price * it.qty)}
                    </p>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">Subtotal</dt>
                  <dd className="text-slate-900">{currency(order.subtotal)}</dd>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</dt>
                    <dd>−{currency(order.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-600">Shipping</dt>
                  <dd className="text-slate-900">
                    {order.shipping === 0 ? 'FREE' : currency(order.shipping)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Tax</dt>
                  <dd className="text-slate-900">{currency(order.tax)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
                  <dt>Total</dt>
                  <dd>{currency(order.total)}</dd>
                </div>
              </dl>
            </section>

            <div className="space-y-6">
              <section className="rounded-xl border border-slate-200 bg-white p-5" aria-label="Shipping address">
                <h2 className="text-base font-semibold text-slate-900">Shipping Address</h2>
                <address className="mt-3 text-sm not-italic leading-relaxed text-slate-600">
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
              </section>
              <section className="rounded-xl border border-slate-200 bg-white p-5" aria-label="Payment method">
                <h2 className="text-base font-semibold text-slate-900">Payment</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {order.paymentMethod === 'card'
                    ? `Card ending in ${order.paymentLast4 ?? '····'}`
                    : order.paymentMethod}
                </p>
              </section>
            </div>
          </div>
        </div>
      )}

      {!order && !error && (
        <div className="mt-10 text-center text-slate-400">
          <PackageSearch className="mx-auto h-12 w-12" aria-hidden />
          <p className="mt-2 text-sm">Your tracking details will appear here.</p>
        </div>
      )}
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6" aria-busy="true">
          <div className="h-9 w-56 animate-pulse rounded-lg bg-slate-100" />
          <div className="mt-6 h-48 animate-pulse rounded-xl bg-slate-100" />
        </main>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
