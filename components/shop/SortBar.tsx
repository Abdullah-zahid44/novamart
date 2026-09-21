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
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        )}
        <p className="text-sm text-gray-600">
          {count} {count === 1 ? 'product' : 'products'}
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <span className="hidden sm:inline">Sort by</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort products"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
