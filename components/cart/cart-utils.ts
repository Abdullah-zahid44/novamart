import { useEffect, useState } from 'react';
import { getSettings } from '@/lib/store';
import type { CartItem, StoreSettings } from '@/lib/types';

export interface AppliedCoupon {
  code: string;
  discount: number;
  freeShip: boolean;
}

export type ShippingMethod = 'standard' | 'express';

/** Flat rate for the express shipping option at checkout. */
export const EXPRESS_SHIPPING_COST = 12.99;

export interface Totals {
  subtotal: number;
  discount: number;
  afterDiscount: number;
  shipping: number;
  tax: number;
  total: number;
  /** True when standard shipping is free (threshold or freeship coupon). */
  freeShip: boolean;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function computeTotals(
  items: CartItem[],
  settings: StoreSettings,
  coupon: AppliedCoupon | null,
  shippingMethod: ShippingMethod = 'standard',
): Totals {
  const subtotal = round2(items.reduce((sum, i) => sum + i.price * i.qty, 0));
  const discount = Math.min(round2(coupon?.discount ?? 0), subtotal);
  const afterDiscount = round2(subtotal - discount);
  const freeShip = afterDiscount >= settings.freeShipOver || (coupon?.freeShip ?? false);

  let shipping = 0;
  if (items.length > 0) {
    if (shippingMethod === 'express') {
      shipping = EXPRESS_SHIPPING_COST;
    } else {
      shipping = freeShip ? 0 : settings.shippingFlat;
    }
  }

  const tax = round2(afterDiscount * settings.taxRate);
  const total = round2(afterDiscount + shipping + tax);
  return { subtotal, discount, afterDiscount, shipping, tax, total, freeShip };
}

/** SSR-safe access to store settings (localStorage is client-only). */
export function useStoreSettings(): StoreSettings | null {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  useEffect(() => {
    setSettings(getSettings());
  }, []);
  return settings;
}

/** Stable identity for a cart line: same product + same variant = one line. */
export function cartLineKey(productId: string, color?: string, size?: string): string {
  return `${productId}||${color ?? ''}||${size ?? ''}`;
}
