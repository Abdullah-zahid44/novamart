'use client';

import { useEffect, useState } from 'react';
import { Tag, X } from 'lucide-react';
import { validateCoupon } from '@/lib/store';
import { currency } from '@/lib/format';
import { Button } from '@/components/ui';
import { TextInput } from './fields';
import type { AppliedCoupon } from './cart-utils';

interface CouponFormProps {
  subtotal: number;
  coupon: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon) => void;
  onRemove: () => void;
}

function toApplied(code: string, discount: number | undefined, freeShip: boolean | undefined, type: string): AppliedCoupon {
  return {
    code,
    discount: discount ?? 0,
    freeShip: freeShip ?? type === 'freeship',
  };
}

export function CouponForm({ subtotal, coupon, onApply, onRemove }: CouponFormProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // Re-validate whenever the cart total changes so a coupon can never
  // stay applied to an order it no longer qualifies for.
  useEffect(() => {
    if (!coupon) return;
    const res = validateCoupon(coupon.code, subtotal);
    if (!res.ok || !res.coupon) {
      onRemove();
      setError(res.error ?? 'That coupon is no longer valid for this order.');
    } else if (res.discount !== coupon.discount || (res.freeShip ?? false) !== coupon.freeShip) {
      onApply(toApplied(res.coupon.code, res.discount, res.freeShip, res.coupon.type));
    }
    // Only re-run when the subtotal changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const apply = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Enter a coupon code first.');
      return;
    }
    const res = validateCoupon(trimmed, subtotal);
    if (!res.ok || !res.coupon) {
      setError(res.error ?? 'That coupon code is not valid.');
      return;
    }
    setError('');
    setCode('');
    onApply(toApplied(res.coupon.code, res.discount, res.freeShip, res.coupon.type));
  };

  if (coupon) {
    return (
      <div>
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2.5">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <Tag className="h-4 w-4" aria-hidden />
            {coupon.code}
            <span className="font-normal text-emerald-700">
              {coupon.freeShip ? '· free shipping applied' : `· ${currency(coupon.discount)} off applied`}
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              onRemove();
              setError('');
            }}
            aria-label={`Remove coupon ${coupon.code}`}
            className="rounded p-1 text-emerald-700 transition hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex-1">
          <TextInput
            value={code}
            onChange={e => {
              setCode(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                apply();
              }
            }}
            placeholder="Coupon code (try WELCOME10)"
            aria-label="Coupon code"
            error={error}
            className="uppercase"
          />
        </div>
        <Button variant="secondary" type="button" onClick={apply} className="shrink-0">
          Apply
        </Button>
      </div>
    </div>
  );
}
