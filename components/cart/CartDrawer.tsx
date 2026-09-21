'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, ShoppingCart, Trash2, Truck, X } from 'lucide-react';
import { useCart } from './CartShell';
import { cartLineKey, useStoreSettings } from './cart-utils';
import { Button, EmptyState, QtySelector } from '@/components/ui';
import { currency } from '@/lib/format';

export function CartDrawer() {
  const { items, updateQty, removeItem, subtotal, count, isOpen, setOpen } = useCart();
  const router = useRouter();
  const settings = useStoreSettings();

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, setOpen]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const freeShipOver = settings?.freeShipOver ?? 0;
  const remaining = Math.max(0, freeShipOver - subtotal);
  const progress = freeShipOver > 0 ? Math.min(100, (subtotal / freeShipOver) * 100) : 100;

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Your Cart{' '}
            <span className="text-sm font-normal text-slate-500">
              ({count} {count === 1 ? 'item' : 'items'})
            </span>
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <EmptyState
              icon={ShoppingCart}
              title="Your cart is empty"
              hint="Looks like you haven't added anything yet. Browse the latest deals and find something you'll love."
              action={
                <Button variant="primary" onClick={() => go('/shop')}>
                  Start Shopping
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {settings && (
              <div className="border-b border-slate-200 px-4 py-3">
                {remaining > 0 ? (
                  <p className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Truck className="h-4 w-4 text-indigo-600" />
                    Add <strong className="text-slate-900">{currency(remaining)}</strong> more for
                    FREE standard shipping
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                    <Truck className="h-4 w-4" />
                    You&apos;ve unlocked FREE standard shipping
                  </p>
                )}
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto px-4">
              {items.map(item => {
                const key = cartLineKey(item.productId, item.color, item.size);
                const variant = [item.color, item.size].filter(Boolean).join(' · ');
                return (
                  <li key={key} className="flex gap-3 py-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.color, item.size)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="shrink-0 rounded p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {variant && <p className="mt-0.5 text-xs text-slate-500">{variant}</p>}
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

            <div className="border-t border-slate-200 px-4 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-600">Subtotal</span>
                <span className="text-lg font-bold text-slate-900">{currency(subtotal)}</span>
              </div>
              <div className="space-y-2">
                <Button variant="primary" size="lg" className="w-full" onClick={() => go('/checkout')}>
                  <Lock className="mr-2 h-4 w-4" />
                  Checkout · {currency(subtotal)}
                </Button>
                <Button variant="outline" size="md" className="w-full" onClick={() => go('/cart')}>
                  View Cart
                </Button>
              </div>
              <p className="mt-3 text-center text-xs text-slate-500">
                Shipping & taxes calculated at checkout.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
