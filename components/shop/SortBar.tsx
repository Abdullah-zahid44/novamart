'use client';

import { SlidersHorizontal } from 'lucide-react';
import type { Product } from '@/lib/types';

export const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
];

export function sortProducts(products: Product[], sort: string): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
      break;
    case 'newest':
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case 'featured':
    default:
      sorted.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
      break;
  }
  return sorted;
}

interface SortBarProps {
  sort: string;
  onSortChange: (sort: string) => void;
  count: number;
  onToggleFilters?: () => void;
}

export function SortBar({ sort, onSortChange, count, onToggleFilters }: SortBarProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {onToggleFilters && (
          <button
            type="button"
            onClick={onToggleFilters}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink active:scale-[0.98] md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        )}
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink">{count}</span>{' '}
          {count === 1 ? 'product' : 'products'}
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm text-muted">
        <span className="hidden sm:inline">Sort by</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort products"
          className="rounded-full border border-line bg-card px-4 py-2 text-sm font-medium text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
