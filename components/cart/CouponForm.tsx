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
      setError("That code doesn't work here. Check the spelling?");
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
      setError("That code doesn't work here. Check the spelling?");
      return;
    }
    setError('');
    setCode('');
    onApply(toApplied(res.coupon.code, res.discount, res.freeShip, res.coupon.type));
  };

  if (coupon) {
    return (
      <div>
        <div className="flex items-center justify-between rounded-xl bg-sand px-3.5 py-2.5">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Tag className="h-4 w-4 text-accent" aria-hidden />
            <span className="font-mono tracking-wide">{coupon.code}</span>
            <span className="font-normal text-muted">
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
            className="rounded-full p-1.5 text-muted transition hover:bg-line/70 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-[#B23A17]">{error}</p>}
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
