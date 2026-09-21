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
      {/* Sand backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-ink">
            Your cart{' '}
            <span className="font-sans text-sm font-normal text-muted">
              ({count} {count === 1 ? 'item' : 'items'})
            </span>
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="rounded-full p-2 text-muted transition hover:bg-sand hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <EmptyState
              icon={ShoppingCart}
              title="Nothing here yet"
              hint="Good taste takes a moment. Start with today's deals and find something worth keeping."
              action={
                <Button variant="primary" onClick={() => go('/shop')}>
                  Browse the shop
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {settings && (
              <div className="border-b border-line px-5 py-3.5">
                {remaining > 0 ? (
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <Truck className="h-4 w-4 text-accent" aria-hidden />
                    Add <strong className="tnum text-ink">{currency(remaining)}</strong> more for
                    free standard shipping
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-forest">
                    <Truck className="h-4 w-4" aria-hidden />
                    Free standard shipping, unlocked
                  </p>
                )}
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-line/60"
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <ul className="flex-1 divide-y divide-line/70 overflow-y-auto px-5">
              {items.map(item => {
                const key = cartLineKey(item.productId, item.color, item.size);
                const variant = [item.color, item.size].filter(Boolean).join(' · ');
                return (
                  <li key={key} className="flex gap-3.5 py-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand">
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
                        <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.color, item.size)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="shrink-0 rounded-full p-1.5 text-muted transition hover:bg-[#E26D5A]/10 hover:text-[#A33B2A]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {variant && <p className="mt-0.5 text-xs text-muted">{variant}</p>}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <QtySelector
                          value={item.qty}
                          max={99}
                          onChange={q => updateQty(item.productId, item.color, item.size, q)}
                        />
                        <p className="tnum text-sm font-semibold text-ink">
                          {currency(item.price * item.qty)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-line bg-card px-5 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted">Subtotal</span>
                <span className="tnum text-lg font-semibold text-ink">{currency(subtotal)}</span>
              </div>
              <div className="space-y-2">
                <Button variant="primary" size="lg" className="w-full" onClick={() => go('/checkout')}>
                  <Lock className="mr-2 h-4 w-4" />
                  Checkout · {currency(subtotal)}
                </Button>
                <Button variant="outline" size="md" className="w-full" onClick={() => go('/cart')}>
                  View cart
                </Button>
              </div>
              <p className="mt-3 text-center text-xs text-muted">
                Shipping and taxes figured out at checkout.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
