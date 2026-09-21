'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import Link from 'next/link';
import { MessageSquareText, Search, Star, Trash2 } from 'lucide-react';
import { getProducts, getReviews } from '@/lib/store';
import { formatDate } from '@/lib/format';
import type { Review } from '@/lib/types';

/** Reviews ship in the seed file; deletions are a client-side demo override. */
const HIDDEN_KEY = 'novamart_reviews_hidden';

interface ReviewRow extends Review {
  productName: string;
  productSlug: string;
}

function loadHiddenIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : [];
  } catch {
    return [];
  }
}

function persistHiddenIds(ids: string[]) {
  try {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable */
  }
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= value ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<ReviewRow | null>(null);

  useEffect(() => {
    const hidden = loadHiddenIds();
    setHiddenIds(hidden);
    try {
      const products = getProducts();
      const all: ReviewRow[] = [];
      for (const p of products) {
        try {
          for (const r of getReviews(p.id)) {
            all.push({ ...r, productName: p.name, productSlug: p.slug });
          }
        } catch {
          /* skip products whose reviews fail to load */
        }
      }
      all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setRows(all);
    } catch {
      setRows([]);
    }
  }, []);

  const visible = useMemo(() => {
    const hidden = new Set(hiddenIds);
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (hidden.has(r.id)) return false;
      if (ratingFilter !== 'all' && r.rating !== Number(ratingFilter)) return false;
      if (!q) return true;
      return (
        r.productName.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q)
      );
    });
  }, [rows, hiddenIds, query, ratingFilter]);

  const average = useMemo(() => {
    if (visible.length === 0) return 0;
    return visible.reduce((s, r) => s + r.rating, 0) / visible.length;
  }, [visible]);

  function confirmDelete() {
    if (!deleteTarget) return;
    const next = [...hiddenIds, deleteTarget.id];
    setHiddenIds(next);
    persistHiddenIds(next);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="mt-1 text-sm text-gray-500">
            Moderate what shoppers say about your products.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
          <Stars value={Math.round(average)} />
          <span className="text-sm font-medium text-gray-900">{average.toFixed(1)}</span>
          <span className="text-sm text-gray-500">avg · {visible.length} reviews</span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product, customer, or text…"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <select
            value={ratingFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setRatingFilter(e.target.value)}
            aria-label="Filter by rating"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </div>

        {visible.length === 0 ? (
          <div className="p-10 text-center">
            <MessageSquareText className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 font-medium text-gray-900">No reviews found</p>
            <p className="mt-1 text-sm text-gray-500">
              {query || ratingFilter !== 'all'
                ? 'Try clearing your filters.'
                : 'Customer reviews will appear here once shoppers leave them.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Rating</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Review</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.map((r) => (
                  <tr key={r.id} className="align-top hover:bg-gray-50">
                    <td className="max-w-[180px] px-4 py-3">
                      <Link
                        href={`/product/${r.productSlug}`}
                        className="font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        {r.productName}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">{r.userName}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Stars value={r.rating} />
                    </td>
                    <td className="max-w-sm px-4 py-3">
                      <p className="font-medium text-gray-900">{r.title}</p>
                      <p className="mt-0.5 line-clamp-3 text-gray-600">{r.body}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(r)}
                        aria-label={`Delete review by ${r.userName}`}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/50"
            onClick={() => setDeleteTarget(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Delete review?</h2>
            <p className="mt-2 text-sm text-gray-600">
              The {deleteTarget.rating}-star review by{' '}
              <span className="font-medium text-gray-900">{deleteTarget.userName}</span> on{' '}
              <span className="font-medium text-gray-900">{deleteTarget.productName}</span> will be
              hidden from the storefront.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
