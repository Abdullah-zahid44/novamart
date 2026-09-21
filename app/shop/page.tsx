'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchX } from 'lucide-react';
import type { Product } from '@/lib/types';
import { getCategories, getProducts, searchProducts } from '@/lib/store';
import { Filters, defaultFilters, type FiltersState } from '@/components/shop/Filters';
import { SortBar, sortProducts } from '@/components/shop/SortBar';
import { SearchBar } from '@/components/shop/SearchBar';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

interface ShopState extends FiltersState {
  q: string;
  sort: string;
}

const defaultShopState: ShopState = { ...defaultFilters, q: '', sort: 'featured' };

function paramsToState(params: URLSearchParams): ShopState {
  return {
    q: params.get('q') ?? '',
    category: params.get('category') ?? '',
    min: params.get('min') ?? '',
    max: params.get('max') ?? '',
    rating: Number(params.get('rating') ?? 0) || 0,
    sale: params.get('sale') === '1',
    instock: params.get('instock') === '1',
    sort: params.get('sort') ?? 'featured',
  };
}

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ShopState>(() => paramsToState(searchParams));
  const [showFilters, setShowFilters] = useState(false);
  const [clearSignal, setClearSignal] = useState(0);

  const categories = useMemo(() => getCategories(), []);
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of getProducts()) map[p.category] = (map[p.category] ?? 0) + 1;
    return map;
  }, []);

  const pushUrl = (next: ShopState) => {
    const params = new URLSearchParams();
    if (next.q) params.set('q', next.q);
    if (next.category) params.set('category', next.category);
    if (next.min) params.set('min', next.min);
    if (next.max) params.set('max', next.max);
    if (next.rating > 0) params.set('rating', String(next.rating));
    if (next.sale) params.set('sale', '1');
    if (next.instock) params.set('instock', '1');
    if (next.sort !== 'featured') params.set('sort', next.sort);
    const qs = params.toString();
    router.replace(qs ? `/shop?${qs}` : '/shop', { scroll: false });
  };

  const update = (patch: Partial<ShopState>) => {
    const next = { ...state, ...patch };
    setState(next);
    pushUrl(next);
  };

  const handleSearch = useCallback(
    (q: string) => {
      if (state.q === q) return;
      const next = { ...state, q };
      setState(next);
      pushUrl(next);
    },
    [state]
  );

  const clearAll = () => {
    setState({ ...defaultShopState });
    setClearSignal((n) => n + 1);
    router.replace('/shop', { scroll: false });
  };

  const filtered = useMemo(() => {
    let list: Product[] = state.q ? searchProducts(state.q) : getProducts();
    if (state.category) list = list.filter((p) => p.category === state.category);
    const min = Number(state.min);
    const max = Number(state.max);
    if (state.min && !Number.isNaN(min)) list = list.filter((p) => p.price >= min);
    if (state.max && !Number.isNaN(max)) list = list.filter((p) => p.price <= max);
    if (state.rating > 0) list = list.filter((p) => p.rating >= state.rating);
    if (state.sale) list = list.filter((p) => p.compareAtPrice != null && p.compareAtPrice > p.price);
    if (state.instock) list = list.filter((p) => p.stock > 0);
    return sortProducts(list, state.sort);
  }, [state]);

  const activeCount =
    (state.category ? 1 : 0) +
    (state.min ? 1 : 0) +
    (state.max ? 1 : 0) +
    (state.rating > 0 ? 1 : 0) +
    (state.sale ? 1 : 0) +
    (state.instock ? 1 : 0) +
    (state.q ? 1 : 0);

  const filtersProps = {
    categories,
    counts,
    value: state,
    activeCount,
    onChange: (patch: Partial<FiltersState>) => update(patch),
    onClear: clearAll,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Shop all products</h1>
      <p className="mt-1 text-sm text-gray-600">
        Browse the full NovaMart catalog — filter by category, price, rating, and more.
      </p>

      <div className="mt-6 flex gap-8">
        <aside className="hidden w-64 shrink-0 md:block">
          <Filters {...filtersProps} />
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <SearchBar
            initialValue={state.q}
            onSearch={handleSearch}
            clearSignal={clearSignal}
          />
          <SortBar
            sort={state.sort}
            onSortChange={(sort) => update({ sort })}
            count={filtered.length}
            onToggleFilters={() => setShowFilters((v) => !v)}
          />
          {showFilters && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 md:hidden">
              <Filters {...filtersProps} />
            </div>
          )}
          {filtered.length > 0 ? (
            <ProductGrid products={filtered} />
          ) : (
            <EmptyState
              icon={SearchX}
              title="No products found"
              hint="Try adjusting your filters or searching for something else."
              action={
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-sm text-gray-500">Loading products…</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
