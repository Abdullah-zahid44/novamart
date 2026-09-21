'use client';

import type { Category } from '@/lib/types';

export interface FiltersState {
  category: string;
  min: string;
  max: string;
  rating: number;
  sale: boolean;
  instock: boolean;
}

export const defaultFilters: FiltersState = {
  category: '',
  min: '',
  max: '',
  rating: 0,
  sale: false,
  instock: false,
};

interface FiltersProps {
  categories: Category[];
  counts: Record<string, number>;
  value: FiltersState;
  activeCount: number;
  onChange: (patch: Partial<FiltersState>) => void;
  onClear: () => void;
}

const ratingOptions = [
  { value: 0, label: 'Any rating' },
  { value: 4, label: '4 stars & up' },
  { value: 3, label: '3 stars & up' },
  { value: 2, label: '2 stars & up' },
];

export function Filters({ categories, counts, value, activeCount, onChange, onClear }: FiltersProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Filters</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Category</h3>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onChange({ category: '' })}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                value.category === ''
                  ? 'bg-indigo-50 font-semibold text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>All products</span>
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onChange({ category: cat.slug })}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  value.category === cat.slug
                    ? 'bg-indigo-50 font-semibold text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-xs text-gray-400">{counts[cat.slug] ?? 0}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Price</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="Min"
            aria-label="Minimum price"
            value={value.min}
            onChange={(e) => onChange({ min: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="Max"
            aria-label="Maximum price"
            value={value.max}
            onChange={(e) => onChange({ max: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Rating</h3>
        <div className="space-y-1">
          {ratingOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              <input
                type="radio"
                name="min-rating"
                checked={value.rating === opt.value}
                onChange={() => onChange({ rating: opt.value })}
                className="h-4 w-4 accent-indigo-600"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={value.sale}
            onChange={(e) => onChange({ sale: e.target.checked })}
            className="h-4 w-4 rounded accent-indigo-600"
          />
          On sale only
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={value.instock}
            onChange={(e) => onChange({ instock: e.target.checked })}
            className="h-4 w-4 rounded accent-indigo-600"
          />
          In stock only
        </label>
      </div>
    </div>
  );
}
