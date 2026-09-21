'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Pencil, Plus, Search, TicketPercent, Trash2, X } from 'lucide-react';
import { deleteCoupon, getCoupons, saveCoupon } from '@/lib/store';
import { currency, formatDate } from '@/lib/format';
import type { Coupon, CouponType } from '@/lib/types';

interface CouponForm {
  code: string;
  type: CouponType;
  value: string;
  minOrder: string;
  expiresAt: string; // datetime-local value
  usageLimit: string;
  active: boolean;
}

const TYPE_LABELS: Record<CouponType, string> = {
  percent: 'Percent off',
  flat: 'Flat discount',
  freeship: 'Free shipping',
};

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

function defaultExpiry(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return toLocalInput(d.toISOString());
}

function emptyForm(): CouponForm {
  return {
    code: '',
    type: 'percent',
    value: '10',
    minOrder: '0',
    expiresAt: defaultExpiry(),
    usageLimit: '100',
    active: true,
  };
}

function formFromCoupon(c: Coupon): CouponForm {
  return {
    code: c.code,
    type: c.type,
    value: String(c.value),
    minOrder: String(c.minOrder),
    expiresAt: toLocalInput(c.expiresAt),
    usageLimit: String(c.usageLimit),
    active: c.active,
  };
}

function validateForm(
  f: CouponForm,
  existing: Coupon[],
  editingCode: string | null
): Record<string, string> {
  const errors: Record<string, string> = {};
  const code = f.code.trim().toUpperCase();

  if (!code) {
    errors.code = 'Coupon code is required.';
  } else if (!/^[A-Z0-9][A-Z0-9_-]{2,19}$/.test(code)) {
    errors.code = 'Use 3–20 characters: letters, numbers, hyphens or underscores.';
  } else if (
    !editingCode &&
    existing.some((c) => c.code.toUpperCase() === code)
  ) {
    errors.code = 'This code already exists — pick another one.';
  }

  const value = Number(f.value);
  if (f.type === 'percent') {
    if (!Number.isFinite(value) || value < 1 || value > 100) {
      errors.value = 'Enter a percent between 1 and 100.';
    }
  } else if (f.type === 'flat') {
    if (!Number.isFinite(value) || value <= 0) {
      errors.value = 'Enter a discount amount greater than $0.';
    } else if (value > 10000) {
      errors.value = 'That amount looks too large — double-check it.';
    }
  }

  if (f.minOrder.trim() === '' || !Number.isFinite(Number(f.minOrder)) || Number(f.minOrder) < 0) {
    errors.minOrder = 'Enter a minimum order of $0 or more.';
  }

  const limit = Number(f.usageLimit);
  if (!Number.isInteger(limit) || limit < 1) {
    errors.usageLimit = 'Enter a whole number of 1 or more.';
  }

  if (!f.expiresAt) {
    errors.expiresAt = 'Pick an expiry date and time.';
  } else {
    const exp = new Date(f.expiresAt).getTime();
    if (Number.isNaN(exp)) {
      errors.expiresAt = 'That date is not valid.';
    } else if (!editingCode && exp <= Date.now()) {
      errors.expiresAt = 'New coupons must expire in the future.';
    }
  }

  return errors;
}

