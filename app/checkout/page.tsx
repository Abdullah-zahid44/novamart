'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
  Lock,
  ShieldAlert,
  Truck,
} from 'lucide-react';
import { useCart } from '@/components/cart/CartShell';
import { CouponForm } from '@/components/cart/CouponForm';
import { Field, SelectInput, TextInput } from '@/components/cart/fields';
import {
  cartLineKey,
  computeTotals,
  EXPRESS_SHIPPING_COST,
  useStoreSettings,
  type AppliedCoupon,
  type ShippingMethod,
} from '@/components/cart/cart-utils';
import { Button } from '@/components/ui';
import { currency } from '@/lib/format';
import { adjustStock, createOrder, currentUser, getCart } from '@/lib/store';
import type { Address, OrderItem } from '@/lib/types';

const STEPS = ['Information', 'Shipping', 'Payment', 'Review'];

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Ireland',
  'Australia',
  'Germany',
  'France',
  'Pakistan',
  'India',
  'United Arab Emirates',
  'Saudi Arabia',
  'Singapore',
];

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatCardNumber(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
}

function cardBrand(num: string) {
  const d = num.replace(/\D/g, '');
  if (/^4/.test(d)) return 'Visa';
  if (/^5[1-5]/.test(d)) return 'Mastercard';
  if (/^3[47]/.test(d)) return 'American Express';
  if (/^6/.test(d)) return 'Discover';
  return 'Card';
}

