'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CheckCircle2, Zap } from 'lucide-react';
import { getCategories } from '@/lib/store';

const SUPPORT_LINKS = [
  { href: '/track', label: 'Track your order' },
  { href: '/shipping', label: 'Shipping & returns' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact us' },
];

const COMPANY_LINKS = [
  { href: '/about', label: 'About NovaMart' },
  { href: '/deals', label: "Today's deals" },
  { href: '/privacy', label: 'Privacy policy' },
  { href: '/terms', label: 'Terms of service' },
];

const PAYMENTS = ['VISA', 'Mastercard', 'Amex', 'PayPal', 'Apple Pay'];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState('');

  let categories: { slug: string; name: string }[] = [];
  try {
    categories = getCategories();
  } catch {
    /* store unavailable during prerender */
  }

  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setSubscribed(true);
  };

  return (
    <footer className="bg-[#1E1B4B] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Shop</h3>
            <ul className="space-y-2.5 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/shop/${c.slug}`} className="transition-colors hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="transition-colors hover:text-white">
                  All products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Support</h3>
            <ul className="space-y-2.5 text-sm">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Company</h3>
            <ul className="space-y-2.5 text-sm">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">
              Stay in the loop
            </h3>
            <p className="mb-4 text-sm text-slate-400">
              New arrivals, exclusive deals, and 10% off your first order when you join.
            </p>
            {subscribed ? (
              <p className="flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2.5 text-sm font-medium text-emerald-300">
                <CheckCircle2 size={16} aria-hidden />
                You&apos;re on the list. Welcome aboard!
              </p>
            ) : (
              <form onSubmit={subscribe} noValidate>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-label="Email address"
                    className="h-10 min-w-0 flex-1 rounded-lg border border-white/15 bg-white/10 px-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  />
                  <button
                    type="submit"
                    className="h-10 shrink-0 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                  >
                    Join
                  </button>
                </div>
                {emailError && <p className="mt-1.5 text-xs text-rose-300">{emailError}</p>}
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <Zap size={15} className="text-white" aria-hidden />
            </span>
            <span className="text-sm font-semibold text-white">NovaMart</span>
            <span className="text-sm text-slate-500">· Everything you love, delivered.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Accepted payment methods">
            {PAYMENTS.map((p) => (
              <span
                key={p}
                className="rounded-md border border-white/15 px-2 py-1 text-[11px] font-semibold tracking-wide text-slate-400"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          © 2026 NovaMart. All rights reserved. Demo storefront — no real orders are processed.
        </p>
      </div>
    </footer>
  );
}
