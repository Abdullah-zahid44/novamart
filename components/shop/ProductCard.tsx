'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Stars } from '@/components/ui/Stars';
import { Price } from '@/components/ui/Price';
import { useCart } from '@/components/cart/CartShell';

const badgeClass: Record<string, string> = {
  NEW: 'bg-emerald-600 text-white',
  SALE: 'bg-rose-600 text-white',
  HOT: 'bg-amber-400 text-indigo-950',
  BESTSELLER: 'bg-indigo-600 text-white',
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const soldOut = product.stock === 0;

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? '',
    });
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.badge && (
          <span
            className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-xs font-bold tracking-wide ${badgeClass[product.badge]}`}
          >
            {product.badge}
          </span>
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-gray-900">
              Out of stock
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{product.brand}</p>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-gray-900">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <Stars value={product.rating} size="sm" />
          <span className="text-xs text-gray-500">({product.reviewsCount})</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <Price value={product.price} compareAt={product.compareAtPrice} />
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            aria-label={`Add ${product.name} to cart`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
