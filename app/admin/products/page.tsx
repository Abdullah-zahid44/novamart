'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Minus,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { adjustStock, deleteProduct, getCategories, getProducts } from '@/lib/store';
import type { Category, Product } from '@/lib/types';
import { currency } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';

type SortKey = 'name' | 'price' | 'stock' | 'createdAt';
type SortDir = 'asc' | 'desc';

function statusFor(stock: number): { label: string; classes: string } {
  if (stock === 0) return { label: 'Out of stock', classes: 'bg-rose-100 text-rose-700' };
  if (stock < 10) return { label: 'Low stock', classes: 'bg-amber-100 text-amber-800' };
  return { label: 'In stock', classes: 'bg-emerald-100 text-emerald-700' };
}

function stockTextClass(stock: number): string {
  if (stock === 0) return 'text-rose-600';
  if (stock < 10) return 'text-amber-600';
  return 'text-slate-900';
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [banner, setBanner] = useState<string | null>(null);

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
    window.setTimeout(() => setBanner(null), 3000);
  };

  const refresh = () => setProducts(getProducts());

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      const matchesQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        catName(p.category).toLowerCase().includes(q);
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesQ && matchesCat;
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'price') cmp = a.price - b.price;
      else if (sortKey === 'stock') cmp = a.stock - b.stock;
      else cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [products, query, categoryFilter, sortKey, sortDir, catName]);

  const handleAdjust = (id: string, delta: number) => {
    adjustStock(id, delta);
    refresh();
    flash('Stock updated.');
  };

  const handleDelete = (p: Product) => {
    if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) {
      deleteProduct(p.id);
      refresh();
      flash(`"${p.name}" deleted.`);
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-slate-400" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-indigo-600" />
    ) : (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-indigo-600" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your catalog — {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      {banner && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {banner}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder="Search by name, SKU, brand or category…"
            className="pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(ev) => setCategoryFilter(ev.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:w-56"
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
        <EmptyState
          icon={Package}
          title="No products found"
          hint="Try adjusting your search or category filter — or add a new product to the catalog."
          action={
            <Link href="/admin/products/new">
              <Button variant="primary">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => toggleSort('price')} className="inline-flex items-center hover:text-slate-800">
                    Price <SortIcon k="price" />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => toggleSort('stock')} className="inline-flex items-center hover:text-slate-800">
                    Stock <SortIcon k="stock" />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const status = statusFor(p.stock);
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.images[0] ?? 'https://picsum.photos/seed/novamart/200/200'}
                          alt={p.name}
                          className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover"
                          onError={(ev) => {
                            (ev.target as HTMLImageElement).src = 'https://picsum.photos/seed/novamart/200/200';
                          }}
                        />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleSort('name')}
                            className="sr-only"
                            aria-label="Sort by name"
                          >
                            <SortIcon k="name" />
                          </button>
                          <p className="max-w-[220px] truncate font-medium text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-500">{p.id}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{catName(p.category)}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900">{currency(p.price)}</span>
                      {p.compareAtPrice && (
                        <span className="ml-1.5 text-xs text-slate-400 line-through">{currency(p.compareAtPrice)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Decrease stock for ${p.name}`}
                          onClick={() => handleAdjust(p.id, -1)}
                          disabled={p.stock === 0}
                          className="!px-2"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className={`w-10 text-center font-semibold tabular-nums ${stockTextClass(p.stock)}`}>
                          {p.stock}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Increase stock for ${p.name}`}
                          onClick={() => handleAdjust(p.id, 1)}
                          className="!px-2"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${status.classes}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${p.id}`}
                          aria-label={`Edit ${p.name}`}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          aria-label={`Delete ${p.name}`}
                          onClick={() => handleDelete(p)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
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
      )}
    </div>
  );
}
