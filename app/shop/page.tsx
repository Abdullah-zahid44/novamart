'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchX, X } from 'lucide-react';
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
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    [state],
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

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:pt-14">
      {/* Editorial header */}
      <motion.header
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-2xl"
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
          The catalogue
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-medium leading-[1.05] text-ink">
          The whole shelf.
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-muted">
          Every product we sell, in one place. Filter it down, sort it around —
          what you see is what we would buy ourselves.
        </p>
      </motion.header>

      <div className="mt-8 flex gap-10 lg:mt-10">
        {/* Sticky filter rail — desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[14px] border border-line bg-card p-6">
            <Filters {...filtersProps} />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-5">
          <SearchBar
            initialValue={state.q}
            onSearch={handleSearch}
            clearSignal={clearSignal}
          />
          <SortBar
            sort={state.sort}
            onSortChange={(sort) => update({ sort })}
            count={filtered.length}
            onToggleFilters={() => setDrawerOpen(true)}
          />
          {filtered.length > 0 ? (
            <ProductGrid products={filtered} />
          ) : (
            <EmptyState
              icon={SearchX}
              title="Nothing on this shelf"
              hint="Try loosening a filter or two — the good stuff is hiding behind them."
              action={
                <Button variant="secondary" size="sm" onClick={clearAll} className="rounded-full">
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-ink/45"
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col bg-paper shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <p className="font-display text-lg font-semibold text-ink">Refine</p>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close filters"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-sand"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <Filters {...filtersProps} />
              </div>
              <div className="border-t border-line p-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full rounded-full"
                  onClick={() => setDrawerOpen(false)}
                >
                  Show {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10">
          <p className="text-sm text-muted">Loading the shelf…</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
