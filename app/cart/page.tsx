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
        <div className="h-9 w-56 animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-slate-100" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          hint="You haven't added anything to your cart yet. Browse today's deals and find something you'll love."
          action={
            <Button variant="primary" size="lg" onClick={() => router.push('/shop')}>
              Start Shopping
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
        Your Cart{' '}
        <span className="text-base font-normal text-slate-500">
          ({count} {count === 1 ? 'item' : 'items'})
        </span>
      </h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section aria-label="Cart items">
          {/* Mobile: stacked cards */}
          <ul className="space-y-4 md:hidden">
            {items.map(item => {
              const key = cartLineKey(item.productId, item.color, item.size);
              const variant = [item.color, item.size].filter(Boolean).join(' · ');
              return (
                <li key={key} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${item.slug}`}
                          className="block truncate text-sm font-medium text-slate-900 hover:text-indigo-600"
                        >
                          {item.name}
                        </Link>
                        {variant && <p className="mt-0.5 text-xs text-slate-500">{variant}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.color, item.size)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="shrink-0 rounded p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QtySelector
                        value={item.qty}
                        max={99}
                        onChange={q => updateQty(item.productId, item.color, item.size, q)}
                      />
                      <p className="text-sm font-semibold text-slate-900">
                        {currency(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th scope="col" className="px-4 py-3 font-medium">Product</th>
                  <th scope="col" className="px-4 py-3 font-medium">Price</th>
                  <th scope="col" className="px-4 py-3 font-medium">Quantity</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                  <th scope="col" className="w-14 px-4 py-3">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => {
                  const key = cartLineKey(item.productId, item.color, item.size);
                  const variant = [item.color, item.size].filter(Boolean).join(' · ');
                  return (
                    <tr key={key}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/product/${item.slug}`}
                              className="font-medium text-slate-900 hover:text-indigo-600"
                            >
                              {item.name}
                            </Link>
                            {variant && <p className="mt-0.5 text-xs text-slate-500">{variant}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{currency(item.price)}</td>
                      <td className="px-4 py-4">
                        <QtySelector
                          value={item.qty}
                          max={99}
                          onChange={q => updateQty(item.productId, item.color, item.size, q)}
                        />
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-900">
                        {currency(item.price * item.qty)}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.color, item.size)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="rounded p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Link
            href="/shop"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>
        </section>

        <aside
          aria-label="Order summary"
          className="h-fit rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-4"
        >
          <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>

          <div className="mt-4">
            <CouponForm
              subtotal={subtotal}
              coupon={coupon}
              onApply={setCoupon}
              onRemove={() => setCoupon(null)}
            />
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="font-medium text-slate-900">{currency(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 && coupon && (
              <div className="flex justify-between text-emerald-700">
                <dt>Discount ({coupon.code})</dt>
                <dd className="font-medium">−{currency(totals.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-600">Shipping (est.)</dt>
              <dd className="font-medium text-slate-900">
                {totals.shipping === 0 ? 'FREE' : currency(totals.shipping)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Tax (est.)</dt>
              <dd className="font-medium text-slate-900">{currency(totals.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="font-bold text-slate-900">{currency(totals.total)}</dd>
            </div>
          </dl>

          <Button variant="primary" size="lg" className="mt-5 w-full" onClick={() => router.push('/checkout')}>
            <Lock className="mr-2 h-4 w-4" />
            Proceed to Checkout
          </Button>
          <p className="mt-3 text-center text-xs text-slate-500">
            Shipping method & final taxes are chosen at checkout.
          </p>
        </aside>
      </div>
    </main>
  );
}
