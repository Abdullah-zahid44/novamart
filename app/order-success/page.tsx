'use client';

import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, PackageSearch } from 'lucide-react';
import { OrderTimeline } from '@/components/cart/OrderTimeline';
import { Button, EmptyState } from '@/components/ui';
import { currency, formatDate } from '@/lib/format';
import { getOrderByNumber } from '@/lib/store';
import type { Order } from '@/lib/types';

function OrderSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const number = (params.get('number') ?? '').trim();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!number) {
      setNotFound(true);
      return;
    }
    const found = getOrderByNumber(number);
    if (found) setOrder(found);
    else setNotFound(true);
  }, [number]);

  if (notFound) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={PackageSearch}
          title="Order not found"
          hint="We couldn't find an order with that number. Check the link you followed, or track your order with its number and email."
          action={
            <Button variant="primary" onClick={() => router.push('/track')}>
              Track an Order
            </Button>
          }
        />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6" aria-busy="true">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
      </main>
    );
  }

  const firstName = order.name.split(' ')[0] || order.name;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center sm:p-10">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" aria-hidden />
        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
          Thank you, {firstName}!
        </h1>
        <p className="mt-2 text-slate-600">
          Your order is confirmed and our team is getting it ready.
        </p>
        <p className="mt-5 inline-block rounded-lg bg-slate-100 px-5 py-2.5 font-mono text-lg font-semibold tracking-wide text-slate-900">
          {order.number}
        </p>
        <p className="mt-3 text-sm text-slate-500">
          A confirmation was sent to{' '}
          <span className="font-medium text-slate-700">{order.email}</span>
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push(`/track?number=${encodeURIComponent(order.number)}`)}
          >
            Track Order
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push('/shop')}>
            Continue Shopping
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5" aria-label="Order status">
          <h2 className="text-base font-semibold text-slate-900">Order Status</h2>
          <p className="mt-1 text-xs text-slate-500">Placed {formatDate(order.createdAt)}</p>
          <div className="mt-4">
            <OrderTimeline timeline={order.timeline} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5" aria-label="Order summary">
          <h2 className="text-base font-semibold text-slate-900">Summary</h2>
          <ul className="mt-3 space-y-3">
            {order.items.map((it, i) => (
              <li key={`${it.productId}-${i}`} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <Image src={it.image} alt={it.name} fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{it.name}</p>
                  <p className="text-xs text-slate-500">
                    Qty {it.qty}
                    {[it.color, it.size].filter(Boolean).join(' · ') && (
                      <> · {[it.color, it.size].filter(Boolean).join(' · ')}</>
                    )}
                  </p>
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
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6" aria-busy="true">
          <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
