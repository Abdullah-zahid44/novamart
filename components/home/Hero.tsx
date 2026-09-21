import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { getSettings } from '@/lib/store';
import { currency } from '@/lib/format';

export default function Hero() {
  const { freeShipOver } = getSettings();

  const badges = [
    {
      icon: Truck,
      title: `Free shipping over ${currency(freeShipOver)}`,
      sub: 'Fast delivery, tracked door to door',
    },
    {
      icon: RotateCcw,
      title: '30-day easy returns',
      sub: 'Changed your mind? No problem',
    },
    {
      icon: ShieldCheck,
      title: 'Secure checkout',
      sub: 'Your payment stays protected',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-600 text-white">
      {/* soft decorative glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-indigo-950/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center rounded-full bg-amber-400/15 px-4 py-1.5 text-xs font-semibold tracking-widest text-amber-300 uppercase ring-1 ring-amber-300/30">
              New season sale · up to 40% off
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Everything you love,
              <span className="block text-amber-300">delivered.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-indigo-100 sm:text-lg">
              NovaMart brings together 48+ hand-picked products across tech,
              fashion, home and more — quality you can trust, prices you will
              love, and shipping that is actually fast.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-base font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
              >
                Shop now
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/deals"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-7 py-3.5 text-base font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Today&apos;s deals
              </Link>
            </div>

            <dl className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {badges.map((b) => (
                <div key={b.title} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                    <b.icon className="h-5 w-5 text-amber-300" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="text-sm font-semibold">{b.title}</dt>
                    <dd className="mt-0.5 text-xs text-indigo-200">{b.sub}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20">
              <Image
                src="https://picsum.photos/seed/novamart-hero/1000/800"
                alt="A curated selection of NovaMart products"
                width={1000}
                height={800}
                priority
                className="h-auto w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 left-5 rounded-xl bg-white px-5 py-4 text-slate-900 shadow-xl sm:left-8">
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                This week only
              </p>
              <p className="mt-1 text-lg font-bold">
                Extra 10% off <span className="text-indigo-600">WELCOME10</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
