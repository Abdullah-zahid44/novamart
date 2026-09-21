import { Countdown } from '@/components/home/Countdown';
import { ProductTile } from '@/components/home/ProductTile';
import { SectionHeading, Reveal, EmptyState, Button } from '@/components/ui';
import Link from 'next/link';
import { getCategories, getProducts } from '@/lib/store';
import { Tag } from 'lucide-react';

export const metadata = {
  title: 'Deals — NovaMart',
  description:
    'Real discounts on things that rarely go on sale. New deals land every Friday.',
};

function discountPct(price: number, compareAt?: number): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export default function DealsPage() {
  const categories = getCategories();
  const deals = getProducts()
    .filter((p) => discountPct(p.price, p.compareAtPrice) > 0)
    .sort(
      (a, b) =>
        discountPct(b.price, b.compareAtPrice) - discountPct(a.price, a.compareAtPrice),
    );
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <>
      {/* Accent countdown band */}
      <section className="bg-accent text-paper">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:py-16">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-paper/80">
              This week only
            </p>
            <h1 className="font-display text-[clamp(2.4rem,6vw,4.2rem)] font-semibold leading-[1.05] tracking-tight">
              Deals worth opening.
            </h1>
            <p className="mt-4 leading-relaxed text-paper/85">
              Real discounts on things that rarely go on sale. Prices go back up Friday —
              when they are gone, they are gone.
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-paper/80">
              Next drop in
            </p>
            <Countdown />
          </div>
        </div>
      </section>

      {/* Deal grid */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        {deals.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No deals right now"
            hint="Check back Friday — that is when the new ones land."
            action={
              <Link href="/shop">
                <Button variant="primary">Shop everything</Button>
              </Link>
            }
          />
        ) : (
          <>
            <Reveal>
              <SectionHeading
                kicker={`${deals.length} deals`}
                title="Marked down, honestly."
                sub="Every deal shows the old price next to the new one. No inflated was-prices here."
              />
            </Reveal>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
              {deals.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i * 0.04, 0.3)}>
                  <ProductTile
                    product={p}
                    eyebrow={catName(p.category)}
                    badgeLabel={`−${discountPct(p.price, p.compareAtPrice)}%`}
                    className="w-full"
                  />
                </Reveal>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
