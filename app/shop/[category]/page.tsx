'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { getCategories, getProducts } from '@/lib/store';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { SortBar, sortProducts } from '@/components/shop/SortBar';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.category as string;
  const [sort, setSort] = useState('featured');

  const category = useMemo(() => getCategories().find((c) => c.slug === slug), [slug]);
  const products = useMemo(() => {
    if (!category) return [];
    return sortProducts(getProducts().filter((p) => p.category === category.slug), sort);
  }, [category, sort]);

  if (!category) notFound();

  return (
    <div>
      <div className="relative h-48 overflow-hidden bg-indigo-950 sm:h-64">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="100vw"
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-6">
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1 text-xs text-indigo-200">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/shop" className="hover:text-white">
              Shop
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">{category.name}</span>
          </nav>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{category.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-indigo-100">{category.description}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8">
        <SortBar sort={sort} onSortChange={setSort} count={products.length} />
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
