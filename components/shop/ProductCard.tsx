'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { Product } from '@/lib/types';
import { getCategories } from '@/lib/store';
import { Stars } from '@/components/ui/Stars';
import { Price } from '@/components/ui/Price';
import { useCart } from '@/components/cart/CartShell';
import { cn } from '@/lib/cn';

const badgeClass: Record<string, string> = {
  NEW: 'bg-forest text-paper',
  SALE: 'bg-accent text-white',
  HOT: 'bg-accent-deep text-white',
  BESTSELLER: 'bg-ink text-paper',
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem, setOpen } = useCart();
  const soldOut = product.stock === 0;

  const categoryName = useMemo(() => {
    return getCategories().find((c) => c.slug === product.category)?.name ?? product.category;
  }, [product.category]);

  const salePct =
    product.compareAtPrice != null && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? '',
      color: product.colors[0] || undefined,
      size: product.sizes?.[0] || undefined,
    });
    setOpen(true);
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-[14px] border border-line bg-card',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:shadow-[0_16px_36px_-16px_rgba(25,20,16,0.28)]',
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        {product.badge && (
          <span
            className={cn(
              'absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]',
              badgeClass[product.badge],
            )}
          >
            {product.badge === 'SALE' && salePct > 0 ? `−${salePct}%` : product.badge}
          </span>
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/55">
            <span className="rounded-full bg-paper px-4 py-1.5 text-xs font-semibold text-ink">
              Out of stock
            </span>
          </div>
        )}
        {!soldOut && (
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Quick add ${product.name} to cart`}
            className={cn(
              'absolute inset-x-3 bottom-3 inline-flex h-10 items-center justify-center gap-1.5',
              'rounded-full bg-ink/90 text-sm font-semibold text-paper backdrop-blur-sm',
              'transition-all duration-300 ease-out hover:bg-accent active:scale-[0.98]',
              // Desktop: slide up on hover. Touch: always visible.
              'sm:translate-y-[140%] sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100',
            )}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Quick add
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
          {categoryName}
        </p>
        <h3 className="line-clamp-2 font-display text-[1.02rem] font-medium leading-snug text-ink">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-1.5">
          <Stars value={product.rating} size="sm" />
          <span className="text-xs text-muted">({product.reviewsCount})</span>
        </div>
        <div className="mt-auto pt-2">
          <Price value={product.price} compareAt={product.compareAtPrice} size="sm" />
        </div>
      </div>
    </Link>
  );
}
