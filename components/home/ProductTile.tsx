'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from '@/components/cart/CartShell';
import { Stars } from '@/components/ui/Stars';
import { Price } from '@/components/ui/Price';
import { Badge, productBadgeVariant } from '@/components/ui/Badge';
import { SmartImage } from './SmartImage';
import { cn } from '@/lib/cn';

export interface ProductTileProps {
  product: Product;
  /** Muted eyebrow under the image (category name). */
  eyebrow?: string;
  /** Override the corner badge, e.g. "−20%" on the deals page. */
  badgeLabel?: string;
  className?: string;
}

/**
 * Editorial product card (DESIGN_BRIEF §5.5): 4:5 image, serif name, muted eyebrow,
 * price row + small stars. Hover reveals a "Quick add" pill over the image.
 */
export function ProductTile({ product, eyebrow, badgeLabel, className }: ProductTileProps) {
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

  const badge = badgeLabel ?? product.badge;
  const badgeVariant = badgeLabel ? 'sale' : product.badge ? productBadgeVariant[product.badge] : null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn('group flex w-60 shrink-0 flex-col', className)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] border border-line bg-sand transition-transform duration-300 group-hover:-translate-y-1">
        <SmartImage
          src={product.images[0] ?? ''}
          alt={product.name}
          className="h-full w-full"
          imgClassName="transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(min-width: 1024px) 25vw, 60vw"
        />
        {badge && badgeVariant && (
          <span className="absolute left-3 top-3">
            <Badge variant={badgeVariant}>{badge}</Badge>
          </span>
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/45">
            <span className="rounded-full bg-card px-4 py-1.5 text-xs font-semibold text-ink">
              Out of stock
            </span>
          </div>
        )}
        {!soldOut && (
          <div className="absolute inset-x-3 bottom-3 translate-y-16 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`Quick add ${product.name} to cart`}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-ink py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-accent active:scale-[0.98]"
            >
              <Plus size={16} aria-hidden />
              Quick add
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col px-0.5 pt-3">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{eyebrow}</p>
        )}
        <h3 className="mt-1 font-display text-[1.02rem] font-semibold leading-snug text-ink">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-1.5">
          <Stars value={product.rating} size="sm" />
          <span className="text-xs text-muted">({product.reviewsCount})</span>
        </div>
        <div className="mt-1.5">
          <Price value={product.price} compareAt={product.compareAtPrice} />
        </div>
      </div>
    </Link>
  );
}
