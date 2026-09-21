'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, RotateCcw, Star, Truck } from 'lucide-react';
import { Button } from '@/components/ui';
import { SmartImage } from './SmartImage';

const HEADLINE = ['Good goods,', 'fairly priced.'];

const TRUST = [
  { icon: Star, label: '4.9 · 12k reviews' },
  { icon: RotateCcw, label: '30-day returns' },
  { icon: Truck, label: 'Ships in 24h' },
];

/** Masterpiece hero — staggered Fraunces headline, pill CTAs, arch image (DESIGN_BRIEF §5.3). */
export function Hero() {
  const reduce = useReducedMotion();

  const line = (text: string, i: number) =>
    reduce ? (
      <span key={text} className="block">
        {text}
      </span>
    ) : (
      <motion.span
        key={text}
        className="block"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 + i * 0.14, ease: 'easeOut' }}
      >
        {text}
      </motion.span>
    );

  const fadeUp = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.45, ease: 'easeOut' as const },
      };

  return (
    <section className="overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:pt-20">
        <div>
          <motion.p
            initial={reduce ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-accent"
          >
            The new general store
          </motion.p>
          <h1 className="font-display text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-[0.98] tracking-tight text-ink">
            {HEADLINE.map(line)}
          </h1>
          <motion.p
            {...fadeUp}
            className="mt-6 max-w-md text-lg leading-relaxed text-muted"
          >
            We sell things we would buy ourselves. That is the whole strategy.
          </motion.p>
          <motion.div {...fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop">
              <Button size="lg">
                Shop the collection
                <ArrowRight size={18} aria-hidden />
              </Button>
            </Link>
            <Link href="/deals">
              <Button size="lg" variant="secondary">
                Today&apos;s deals
              </Button>
            </Link>
          </motion.div>
          <motion.ul {...fadeUp} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2" aria-label="Store promises">
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-medium text-muted">
                <Icon size={15} className="text-accent" aria-hidden />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
          className="relative mx-auto w-full max-w-[420px]"
        >
          <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-sand" aria-hidden />
          <SmartImage
            src="/images/hero.jpg"
            alt="A warm editorial flat-lay of NovaMart goods"
            label="This week's shelf, photographed Tuesday."
            priority
            sizes="(min-width: 1024px) 420px, 90vw"
            className="relative aspect-[4/5] w-full shadow-xl shadow-ink/10"
            imgClassName="rounded-[999px_999px_18px_18px]"
          />
          <div className="absolute -left-4 bottom-10 rounded-[14px] border border-line bg-card px-4 py-3 shadow-lg shadow-ink/10 sm:-left-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">This week&apos;s drop</p>
            <p className="mt-1 font-display text-lg font-semibold text-ink">Restocked Friday.</p>
            <p className="text-sm text-muted">Gone by Monday, usually.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
