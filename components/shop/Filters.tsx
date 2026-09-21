'use client';

import type { Category } from '@/lib/types';
import { cn } from '@/lib/cn';

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

const inputClass =
  'w-full rounded-[10px] border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

export function Filters({ categories, counts, value, activeCount, onChange, onClear }: FiltersProps) {
  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">Filters</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-accent underline-offset-4 hover:text-accent-deep hover:underline"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          Category
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onChange({ category: '' })}
              className={cn(
                'flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-sm transition-colors',
                value.category === ''
                  ? 'bg-accent font-semibold text-white'
                  : 'text-ink hover:bg-sand',
              )}
            >
              <span>All products</span>
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onChange({ category: cat.slug })}
                className={cn(
                  'flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-sm transition-colors',
                  value.category === cat.slug
                    ? 'bg-accent font-semibold text-white'
                    : 'text-ink hover:bg-sand',
                )}
              >
                <span>{cat.name}</span>
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    value.category === cat.slug ? 'text-white/80' : 'text-muted',
                  )}
                >
                  {counts[cat.slug] ?? 0}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          Price
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="Min"
            aria-label="Minimum price"
            value={value.min}
            onChange={(e) => onChange({ min: e.target.value })}
            className={inputClass}
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="Max"
            aria-label="Maximum price"
            value={value.max}
            onChange={(e) => onChange({ max: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          Rating
        </h3>
        <div className="space-y-1">
          {ratingOptions.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-1.5 text-sm transition-colors',
                value.rating === opt.value
                  ? 'bg-sand font-medium text-ink'
                  : 'text-ink hover:bg-sand/60',
              )}
            >
              <input
                type="radio"
                name="min-rating"
                checked={value.rating === opt.value}
                onChange={() => onChange({ rating: opt.value })}
                className="h-4 w-4 accent-[#E4572E]"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={value.sale}
            onChange={(e) => onChange({ sale: e.target.checked })}
            className="h-4 w-4 rounded accent-[#E4572E]"
          />
          On sale only
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={value.instock}
            onChange={(e) => onChange({ instock: e.target.checked })}
            className="h-4 w-4 rounded accent-[#E4572E]"
          />
          In stock only
        </label>
      </div>
    </div>
  );
}
