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
    <section className="rounded-[14px] border border-line bg-card p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-accent hover:text-accent-deep hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

const stepShell = 'rounded-[14px] border border-line bg-card p-5 sm:p-7';

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
        <div className="h-10 w-56 animate-pulse rounded-xl bg-sand" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="h-96 animate-pulse rounded-[14px] bg-sand" />
          <div className="h-72 animate-pulse rounded-[14px] bg-sand" />
        </div>
      </main>
    );
  }

  const last4 = cardNumber.replace(/\D/g, '').slice(-4);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <p className="text-xs font-bold uppercase tracking-widest text-accent">Checkout</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Almost yours
      </h1>

      {/* Progress indicator */}
      <ol className="mb-10 mt-8 flex items-center" aria-label="Checkout steps">
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
                className={`flex items-center gap-2.5 ${n > step ? 'cursor-not-allowed' : ''}`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                    done
                      ? 'bg-forest text-paper'
                      : active
                        ? 'bg-accent text-white ring-4 ring-accent/20'
                        : 'bg-sand text-muted'
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : n}
                </span>
                <span
                  className={`hidden text-sm font-medium sm:block ${
                    active ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {label}
                </span>
              </button>
              {n < STEPS.length && (
                <span
                  aria-hidden
                  className={`mx-2 h-0.5 flex-1 rounded-full sm:mx-4 ${n < step ? 'bg-accent' : 'bg-line'}`}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {step === 1 && (
            <section aria-label="Contact and shipping address" className={stepShell}>
              <h2 className="font-display text-2xl font-semibold text-ink">Where is it going?</h2>
              <p className="mt-1 text-sm text-muted">We only ask for what the courier needs.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
              <div className="mt-7 flex justify-end">
                <Button variant="primary" size="lg" type="button" onClick={goNext}>
                  Continue to shipping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section aria-label="Shipping method" className={stepShell}>
              <h2 className="font-display text-2xl font-semibold text-ink">How fast?</h2>
              <p className="mt-1 text-sm text-muted">Pick a pace. Standard is on us over $75.</p>
              <div className="mt-6 space-y-3" role="radiogroup" aria-label="Shipping options">
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-[14px] border p-4 transition ${
                    method === 'standard'
                      ? 'border-accent bg-accent/[0.06] ring-1 ring-accent'
                      : 'border-line bg-card hover:border-ink/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping-method"
                    value="standard"
                    checked={method === 'standard'}
                    onChange={() => setMethod('standard')}
                    className="h-4 w-4 accent-[#E4572E]"
                  />
                  <Truck className="h-6 w-6 shrink-0 text-muted" aria-hidden />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-ink">Standard</span>
                    <span className="block text-xs text-muted">3–5 business days</span>
                  </span>
                  <span className="tnum text-sm font-semibold text-ink">
                    {standardTotals.shipping === 0 ? (
                      <span className="text-[#2F5D34]">FREE</span>
                    ) : (
                      currency(standardTotals.shipping)
                    )}
                  </span>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-[14px] border p-4 transition ${
                    method === 'express'
                      ? 'border-accent bg-accent/[0.06] ring-1 ring-accent'
                      : 'border-line bg-card hover:border-ink/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping-method"
                    value="express"
                    checked={method === 'express'}
                    onChange={() => setMethod('express')}
                    className="h-4 w-4 accent-[#E4572E]"
                  />
                  <Truck className="h-6 w-6 shrink-0 text-muted" aria-hidden />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-ink">Express</span>
                    <span className="block text-xs text-muted">1–2 business days · always charged</span>
                  </span>
                  <span className="tnum text-sm font-semibold text-ink">
                    {currency(EXPRESS_SHIPPING_COST)}
                  </span>
                </label>
              </div>
              {standardTotals.freeShip && (
                <p className="mt-3 text-xs font-medium text-[#2F5D34]">
                  Your order qualifies for free standard shipping.
                </p>
              )}
              <div className="mt-7 flex justify-between">
                <Button variant="outline" type="button" onClick={goBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button variant="primary" size="lg" type="button" onClick={goNext}>
                  Continue to payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section aria-label="Payment" className={stepShell}>
              <h2 className="font-display text-2xl font-semibold text-ink">Payment</h2>
              {/* Ink callout — demo notice, never an ugly yellow box */}
              <div
                role="note"
                className="mt-5 flex items-start gap-3.5 rounded-[14px] bg-ink p-5"
              >
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-paper" aria-hidden />
                <div className="text-sm leading-relaxed text-paper/90">
                  <p className="font-semibold text-paper">Demo checkout — no real charge.</p>
                  <p className="mt-1">
                    This storefront is a demonstration. No payment is processed here, so please
                    don&apos;t enter a real card number.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
                        className="pr-11"
                      />
                      <CreditCard
                        className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
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
              <div className="mt-7 flex justify-between">
                <Button variant="outline" type="button" onClick={goBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button variant="primary" size="lg" type="button" onClick={goNext}>
                  Review order
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
                  <span className="text-xs text-muted">Demo payment — no real charge.</span>
                </ReviewRow>
              </div>
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
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
                      Place order · {currency(totals.total)}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Summary sidebar */}
        <aside
          aria-label="Order summary"
          className="h-fit rounded-[14px] border border-line bg-sand p-6 lg:sticky lg:top-4"
        >
          <h2 className="font-display text-xl font-semibold text-ink">Order summary</h2>
          <ul className="mt-4 max-h-64 space-y-3.5 overflow-y-auto">
            {items.map(item => {
              const key = cartLineKey(item.productId, item.color, item.size);
              const variant = [item.color, item.size].filter(Boolean).join(' · ');
              return (
                <li key={key} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-card">
                    <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                    <span className="tnum absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-bl-xl bg-ink/75 px-1 text-[10px] font-semibold text-paper">
                      {item.qty}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                    {variant && <p className="truncate text-xs text-muted">{variant}</p>}
                  </div>
                  <p className="tnum shrink-0 text-sm font-semibold text-ink">
                    {currency(item.price * item.qty)}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 border-t border-line pt-4">
            <CouponForm
              subtotal={totals.subtotal}
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
              <dt className="text-muted">
                Shipping ({method === 'standard' ? 'Standard' : 'Express'})
              </dt>
              <dd className="tnum font-medium text-ink">
                {totals.shipping === 0 ? 'FREE' : currency(totals.shipping)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Tax</dt>
              <dd className="tnum font-medium text-ink">{currency(totals.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3.5 text-base">
              <dt className="font-semibold text-ink">Total</dt>
              <dd className="tnum font-semibold text-ink">{currency(totals.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </main>
  );
}
