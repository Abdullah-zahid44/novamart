import { Flame } from 'lucide-react';
import Countdown from '@/components/home/Countdown';
import { ProductCard } from '@/components/shop/ProductCard';
import { getProducts } from '@/lib/store';
import type { Product } from '@/lib/types';

export const metadata = {
  title: 'Deals — NovaMart',
  description:
    'Today’s biggest discounts at NovaMart. Sale and hot products, sorted by savings.',
};

function discountPct(p: Product): number {
  if (!p.compareAtPrice || p.compareAtPrice <= p.price) return 0;
  return (p.compareAtPrice - p.price) / p.compareAtPrice;
}

export default function DealsPage() {
  const deals = getProducts()
    .filter(
      (p) =>
        (p.compareAtPrice && p.compareAtPrice > p.price) ||
        p.badge === 'SALE' ||
        p.badge === 'HOT',
    )
    .sort((a, b) => discountPct(b) - discountPct(a));

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-600 p-6 text-white sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-4 py-1.5 text-xs font-bold tracking-widest text-amber-300 uppercase ring-1 ring-amber-300/30">
              <Flame className="h-4 w-4" aria-hidden="true" />
              {deals.length} deals live now
            </p>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Today&apos;s deals
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-indigo-100">
              Every product on this page is marked down — sorted by biggest
              savings first. When the timer runs out, the deals refresh.
            </p>
          </div>
          <Countdown label="Deals refresh in" />
        </div>
      </div>

      {deals.length === 0 ? (
        <div className="mt-10 rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-lg font-semibold text-slate-900">
            No deals right now
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Check back soon — new deals drop daily at midnight.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {deals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
