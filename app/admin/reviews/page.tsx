'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, MessageSquareText, Star } from 'lucide-react';
import { getProducts, getReviews } from '@/lib/store';
import { formatDate } from '@/lib/format';
import type { Review } from '@/lib/types';
import {
  Btn,
  ConfirmDialog,
  PageHeader,
  Panel,
  SearchInput,
  inputCls,
  rowCls,
  tdCls,
  thCls,
  theadCls,
} from '../_ui';

/** Reviews ship in the seed file; hiding is a client-side demo override. */
const HIDDEN_KEY = 'novamart_reviews_hidden';

interface ReviewRow extends Review {
  productName: string;
  productSlug: string;
}

function loadHiddenIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
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
          className={`h-3.5 w-3.5 ${i <= Math.round(value) ? 'fill-[#C99A2C] text-[#C99A2C]' : 'fill-[#2E2820] text-[#2E2820]'}`}
        />
      ))}
    </span>
  );
}

type Tab = 'visible' | 'hidden';

export default function AdminReviewsPage() {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [tab, setTab] = useState<Tab>('visible');
  const [hideTarget, setHideTarget] = useState<ReviewRow | null>(null);

  useEffect(() => {
    setHiddenIds(loadHiddenIds());
    try {
      const products = getProducts();
      const all: ReviewRow[] = [];
      for (const p of products) {
        try {
          for (const r of getReviews(p.id)) all.push({ ...r, productName: p.name, productSlug: p.slug });
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

  const hiddenSet = useMemo(() => new Set(hiddenIds), [hiddenIds]);

  const hide = (id: string) => {
    const next = [...hiddenIds, id];
    setHiddenIds(next);
    persistHiddenIds(next);
  };

  const unhide = (id: string) => {
    const next = hiddenIds.filter((x) => x !== id);
    setHiddenIds(next);
    persistHiddenIds(next);
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const isHidden = hiddenSet.has(r.id);
      if (tab === 'visible' && isHidden) return false;
      if (tab === 'hidden' && !isHidden) return false;
      if (ratingFilter !== 'all' && r.rating !== Number(ratingFilter)) return false;
      if (!q) return true;
      return (
        r.productName.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q)
      );
    });
  }, [rows, hiddenSet, tab, query, ratingFilter]);

  const visibleCount = rows.length - hiddenIds.length;
  const average = useMemo(() => {
    const vis = rows.filter((r) => !hiddenSet.has(r.id));
    if (vis.length === 0) return 0;
    return vis.reduce((s, r) => s + r.rating, 0) / vis.length;
  }, [rows, hiddenSet]);

  const tabBtn = (t: Tab, label: string, count: number) => (
    <button
      type="button"
      onClick={() => setTab(t)}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
        tab === t
          ? 'bg-[#E4572E] text-white'
          : 'border border-[#2E2820] text-[#A39A89] hover:border-[#E4572E] hover:text-[#E4572E]'
      }`}
    >
      {label} <span className="tabular-nums opacity-70">({count})</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        sub="Moderate what shoppers say. Hiding a review removes it from the storefront — nothing is ever truly deleted."
        actions={
          <div className="flex items-center gap-2.5 rounded-full border border-[#2E2820] bg-[#1E1A14] px-4 py-2">
            <Stars value={average} />
            <span className="text-sm font-semibold tabular-nums text-[#F2EBDD]">{average.toFixed(1)}</span>
            <span className="text-xs text-[#A39A89]">avg · {visibleCount} live</span>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {tabBtn('visible', 'Live', visibleCount)}
        {tabBtn('hidden', 'Hidden', hiddenIds.length)}
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#2E2820] p-4 sm:flex-row sm:items-center">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search product, customer, or text…"
            ariaLabel="Search reviews"
            className="flex-1"
          />
          <select
            value={ratingFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setRatingFilter(e.target.value)}
            aria-label="Filter by rating"
            className={`${inputCls} sm:w-44`}
          >
            <option value="all">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2E2820] bg-[#14110D] text-[#A39A89]">
              <MessageSquareText className="h-5 w-5" />
            </span>
            <p className="mt-4 font-semibold text-[#F2EBDD]">
              {tab === 'hidden' ? 'Nothing hidden' : 'No reviews found'}
            </p>
            <p className="mt-1 max-w-sm text-sm text-[#A39A89]">
              {tab === 'hidden'
                ? 'Hidden reviews land here, where you can restore them any time.'
                : query || ratingFilter !== 'all'
                  ? 'Try clearing your filters.'
                  : 'Customer reviews appear here once shoppers leave them.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className={theadCls}>
                  <th scope="col" className={thCls}>Product</th>
                  <th scope="col" className={thCls}>Customer</th>
                  <th scope="col" className={thCls}>Rating</th>
                  <th scope="col" className={thCls}>Review</th>
                  <th scope="col" className={thCls}>Date</th>
                  <th scope="col" className={`${thCls} text-right`}>Moderate</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} className={`${rowCls} align-top`}>
                    <td className={`${tdCls} max-w-[180px]`}>
                      <Link
                        href={`/product/${r.productSlug}`}
                        className="font-medium text-[#E4572E] hover:underline"
                      >
                        {r.productName}
                      </Link>
                    </td>
                    <td className={`${tdCls} whitespace-nowrap text-[#F2EBDD]`}>{r.userName}</td>
                    <td className={`${tdCls} whitespace-nowrap`}>
                      <Stars value={r.rating} />
                    </td>
                    <td className={`${tdCls} max-w-md`}>
                      <p className="font-semibold text-[#F2EBDD]">{r.title}</p>
                      <p className="mt-0.5 line-clamp-3 text-sm text-[#A39A89]">{r.body}</p>
                    </td>
                    <td className={`${tdCls} whitespace-nowrap text-[#A39A89]`}>
                      {formatDate(r.createdAt)}
                    </td>
                    <td className={`${tdCls} whitespace-nowrap text-right`}>
                      {tab === 'visible' ? (
                        <Btn
                          variant="secondary"
                          size="sm"
                          onClick={() => setHideTarget(r)}
                          aria-label={`Hide review by ${r.userName}`}
                        >
                          <EyeOff className="h-3.5 w-3.5" /> Hide
                        </Btn>
                      ) : (
                        <Btn
                          variant="secondary"
                          size="sm"
                          onClick={() => unhide(r.id)}
                          aria-label={`Restore review by ${r.userName}`}
                        >
                          <Eye className="h-3.5 w-3.5" /> Restore
                        </Btn>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {hideTarget && (
        <ConfirmDialog
          title="Hide this review?"
          body={
            <p>
              The {hideTarget.rating}-star review by{' '}
              <span className="font-semibold text-[#F2EBDD]">{hideTarget.userName}</span> on{' '}
              <span className="font-semibold text-[#F2EBDD]">{hideTarget.productName}</span> will
              disappear from the storefront. You can restore it from the Hidden tab.
            </p>
          }
          confirmLabel="Hide review"
          onCancel={() => setHideTarget(null)}
          onConfirm={() => {
            hide(hideTarget.id);
            setHideTarget(null);
          }}
        />
      )}
    </div>
  );
}