function discountLabel(c: Coupon): string {
  if (c.type === 'percent') return `${c.value}% off`;
  if (c.type === 'flat') return `${currency(c.value)} off`;
  return 'Free shipping';
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
const labelClass = 'block text-sm font-medium text-gray-700';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-600">{message}</p>;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  useEffect(() => {
    try {
      setCoupons(getCoupons());
    } catch {
      setCoupons([]);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return coupons;
    return coupons.filter((c) => c.code.toUpperCase().includes(q));
  }, [coupons, query]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(c: Coupon) {
    setEditing(c);
    setForm(formFromCoupon(c));
    setErrors({});
    setModalOpen(true);
  }

  function set<K extends keyof CouponForm>(key: K, value: CouponForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validateForm(form, coupons, editing ? editing.code : null);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const code = form.code.trim().toUpperCase();
    const coupon: Coupon = {
      code,
      type: form.type,
      value: form.type === 'freeship' ? 0 : Number(form.value),
      minOrder: Number(form.minOrder),
      expiresAt: new Date(form.expiresAt).toISOString(),
      usageLimit: Number(form.usageLimit),
      used: editing ? editing.used : 0,
      active: form.active,
    };
    try {
      saveCoupon(coupon);
    } catch {
      setErrors({ code: 'Could not save the coupon — please try again.' });
      return;
    }
    setCoupons((prev) => {
      const rest = prev.filter((c) => c.code !== coupon.code);
      return [...rest, coupon].sort((a, b) => a.code.localeCompare(b.code));
    });
    setModalOpen(false);
  }

  function toggleActive(c: Coupon) {
    const next = { ...c, active: !c.active };
    try {
      saveCoupon(next);
    } catch {
      return;
    }
    setCoupons((prev) => prev.map((x) => (x.code === c.code ? next : x)));
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    try {
      deleteCoupon(deleteTarget.code);
    } catch {
      setDeleteTarget(null);
      return;
    }
    setCoupons((prev) => prev.filter((c) => c.code !== deleteTarget.code));
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create discount codes shoppers can apply at checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Add coupon
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search codes…"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <TicketPercent className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 font-medium text-gray-900">No coupons found</p>
            <p className="mt-1 text-sm text-gray-500">
              {query ? 'Try a different search.' : 'Add your first coupon to start offering discounts.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Code</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Value</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Min order</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Expires</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Used</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Active</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c) => {
                  const pct =
                    c.usageLimit > 0 ? Math.min(100, Math.round((c.used / c.usageLimit) * 100)) : 0;
                  const expired = new Date(c.expiresAt).getTime() <= Date.now();
                  return (
                    <tr key={c.code} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="rounded-md bg-indigo-50 px-2 py-1 font-mono text-xs font-semibold text-indigo-700">
                          {c.code}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">{TYPE_LABELS[c.type]}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                        {discountLabel(c)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-gray-600">
                        {currency(c.minOrder)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        <span className={expired ? 'font-medium text-rose-600' : undefined}>
                          {formatDate(c.expiresAt)}
                        </span>
                        {expired && (
                          <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums text-gray-600">
                            {c.used}/{c.usageLimit}
                          </span>
                          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                            <span
                              className={`block h-full rounded-full ${pct >= 100 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={c.active}
                          aria-label={`Toggle ${c.code} active`}
                          onClick={() => toggleActive(c)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            c.active ? 'bg-indigo-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              c.active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          aria-label={`Edit ${c.code}`}
                          className="mr-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(c)}
                          aria-label={`Delete ${c.code}`}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/50"
            onClick={() => setModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editing ? `Edit coupon ${editing.code}` : 'Add coupon'}
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Shoppers enter this code at checkout to get the discount.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="coupon-code" className={labelClass}>
                  Code
                </label>
                <input
                  id="coupon-code"
                  value={form.code}
                  disabled={!!editing}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => set('code', e.target.value)}
                  placeholder="e.g. SUMMER25"
                  className={`${inputClass} font-mono uppercase ${editing ? 'bg-gray-100 text-gray-500' : ''}`}
                />
                <FieldError message={errors.code} />
                {editing && (
                  <p className="mt-1 text-xs text-gray-500">
                    The code itself can&apos;t be changed — create a new coupon instead.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="coupon-type" className={labelClass}>
                    Discount type
                  </label>
                  <select
                    id="coupon-type"
                    value={form.type}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      set('type', e.target.value as CouponType)
                    }
                    className={inputClass}
                  >
                    <option value="percent">Percent off</option>
                    <option value="flat">Flat amount off</option>
                    <option value="freeship">Free shipping</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="coupon-value" className={labelClass}>
                    {form.type === 'percent' ? 'Percent (%)' : form.type === 'flat' ? 'Amount (USD)' : 'Value'}
                  </label>
                  <input
                    id="coupon-value"
                    type="number"
                    min="0"
                    step="any"
                    disabled={form.type === 'freeship'}
                    value={form.type === 'freeship' ? '' : form.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set('value', e.target.value)}
                    placeholder={form.type === 'freeship' ? 'Not needed' : undefined}
                    className={`${inputClass} ${form.type === 'freeship' ? 'bg-gray-100 text-gray-400' : ''}`}
                  />
                  <FieldError message={errors.value} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="coupon-min" className={labelClass}>
                    Minimum order (USD)
                  </label>
                  <input
                    id="coupon-min"
                    type="number"
                    min="0"
                    step="any"
                    value={form.minOrder}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set('minOrder', e.target.value)}
                    className={inputClass}
                  />
                  <FieldError message={errors.minOrder} />
                </div>
                <div>
                  <label htmlFor="coupon-limit" className={labelClass}>
                    Usage limit
                  </label>
                  <input
                    id="coupon-limit"
                    type="number"
                    min="1"
                    step="1"
                    value={form.usageLimit}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set('usageLimit', e.target.value)}
                    className={inputClass}
                  />
                  <FieldError message={errors.usageLimit} />
                </div>
              </div>

              <div>
                <label htmlFor="coupon-expires" className={labelClass}>
                  Expires at
                </label>
                <input
                  id="coupon-expires"
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => set('expiresAt', e.target.value)}
                  className={inputClass}
                />
                <FieldError message={errors.expiresAt} />
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => set('active', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">
                  Active — shoppers can use this coupon right away
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  {editing ? 'Save changes' : 'Create coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/50"
            onClick={() => setDeleteTarget(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Delete coupon?</h2>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-mono font-semibold text-gray-900">{deleteTarget.code}</span> will be
              removed permanently. Shoppers with this code will no longer get the discount.
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
