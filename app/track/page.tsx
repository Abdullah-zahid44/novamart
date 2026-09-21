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
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Order tracking</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Where&apos;s my order?
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Enter your order number below. Adding the checkout email keeps your order private.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mx-auto mt-8 max-w-2xl rounded-[14px] border border-line bg-card p-5 sm:p-6"
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
          <p role="alert" className="mt-3 text-sm text-[#B23A17]">
            {error}
          </p>
        )}
        <Button variant="primary" size="md" type="submit" className="mt-5 w-full sm:w-auto">
          <Search className="mr-2 h-4 w-4" />
          Track order
        </Button>
      </form>

      {order && meta && (
        <div className="mx-auto mt-8 max-w-2xl space-y-6">
          <section className="rounded-[14px] border border-line bg-card p-6" aria-label="Tracking result">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-lg font-semibold tracking-wide text-ink">{order.number}</p>
                <p className="text-xs text-muted">Placed {formatDate(order.createdAt)}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3.5 py-1.5 text-xs font-semibold text-ink">
                <span className={`h-2 w-2 rounded-full ${meta.dot}`} aria-hidden />
                {meta.label}
              </span>
            </div>
            <div className="mt-6">
              <OrderTimeline timeline={order.timeline} />
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-[14px] border border-line bg-card p-6" aria-label="Order items">
              <h2 className="font-display text-lg font-semibold text-ink">Items</h2>
              <ul className="mt-4 space-y-3">
                {order.items.map((it, i) => (
                  <li key={`${it.productId}-${i}`} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sand">
                      <Image src={it.image} alt={it.name} fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{it.name}</p>
                      <p className="text-xs text-muted">Qty {it.qty}</p>
                    </div>
                    <p className="tnum shrink-0 text-sm font-semibold text-ink">
                      {currency(it.price * it.qty)}
                    </p>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="tnum text-ink">{currency(order.subtotal)}</dd>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#2F5D34]">
                    <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</dt>
                    <dd className="tnum">−{currency(order.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted">Shipping</dt>
                  <dd className="tnum text-ink">
                    {order.shipping === 0 ? 'FREE' : currency(order.shipping)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Tax</dt>
                  <dd className="tnum text-ink">{currency(order.tax)}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2.5 text-base font-semibold text-ink">
                  <dt>Total</dt>
                  <dd className="tnum">{currency(order.total)}</dd>
                </div>
              </dl>
            </section>

            <div className="space-y-6">
              <section className="rounded-[14px] border border-line bg-card p-6" aria-label="Shipping address">
                <h2 className="font-display text-lg font-semibold text-ink">Shipping address</h2>
                <address className="mt-3 text-sm not-italic leading-relaxed text-muted">
                  <span className="font-semibold text-ink">{order.address.fullName}</span>
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
              <section className="rounded-[14px] border border-line bg-card p-6" aria-label="Payment method">
                <h2 className="font-display text-lg font-semibold text-ink">Payment</h2>
                <p className="mt-2 text-sm text-muted">
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
        <div className="mt-12 text-center text-muted">
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
          <div className="h-10 w-56 animate-pulse rounded-xl bg-sand" />
          <div className="mt-6 h-48 animate-pulse rounded-[14px] bg-sand" />
        </main>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
