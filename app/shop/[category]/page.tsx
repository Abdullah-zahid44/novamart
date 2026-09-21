'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { getCategories, getProducts } from '@/lib/store';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { SortBar, sortProducts } from '@/components/shop/SortBar';
import { notFound, useParams } from 'next/navigation';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.category as string;
  const [sort, setSort] = useState('featured');

  // Product data lives in localStorage, which the server cannot read. Gate the
  // catalog lookup behind mount so SSR HTML matches the first client render;
  // genuinely unknown slugs still hit notFound() after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const category = useMemo(
    () => (mounted ? getCategories().find((c) => c.slug === slug) : undefined),
    [slug, mounted],
  );
  const products = useMemo(() => {
    if (!category) return [];
    return sortProducts(getProducts().filter((p) => p.category === category.slug), sort);
  }, [category, sort]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-10" aria-label="Loading category">
        <div className="h-8 w-56 rounded bg-line" />
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-[14px] bg-line/60" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) notFound();

  return (
    <div className="pb-16">
      {/* Editorial band — no gradients, flat sand */}
      <div className="border-b border-line bg-sand">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="min-w-0 max-w-2xl"
          >
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted">
              <Link href="/" className="transition-colors hover:text-accent">
                Home
              </Link>
              <ChevronRight className="h-3 w-3" aria-hidden />
              <Link href="/shop" className="transition-colors hover:text-accent">
                Shop
              </Link>
              <ChevronRight className="h-3 w-3" aria-hidden />
              <span className="text-ink">{category.name}</span>
            </nav>
            <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-medium leading-[1.05] text-ink">
              {category.name}
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted">
              {category.description}
            </p>
            <p className="mt-4 inline-flex items-center rounded-full border border-line bg-card px-3.5 py-1.5 text-xs font-semibold text-ink">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="relative hidden aspect-[4/5] w-52 shrink-0 overflow-hidden rounded-[14px] border border-line md:block lg:w-64"
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="256px"
              className="object-cover"
              priority
            />
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-5 px-4 pt-8">
        <SortBar sort={sort} onSortChange={setSort} count={products.length} />
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
