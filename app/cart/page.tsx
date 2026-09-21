'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/components/cart/CartShell';
import { CouponForm } from '@/components/cart/CouponForm';
import { cartLineKey, computeTotals, useStoreSettings, type AppliedCoupon } from '@/components/cart/cart-utils';
import { Button, EmptyState, QtySelector } from '@/components/ui';
import { currency } from '@/lib/format';

function LineItem({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: ReturnType<typeof useCart>['items'][number];
  onUpdateQty: (q: number) => void;
  onRemove: () => void;
}) {
  const variant = [item.color, item.size].filter(Boolean).join(' · ');
  return (
    <li className="flex gap-4 rounded-[14px] border border-line bg-card p-4">
      <Link
        href={`/product/${item.slug}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-sand"
      >
        <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/product/${item.slug}`}
              className="block truncate text-sm font-semibold text-ink hover:text-accent hover:underline"
            >
              {item.name}
            </Link>
            {variant && <p className="mt-0.5 text-xs text-muted">{variant}</p>}
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.name} from cart`}
            className="shrink-0 rounded-full p-1.5 text-muted transition hover:bg-[#E26D5A]/10 hover:text-[#A33B2A]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QtySelector value={item.qty} max={99} onChange={onUpdateQty} small />
          <p className="tnum text-sm font-semibold text-ink">{currency(item.price * item.qty)}</p>
        </div>
      </div>
    </li>
  );
}

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, count } = useCart();
  const settings = useStoreSettings();
  const router = useRouter();
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  const totals = useMemo(
    () => (settings ? computeTotals(items, settings, coupon, 'standard') : null),
    [items, settings, coupon],
  );

  if (!settings || !totals) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-busy="true">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-sand" />
        <div className="mt-6 h-64 animate-pulse rounded-[14px] bg-sand" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          hint="Good taste takes a moment. Start with today's deals and find something worth keeping."
          action={
            <Button variant="primary" size="lg" onClick={() => router.push('/shop')}>
              Browse the shop
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <p className="text-xs font-bold uppercase tracking-widest text-accent">Cart</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Your cart{' '}
        <span className="font-sans text-base font-normal text-muted">
          ({count} {count === 1 ? 'item' : 'items'})
        </span>
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section aria-label="Cart items">
          <ul className="space-y-4">
            {items.map(item => {
              const key = cartLineKey(item.productId, item.color, item.size);
              return (
                <LineItem
                  key={key}
                  item={item}
                  onUpdateQty={q => updateQty(item.productId, item.color, item.size, q)}
                  onRemove={() => removeItem(item.productId, item.color, item.size)}
                />
              );
            })}
          </ul>

          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-deep hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Keep shopping
          </Link>
        </section>

        <aside
          aria-label="Order summary"
          className="h-fit rounded-[14px] border border-line bg-sand p-6 lg:sticky lg:top-4"
        >
          <h2 className="font-display text-xl font-semibold text-ink">Order summary</h2>

          <div className="mt-4">
            <CouponForm
              subtotal={subtotal}
              coupon={coupon}
              onApply={setCoupon}
              onRemove={() => setCoupon(null)}
            />
          </div>

          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tnum font-medium text-ink">{currency(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 && coupon && (
              <div className="flex justify-between text-[#2F5D34]">
                <dt>Discount ({coupon.code})</dt>
                <dd className="tnum font-medium">−{currency(totals.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Shipping (est.)</dt>
              <dd className="tnum font-medium text-ink">
                {totals.shipping === 0 ? 'FREE' : currency(totals.shipping)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Tax (est.)</dt>
              <dd className="tnum font-medium text-ink">{currency(totals.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3.5 text-base">
              <dt className="font-semibold text-ink">Total</dt>
              <dd className="tnum font-semibold text-ink">{currency(totals.total)}</dd>
            </div>
          </dl>

          <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => router.push('/checkout')}>
            <Lock className="mr-2 h-4 w-4" />
            Checkout · {currency(totals.total)}
          </Button>
          <p className="mt-3 text-center text-xs text-muted">
            Final shipping and taxes are set at checkout.
          </p>
        </aside>
      </div>
    </main>
  );
}
