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
              Track an order
            </Button>
          }
        />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6" aria-busy="true">
        <div className="h-72 animate-pulse rounded-[14px] bg-sand" />
      </main>
    );
  }

  const firstName = order.name.split(' ')[0] || order.name;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="rounded-[14px] border border-line bg-card p-6 text-center sm:p-12">
        <CheckCircle2 className="mx-auto h-14 w-14 text-[#7FB069]" aria-hidden />
        <h1 className="mt-5 font-display text-4xl font-semibold text-ink sm:text-5xl">
          Thank you{firstName ? `, ${firstName}` : ''}.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Your order is confirmed and being packed. A receipt is on its way to your inbox.
        </p>
        <p className="mt-6 inline-block rounded-full border border-line bg-sand px-6 py-2.5 font-mono text-lg font-semibold tracking-wide text-ink">
          {order.number}
        </p>
        <p className="mt-3 text-sm text-muted">
          Confirmation sent to <span className="font-medium text-ink">{order.email}</span>
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push(`/track?number=${encodeURIComponent(order.number)}`)}
          >
            Track order
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push('/shop')}>
            Keep shopping
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-[14px] border border-line bg-card p-6" aria-label="Order status">
          <h2 className="font-display text-lg font-semibold text-ink">Order status</h2>
          <p className="mt-1 text-xs text-muted">Placed {formatDate(order.createdAt)}</p>
          <div className="mt-5">
            <OrderTimeline timeline={order.timeline} />
          </div>
        </section>

        <section className="rounded-[14px] border border-line bg-card p-6" aria-label="Order summary">
          <h2 className="font-display text-lg font-semibold text-ink">Summary</h2>
          <ul className="mt-4 space-y-3">
            {order.items.map((it, i) => (
              <li key={`${it.productId}-${i}`} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sand">
                  <Image src={it.image} alt={it.name} fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{it.name}</p>
                  <p className="text-xs text-muted">
                    Qty {it.qty}
                    {[it.color, it.size].filter(Boolean).join(' · ') && (
                      <> · {[it.color, it.size].filter(Boolean).join(' · ')}</>
                    )}
                  </p>
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
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6" aria-busy="true">
          <div className="h-72 animate-pulse rounded-[14px] bg-sand" />
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