function ReviewRow({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Edit
        </button>
      </div>
      <div className="text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
  const settings = useStoreSettings();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState<Address>({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    postal: '',
    country: 'United States',
  });
  const [method, setMethod] = useState<ShippingMethod>('standard');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);

  // Empty carts don't belong here. Read the store directly (not the context)
  // so the guard can never race the cart provider's hydration.
  useEffect(() => {
    let stored: ReturnType<typeof getCart> = [];
    try {
      stored = getCart();
    } catch {
      stored = [];
    }
    if (stored.length === 0) {
      router.replace('/cart');
      return;
    }
    try {
      const u = currentUser();
      if (u) {
        setEmail(prev => prev || u.email);
        setAddress(prev => (prev.fullName ? prev : { ...prev, fullName: u.name }));
      }
    } catch {
      // Not signed in — guest checkout.
    }
  }, [router]);

  const totals = useMemo(
    () => (settings ? computeTotals(items, settings, coupon, method) : null),
    [items, settings, coupon, method],
  );
  const standardTotals = useMemo(
    () => (settings ? computeTotals(items, settings, coupon, 'standard') : null),
    [items, settings, coupon],
  );

  const setAddr = (patch: Partial<Address>) => setAddress(a => ({ ...a, ...patch }));
  const clearErr = (key: string) =>
    setErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const validateInfo = () => {
    const e: Record<string, string> = {};
    if (!emailRe.test(email.trim())) e.email = 'Enter a valid email address.';
    if (address.fullName.trim().length < 2) e.fullName = 'Enter your full name.';
    if (address.phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a valid phone number.';
    if (address.street.trim().length < 3) e.street = 'Enter your street address.';
    if (address.city.trim().length < 2) e.city = 'Enter your city.';
    if (address.postal.trim().length < 3) e.postal = 'Enter your ZIP / postal code.';
    if (!address.country) e.country = 'Select a country.';
    return e;
  };

  const validatePayment = () => {
    const e: Record<string, string> = {};
    if (cardName.trim().length < 2) e.cardName = 'Enter the name on the card.';
    if (cardNumber.replace(/\D/g, '').length < 15) e.cardNumber = 'Enter a valid card number.';
    const m = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!m) {
      e.expiry = 'Use MM/YY format.';
    } else if (new Date(2000 + Number(m[2]), Number(m[1]), 1) <= new Date()) {
      e.expiry = 'This card has expired.';
    }
    if (!/^\d{3,4}$/.test(cvc)) e.cvc = 'Enter the 3–4 digit security code.';
    return e;
  };

  const goNext = () => {
    const e = step === 1 ? validateInfo() : step === 3 ? validatePayment() : {};
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setStep(s => Math.min(4, s + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    setErrors({});
    setStep(s => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const placeOrder = async (ev: FormEvent) => {
    ev.preventDefault();
    if (placing) return;
    if (!settings || !totals || items.length === 0) {
      // Cart was emptied mid-checkout (e.g. from the drawer) — nothing to place.
      router.replace('/cart');
      return;
    }
    setPlacing(true);
    try {
      await new Promise(res => setTimeout(res, 900));
      const orderItems: OrderItem[] = items.map(i => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        image: i.image,
        color: i.color,
        size: i.size,
      }));
      const order = createOrder({
        email: email.trim(),
        name: address.fullName.trim(),
        items: orderItems,
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        couponCode: coupon?.code,
        status: 'pending',
        paymentMethod: 'card',
        paymentLast4: cardNumber.replace(/\D/g, '').slice(-4),
        address: {
          fullName: address.fullName.trim(),
          phone: address.phone.trim(),
          street: address.street.trim(),
          city: address.city.trim(),
          postal: address.postal.trim(),
          country: address.country,
        },
      });
      // createOrder() already marks the coupon as used (see lib/store).
      // Decrement stock for every purchased line, then empty the cart.
      items.forEach(i => adjustStock(i.productId, -i.qty));
      clear();
      router.push(`/order-success?number=${encodeURIComponent(order.number)}`);
    } finally {
      setPlacing(false);
    }
  };

  if (!settings || !totals || !standardTotals) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-busy="true">
        <div className="h-9 w-56 animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="h-96 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </main>
    );
  }

  const last4 = cardNumber.replace(/\D/g, '').slice(-4);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Checkout</h1>

      <ol className="mb-8 mt-6 flex items-center" aria-label="Checkout steps">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                onClick={() => {
                  if (n < step) {
                    setErrors({});
                    setStep(n);
                  }
                }}
                disabled={n > step}
                aria-current={active ? 'step' : undefined}
                className={`flex items-center gap-2 ${n > step ? 'cursor-not-allowed' : ''}`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition ${
                    done || active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  } ${active ? 'ring-4 ring-indigo-100' : ''}`}
                >
                  {done ? <Check className="h-4 w-4" /> : n}
                </span>
                <span
                  className={`hidden text-sm font-medium sm:block ${
                    active ? 'text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {label}
                </span>
              </button>
              {n < STEPS.length && (
                <span
                  aria-hidden
                  className={`mx-2 h-0.5 flex-1 sm:mx-4 ${n < step ? 'bg-indigo-600' : 'bg-slate-200'}`}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {step === 1 && (
            <section aria-label="Contact and shipping address" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">Contact & Shipping Address</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Email address" htmlFor="co-email">
                    <TextInput
                      id="co-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        clearErr('email');
                      }}
                      placeholder="you@example.com"
                      error={errors.email}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Full name" htmlFor="co-name">
                    <TextInput
                      id="co-name"
                      autoComplete="name"
                      value={address.fullName}
                      onChange={e => {
                        setAddr({ fullName: e.target.value });
                        clearErr('fullName');
                      }}
                      placeholder="Jane Cooper"
                      error={errors.fullName}
                    />
                  </Field>
                </div>
                <Field label="Phone" htmlFor="co-phone">
                  <TextInput
                    id="co-phone"
                    type="tel"
                    autoComplete="tel"
                    value={address.phone}
                    onChange={e => {
                      setAddr({ phone: e.target.value });
                      clearErr('phone');
                    }}
                    placeholder="+1 555 010 2030"
                    error={errors.phone}
                  />
                </Field>
                <Field label="Country" htmlFor="co-country">
                  <SelectInput
                    id="co-country"
                    autoComplete="country-name"
                    value={address.country}
                    onChange={e => {
                      setAddr({ country: e.target.value });
                      clearErr('country');
                    }}
                    error={errors.country}
                  >
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Street address" htmlFor="co-street">
                    <TextInput
                      id="co-street"
                      autoComplete="street-address"
                      value={address.street}
                      onChange={e => {
                        setAddr({ street: e.target.value });
                        clearErr('street');
                      }}
                      placeholder="221B Baker Street, Apt 4"
                      error={errors.street}
                    />
                  </Field>
                </div>
                <Field label="City" htmlFor="co-city">
                  <TextInput
                    id="co-city"
                    autoComplete="address-level2"
                    value={address.city}
                    onChange={e => {
                      setAddr({ city: e.target.value });
                      clearErr('city');
                    }}
                    placeholder="Austin"
                    error={errors.city}
                  />
                </Field>
                <Field label="ZIP / Postal code" htmlFor="co-postal">
                  <TextInput
                    id="co-postal"
                    autoComplete="postal-code"
                    value={address.postal}
                    onChange={e => {
                      setAddr({ postal: e.target.value });
                      clearErr('postal');
                    }}
                    placeholder="78701"
                    error={errors.postal}
                  />
                </Field>
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="primary" size="lg" type="button" onClick={goNext}>
                  Continue to Shipping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section aria-label="Shipping method" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">Shipping Method</h2>
              <div className="mt-5 space-y-3" role="radiogroup" aria-label="Shipping options">
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                    method === 'standard'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping-method"
                    value="standard"
                    checked={method === 'standard'}
                    onChange={() => setMethod('standard')}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <Truck className="h-6 w-6 shrink-0 text-slate-500" aria-hidden />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-slate-900">Standard</span>
                    <span className="block text-xs text-slate-500">3–5 business days</span>
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {standardTotals.shipping === 0 ? (
                      <span className="text-emerald-700">FREE</span>
                    ) : (
                      currency(standardTotals.shipping)
                    )}
                  </span>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                    method === 'express'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping-method"
                    value="express"
                    checked={method === 'express'}
                    onChange={() => setMethod('express')}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <Truck className="h-6 w-6 shrink-0 text-slate-500" aria-hidden />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-slate-900">Express</span>
                    <span className="block text-xs text-slate-500">1–2 business days · always charged</span>
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {currency(EXPRESS_SHIPPING_COST)}
                  </span>
                </label>
              </div>
              {standardTotals.freeShip && (
                <p className="mt-3 text-xs text-emerald-700">
                  Your order qualifies for free standard shipping.
                </p>
              )}
              <div className="mt-6 flex justify-between">
                <Button variant="outline" type="button" onClick={goBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button variant="primary" size="lg" type="button" onClick={goNext}>
                  Continue to Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section aria-label="Payment" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">Payment</h2>
              <div
                role="note"
                className="mt-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4"
              >
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
                <p className="text-sm text-amber-900">
                  <strong>Demo checkout — no real charge.</strong> This store is a demo; no payment
                  is processed. Please don&apos;t enter a real card number.
                </p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Name on card" htmlFor="co-cardname">
                    <TextInput
                      id="co-cardname"
                      autoComplete="cc-name"
                      value={cardName}
                      onChange={e => {
                        setCardName(e.target.value);
                        clearErr('cardName');
                      }}
                      placeholder="Jane Cooper"
                      error={errors.cardName}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Card number" htmlFor="co-cardnum">
                    <div className="relative">
                      <TextInput
                        id="co-cardnum"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        value={cardNumber}
                        onChange={e => {
                          setCardNumber(formatCardNumber(e.target.value));
                          clearErr('cardNumber');
                        }}
                        placeholder="4242 4242 4242 4242"
                        error={errors.cardNumber}
                        className="pr-10"
                      />
                      <CreditCard
                        className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                        aria-hidden
                      />
                    </div>
                  </Field>
                </div>
                <Field label="Expiry (MM/YY)" htmlFor="co-exp">
                  <TextInput
                    id="co-exp"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    value={expiry}
                    onChange={e => {
                      setExpiry(formatExpiry(e.target.value));
                      clearErr('expiry');
                    }}
                    placeholder="08/28"
                    error={errors.expiry}
                  />
                </Field>
                <Field label="Security code (CVC)" htmlFor="co-cvc">
                  <TextInput
                    id="co-cvc"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={cvc}
                    onChange={e => {
                      setCvc(e.target.value.replace(/\D/g, '').slice(0, 4));
                      clearErr('cvc');
                    }}
                    placeholder="123"
                    error={errors.cvc}
                  />
                </Field>
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" type="button" onClick={goBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button variant="primary" size="lg" type="button" onClick={goNext}>
                  Review Order
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </section>
          )}

          {step === 4 && (
            <form onSubmit={placeOrder} aria-label="Review and place order">
              <div className="space-y-4">
                <ReviewRow title="Contact" onEdit={() => setStep(1)}>
                  {email}
                </ReviewRow>
                <ReviewRow title="Ship to" onEdit={() => setStep(1)}>
                  {address.fullName}
                  <br />
                  {address.street}
                  <br />
                  {address.city}, {address.postal}
                  <br />
                  {address.country}
                  <br />
                  {address.phone}
                </ReviewRow>
                <ReviewRow title="Shipping method" onEdit={() => setStep(2)}>
                  {method === 'standard' ? 'Standard (3–5 business days)' : 'Express (1–2 business days)'}{' '}
                  — {totals.shipping === 0 ? 'FREE' : currency(totals.shipping)}
                </ReviewRow>
                <ReviewRow title="Payment" onEdit={() => setStep(3)}>
                  {cardBrand(cardNumber)} ending in {last4 || '····'} · {cardName}
                  <br />
                  <span className="text-xs text-slate-500">Demo payment — no real charge.</span>
                </ReviewRow>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button variant="outline" type="button" onClick={goBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button variant="primary" size="lg" type="submit" disabled={placing}>
                  {placing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing your order…
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Place Order · {currency(totals.total)}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        <aside
          aria-label="Order summary"
          className="h-fit rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-4"
        >
          <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto">
            {items.map(item => {
              const key = cartLineKey(item.productId, item.color, item.size);
              const variant = [item.color, item.size].filter(Boolean).join(' · ');
              return (
                <li key={key} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                    <span className="absolute -right-0 -top-0 flex h-5 w-5 items-center justify-center rounded-bl-lg bg-slate-900/70 text-[10px] font-semibold text-white">
                      {item.qty}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                    {variant && <p className="truncate text-xs text-slate-500">{variant}</p>}
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-slate-900">
                    {currency(item.price * item.qty)}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <CouponForm
              subtotal={totals.subtotal}
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
              <dt className="text-slate-600">
                Shipping ({method === 'standard' ? 'Standard' : 'Express'})
              </dt>
              <dd className="font-medium text-slate-900">
                {totals.shipping === 0 ? 'FREE' : currency(totals.shipping)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Tax</dt>
              <dd className="font-medium text-slate-900">{currency(totals.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="font-bold text-slate-900">{currency(totals.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </main>
  );
}
