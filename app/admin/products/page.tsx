'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Minus,
  Package,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { adjustStock, deleteProduct, getCategories, getProducts } from '@/lib/store';
import type { Category, Product } from '@/lib/types';
import { currency } from '@/lib/format';
import {
  Btn,
  ConfirmDialog,
  EmptyBox,
  Mono,
  PageHeader,
  Panel,
  SearchInput,
  Toast,
  inputCls,
  rowCls,
  tdCls,
  thCls,
  theadCls,
} from '../_ui';

type SortKey = 'name' | 'price' | 'stock' | 'createdAt';
type SortDir = 'asc' | 'desc';

function stockPill(stock: number): { label: string; cls: string } {
  if (stock === 0)
    return { label: 'Out of stock', cls: 'border-[#E26D5A]/30 bg-[#E26D5A]/10 text-[#E26D5A]' };
  if (stock < 10)
    return { label: 'Low stock', cls: 'border-[#E0A458]/30 bg-[#E0A458]/10 text-[#E0A458]' };
  return { label: 'In stock', cls: 'border-[#7FB069]/30 bg-[#7FB069]/10 text-[#7FB069]' };
}

function stockNumCls(stock: number): string {
  if (stock === 0) return 'text-[#E26D5A]';
  if (stock < 10) return 'text-[#E0A458]';
  return 'text-[#F2EBDD]';
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [banner, setBanner] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  useEffect(() => {
    setProducts(getProducts());
    setCategories(getCategories());
  }, []);

  const catName = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach((c) => m.set(c.slug, c.name));
    return (slug: string) => m.get(slug) ?? slug;
  }, [categories]);

  const flash = (msg: string) => {
    setBanner(msg);
    window.setTimeout(() => setBanner(null), 3200);
  };

  const refresh = () => setProducts(getProducts());

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchesQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        catName(p.category).toLowerCase().includes(q);
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesQ && matchesCat;
    });
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'price') cmp = a.price - b.price;
      else if (sortKey === 'stock') cmp = a.stock - b.stock;
      else cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [products, query, categoryFilter, sortKey, sortDir, catName]);

  const lowStock = useMemo(() => products.filter((p) => p.stock < 10).length, [products]);

  const handleAdjust = (id: string, delta: number) => {
    adjustStock(id, delta);
    refresh();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
    flash(`"${deleteTarget.name}" deleted.`);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-[#A39A89]/60" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-[#E4572E]" />
    ) : (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-[#E4572E]" />
    );
  };

  const sortBtn = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => toggleSort(key)}
      className="inline-flex items-center uppercase hover:text-[#F2EBDD]"
    >
      {label} <SortIcon k={key} />
    </button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        sub={`${products.length} ${products.length === 1 ? 'product' : 'products'} in the catalog${
          lowStock > 0 ? ` · ${lowStock} running low on stock` : ''
        }`}
        actions={
          <Link href="/admin/products/new">
            <Btn>
              <Plus className="h-4 w-4" /> New product
            </Btn>
          </Link>
        }
      />

      {banner && <Toast message={banner} />}

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search name, SKU, brand or category…"
          ariaLabel="Search products"
          className="flex-1"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={`${inputCls} sm:w-56`}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyBox
          icon={Package}
          title="No products found"
          hint="Try a different search or category — or add a new product to the catalog."
          action={
            <Link href="/admin/products/new">
              <Btn>
                <Plus className="h-4 w-4" /> New product
              </Btn>
            </Link>
          }
        />
      ) : (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className={theadCls}>
                  <th scope="col" className={thCls}>{sortBtn('name', 'Product')}</th>
                  <th scope="col" className={thCls}>SKU</th>
                  <th scope="col" className={thCls}>Category</th>
                  <th scope="col" className={thCls}>{sortBtn('price', 'Price')}</th>
                  <th scope="col" className={thCls}>{sortBtn('stock', 'Stock')}</th>
                  <th scope="col" className={thCls}>Status</th>
                  <th scope="col" className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const pill = stockPill(p.stock);
                  return (
                    <tr key={p.id} className={rowCls}>
                      <td className={tdCls}>
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.images[0] ?? 'https://picsum.photos/seed/novamart/200/200'}
                            alt={p.name}
                            className="h-11 w-11 shrink-0 rounded-lg border border-[#2E2820] object-cover"
                            loading="lazy"
                            onError={(ev) => {
                              (ev.target as HTMLImageElement).src =
                                'https://picsum.photos/seed/novamart/200/200';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="max-w-[230px] truncate font-semibold text-[#F2EBDD]">
                              {p.name}
                            </p>
                            <p className="text-xs text-[#A39A89]">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className={tdCls}>
                        <Mono>{p.id}</Mono>
                      </td>
                      <td className={`${tdCls} text-[#A39A89]`}>{catName(p.category)}</td>
                      <td className={tdCls}>
                        <span className="font-semibold text-[#F2EBDD]">{currency(p.price)}</span>
                        {p.compareAtPrice && (
                          <span className="ml-1.5 text-xs text-[#A39A89] line-through">
                            {currency(p.compareAtPrice)}
                          </span>
                        )}
                      </td>
                      <td className={tdCls}>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            aria-label={`Decrease stock for ${p.name}`}
                            onClick={() => handleAdjust(p.id, -1)}
                            disabled={p.stock === 0}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2E2820] text-[#A39A89] transition hover:border-[#E4572E] hover:text-[#E4572E] disabled:opacity-30 disabled:hover:border-[#2E2820] disabled:hover:text-[#A39A89]"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span
                            className={`w-10 text-center font-semibold tabular-nums ${stockNumCls(p.stock)}`}
                          >
                            {p.stock}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase stock for ${p.name}`}
                            onClick={() => handleAdjust(p.id, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2E2820] text-[#A39A89] transition hover:border-[#E4572E] hover:text-[#E4572E]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className={tdCls}>
                        <span
                          className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${pill.cls}`}
                        >
                          {pill.label}
                        </span>
                      </td>
                      <td className={tdCls}>
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${p.id}`}
                            aria-label={`Edit ${p.name}`}
                            className="rounded-lg p-2 text-[#A39A89] transition hover:bg-white/5 hover:text-[#E4572E]"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            aria-label={`Delete ${p.name}`}
                            onClick={() => setDeleteTarget(p)}
                            className="rounded-lg p-2 text-[#A39A89] transition hover:bg-white/5 hover:text-[#E26D5A]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete product?"
          body={
            <p>
              <span className="font-semibold text-[#F2EBDD]">“{deleteTarget.name}”</span> will be
              removed from the store and every listing. This cannot be undone.
            </p>
          }
          confirmLabel="Delete product"
          danger
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
