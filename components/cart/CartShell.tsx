'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getCart, setCart } from '@/lib/store';
import type { CartItem } from '@/lib/types';
import { cartLineKey } from './cart-utils';
import { CartDrawer } from './CartDrawer';

export type NewCartItem = Omit<CartItem, 'qty'> & { qty?: number };

interface CartContextValue {
  items: CartItem[];
  addItem: (item: NewCartItem) => void;
  removeItem: (productId: string, color?: string, size?: string) => void;
  updateQty: (productId: string, color?: string, size?: string, qty?: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Hydrate from localStorage after mount (SSR has no localStorage).
  useEffect(() => {
    try {
      setItems(getCart());
    } catch {
      setItems([]);
    }
    setHydrated(true);
  }, []);

  // Persist every change back to localStorage (never before hydration,
  // so an empty first render can never wipe a stored cart).
  useEffect(() => {
    if (!hydrated) return;
    try {
      setCart(items);
    } catch {
      // Storage unavailable (private mode etc.) — cart still works in memory.
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: NewCartItem) => {
    const qty = Math.max(1, Math.floor(item.qty ?? 1));
    setItems(prev => {
      const key = cartLineKey(item.productId, item.color, item.size);
      const existing = prev.find(p => cartLineKey(p.productId, p.color, p.size) === key);
      if (existing) {
        return prev.map(p =>
          cartLineKey(p.productId, p.color, p.size) === key
            ? { ...p, qty: Math.min(99, p.qty + qty) }
            : p,
        );
      }
      return [
        ...prev,
        {
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          price: item.price,
          image: item.image,
          color: item.color,
          size: item.size,
          qty,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: string, color?: string, size?: string) => {
    const key = cartLineKey(productId, color, size);
    setItems(prev => prev.filter(p => cartLineKey(p.productId, p.color, p.size) !== key));
  }, []);

  const updateQty = useCallback((productId: string, color?: string, size?: string, qty: number = 1) => {
    const key = cartLineKey(productId, color, size);
    setItems(prev => {
      if (qty <= 0) {
        return prev.filter(p => cartLineKey(p.productId, p.color, p.size) !== key);
      }
      return prev.map(p =>
        cartLineKey(p.productId, p.color, p.size) === key
          ? { ...p, qty: Math.min(99, Math.floor(qty)) }
          : p,
      );
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({ items, addItem, removeItem, updateQty, clear, count, subtotal, isOpen, setOpen: setIsOpen }),
    [items, addItem, removeItem, updateQty, clear, count, subtotal, isOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Wraps page content with the cart provider and renders the slide-over
 * cart drawer. Mounted once in app/layout.tsx.
 */
export function CartShell({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside <CartShell>');
  }
  return ctx;
}
