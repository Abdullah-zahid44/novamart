import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Hero } from '@/components/home/Hero';
import { SmartImage } from '@/components/home/SmartImage';
import { ProductTile } from '@/components/home/ProductTile';
import { NewsletterForm } from '@/components/home/NewsletterForm';
import { EditorialHeader } from '@/components/home/EditorialHeader';
import { SectionHeading, Reveal, Stars, Button } from '@/components/ui';
import { getCategories, getProducts } from '@/lib/store';
import type { Product } from '@/lib/types';

export const metadata = {
  title: 'NovaMart — The new general store',
  description:
    'Good goods, fairly priced. Shop electronics, home, fashion, beauty, sports and toys with 24-hour shipping and 30-day returns.',
};

const CAT_IMAGES: Record<string, string> = {
  electronics: '/images/cat-electronics.jpg',
  'home-kitchen': '/images/cat-home.jpg',
  fashion: '/images/cat-fashion.jpg',
  beauty: '/images/cat-beauty.jpg',
  sports: '/images/cat-sports.jpg',
  'toys-and-games': '/images/cat-toys.jpg',
};

const REVIEWS = [
  {
    quote:
      'Ordered Tuesday, arrived Thursday. The box looked like someone actually cared.',
    name: 'Maya R.',
    detail: 'Verified buyer · Portland',
  },
  {
    quote:
      'I came for the charger and stayed for the prices. My kitchen drawer is now forty percent NovaMart.',
    name: 'Daniel K.',
    detail: 'Verified buyer · Austin',
  },
  {
    quote:
      'Returned a jacket — no questions, refund in two days. That is why I keep coming back.',
    name: 'Sofia L.',
    detail: 'Verified buyer · Miami',
  },
];

const byNewest = (a: Product, b: Product) => b.createdAt.localeCompare(a.createdAt);
const byLoved = (a: Product, b: Product) => b.rating * b.reviewsCount - a.rating * a.reviewsCount;

export default function HomePage() {
  const categories = getCategories();
  const products = getProducts();
  const drops = [...products].sort(byNewest).slice(0, 8);
  const bestsellers = [...products].sort(byLoved).slice(0, 8);
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  const catCount = (slug: string) => products.filter((p) => p.category === slug).length;

  return (
    <>
      <Hero />

      {/* Category tiles */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <Reveal>
          <SectionHeading
            kicker="Browse"
            title="Six aisles, zero filler."
            sub="Every category earns its shelf space. Nothing here is padding."
            link={{ href: '/shop', label: 'Shop everything' }}
          />
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={Math.min(i * 0.06, 0.3)}>
              <Link
                href={`/shop/${c.slug}`}
                className="group block overflow-hidden rounded-[14px] border border-line bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/10"
              >
                <SmartImage
                  src={CAT_IMAGES[c.slug] ?? c.image}
                  alt={c.name}
                  label={c.name}
                  sizes="(min-width: 1024px) 16vw, 45vw"
                  className="aspect-[4/5] w-full"
                  imgClassName="transition-transform duration-500 group-hover:scale-[1.05]"
                />
                <div className="px-4 py-3.5">
                  <h3 className="font-display text-lg font-semibold leading-tight text-ink">
                    {c.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                    {catCount(c.slug)} products
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* This week's drops — horizontal rail */}
      <section className="border-y border-line bg-sand/50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading
              kicker="Fresh"
              title="This week's drops."
              sub="Restocked Friday. Gone by Monday, usually."
              link={{ href: '/shop', label: 'Shop all' }}
            />
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
            {drops.map((p) => (
              <ProductTile key={p.id} product={p} eyebrow={catName(p.category)} className="snap-start" />
            ))}
          </div>
        </Reveal>
      </section>

      {/* Editorial banner — forest */}
      <section className="bg-forest text-paper">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <Reveal>
            <SmartImage
              src="/images/story.jpg"
              alt="Inside the NovaMart packing room"
              label="The packing room, mid-Friday."
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="aspect-[4/3] w-full rounded-[14px]"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-accent">Our story</p>
            <h2 className="font-display text-[clamp(1.9rem,4vw,2.9rem)] font-semibold leading-[1.1] tracking-tight">
              A general store, minus the dust.
            </h2>
            <p className="mt-5 max-w-prose leading-relaxed text-paper/75">
              NovaMart started with a simple complaint: buying decent basics online had become
              a chore — endless tabs, mystery sellers, prices that moved while you blinked.
              So we built the shop we wanted to use. A short shelf of good things, honest
              prices, and shipping that shows up when we say it will.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-paper/30 px-6 py-3 text-sm font-semibold text-paper transition-all hover:border-paper hover:bg-paper/10 active:scale-[0.98]"
            >
              Read our story
              <ArrowRight size={16} aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <Reveal>
          <SectionHeading
            kicker="Loved"
            title="Bestsellers."
            sub="The things people reorder — and tell their friends about."
            link={{ href: '/shop', label: 'Shop all' }}
          />
        </Reveal>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
          {bestsellers.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i * 0.05, 0.3)}>
              <ProductTile product={p} eyebrow={catName(p.category)} className="w-full" />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-sand/60 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading kicker="Word of mouth" title="People keep the receipts." />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <Reveal key={r.name} delay={i * 0.08}>
                <figure className="flex h-full flex-col rounded-[14px] border border-line bg-card p-6">
                  <Stars value={5} size="md" />
                  <blockquote className="mt-4 flex-1 font-display text-lg italic leading-snug text-ink">
                    &ldquo;{r.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5">
                    <p className="text-sm font-semibold text-ink">{r.name}</p>
                    <p className="text-xs text-muted">{r.detail}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <Reveal className="mx-auto max-w-xl text-center">
          <EditorialHeader
            align="center"
            kicker="The Friday email"
            title="First dibs, every Friday."
            lede="New drops, restocks, and the occasional strong opinion. One email a week, worth opening."
          />
          <NewsletterForm className="mx-auto mt-8 max-w-md" />
        </Reveal>
      </section>

      {/* CTA strip */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 rounded-[14px] border border-line bg-card px-8 py-10 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                Still browsing? The deals page is better.
              </h2>
              <p className="mt-2 text-muted">Real discounts on things that rarely go on sale.</p>
            </div>
            <Link href="/deals" className="shrink-0">
              <Button size="lg">
                Today&apos;s deals
                <ArrowRight size={18} aria-hidden />
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
