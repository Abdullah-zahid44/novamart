import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import Hero from '@/components/home/Hero';
import Countdown from '@/components/home/Countdown';
import NewsletterForm from '@/components/home/NewsletterForm';
import { ProductCard } from '@/components/shop/ProductCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getCategories, getProducts } from '@/lib/store';
import type { Product } from '@/lib/types';

export const metadata = {
  title: 'NovaMart — Everything you love, delivered',
  description:
    'Shop electronics, fashion, home essentials and more at NovaMart. Free shipping over the threshold, 30-day returns, secure checkout.',
};

const TESTIMONIALS = [
  {
    quote:
      'Ordered on Monday, at my door on Wednesday. The packaging was perfect and the headphones exceeded every expectation.',
    name: 'Sarah Mitchell',
    detail: 'Verified buyer · Austin, TX',
  },
  {
    quote:
      'I compared prices everywhere before buying my kitchen set. NovaMart was the cheapest, and the quality honestly surprised me.',
    name: 'David Okafor',
    detail: 'Verified buyer · Chicago, IL',
  },
  {
    quote:
      'Had an issue with a size and support sorted it in one email — replacement shipped the same day. This is how you earn loyalty.',
    name: 'Priya Raman',
    detail: 'Verified buyer · Seattle, WA',
  },
];

const BRANDS = [
  'Nordhaus',
  'Velvetine',
  'Klarheit',
  'Ozone Labs',
  'Papertrail',
  'Bloom & Co.',
  'Forge & Field',
  'Lumen',
];

function discountPct(p: Product): number {
  if (!p.compareAtPrice || p.compareAtPrice <= p.price) return 0;
  return (p.compareAtPrice - p.price) / p.compareAtPrice;
}

export default function HomePage() {
  const categories = getCategories().slice(0, 6);
  const products = getProducts();
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const deals = products
    .filter(
      (p) =>
        (p.compareAtPrice && p.compareAtPrice > p.price) ||
        p.badge === 'SALE' ||
        p.badge === 'HOT',
    )
    .sort((a, b) => discountPct(b) - discountPct(a))
    .slice(0, 4);

  return (
    <main>
      <Hero />

      {/* Category tiles */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeading
          kicker="Browse"
          title="Shop by category"
          sub="Six curated departments, one checkout. Start where your wishlist lives."
          link={{ href: '/shop', label: 'View all products' }}
        />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop/${c.slug}`}
              className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-slate-900">{c.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {c.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <SectionHeading
            kicker="Handpicked"
            title="Featured products"
            sub="Our most loved picks right now — rated, reviewed and restocked."
            link={{ href: '/shop', label: 'Shop everything' }}
          />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Deals of the day */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 ring-1 ring-amber-200">
          <div className="flex flex-col gap-6 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold tracking-widest text-amber-700 uppercase">
                Limited time
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                Deals of the day
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-600">
                Deep discounts on bestsellers. When the clock hits zero, prices
                go back up.
              </p>
            </div>
            <Countdown label="Deals refresh in" />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {deals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-indigo-600 hover:text-indigo-600"
          >
            See all deals
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <SectionHeading
            kicker="Reviews"
            title="Loved by shoppers"
            sub="Real orders, real deliveries, real opinions."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                <Quote className="h-7 w-7 text-indigo-300" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{t.detail}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Brand strip */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold tracking-widest text-slate-400 uppercase">
            Featuring brands we love
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {BRANDS.map((b) => (
              <span
                key={b}
                className="text-lg font-bold tracking-tight text-slate-400 transition hover:text-slate-600"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-indigo-950">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-bold tracking-widest text-amber-300 uppercase">
            Newsletter
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white">
            Get 10% off your first order
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-indigo-200">
            Join 40,000+ subscribers for subscriber-only deals, early access to
            new arrivals and zero spam. Your welcome code lands instantly.
          </p>
          <div className="mt-8">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </main>
  );
}
