'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Pencil, Plus, TicketPercent, Trash2, X } from 'lucide-react';
import { deleteCoupon, getCoupons, saveCoupon } from '@/lib/store';
import { currency, formatDate } from '@/lib/format';
import type { Coupon, CouponType } from '@/lib/types';
import {
  Btn,
  ConfirmDialog,
  EmptyBox,
  Field,
  PageHeader,
  Panel,
  SearchInput,
  Toast,
  inputCls,
} from '../_ui';

interface CouponFormState {
  code: string;
  type: CouponType;
  value: string;
  minOrder: string;
  expiresAt: string;
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
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultExpiry(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return toLocalInput(d.toISOString());
}

function emptyForm(): CouponFormState {
  return { code: '', type: 'percent', value: '10', minOrder: '0', expiresAt: defaultExpiry(), usageLimit: '100', active: true };
}

function formFromCoupon(c: Coupon): CouponFormState {
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

function validateForm(f: CouponFormState, existing: Coupon[], editingCode: string | null): Record<string, string> {
  const errors: Record<string, string> = {};
  const code = f.code.trim().toUpperCase();
  if (!code) errors.code = 'Coupon code is required.';
  else if (!/^[A-Z0-9][A-Z0-9_-]{2,19}$/.test(code))
    errors.code = 'Use 3–20 characters: letters, numbers, hyphens or underscores.';
  else if (!editingCode && existing.some((c) => c.code.toUpperCase() === code))
    errors.code = 'This code already exists — pick another one.';

  const value = Number(f.value);
  if (f.type === 'percent' && (!Number.isFinite(value) || value < 1 || value > 100))
    errors.value = 'Enter a percent between 1 and 100.';
  if (f.type === 'flat' && (!Number.isFinite(value) || value <= 0 || value > 10000))
    errors.value = 'Enter a discount amount between $0 and $10,000.';
  if (f.minOrder.trim() === '' || !Number.isFinite(Number(f.minOrder)) || Number(f.minOrder) < 0)
    errors.minOrder = 'Enter a minimum order of $0 or more.';
  const limit = Number(f.usageLimit);
  if (!Number.isInteger(limit) || limit < 1) errors.usageLimit = 'Enter a whole number of 1 or more.';
  if (!f.expiresAt) errors.expiresAt = 'Pick an expiry date and time.';
  else {
    const exp = new Date(f.expiresAt).getTime();
    if (Number.isNaN(exp)) errors.expiresAt = 'That date is not valid.';
    else if (!editingCode && exp <= Date.now()) errors.expiresAt = 'New coupons must expire in the future.';
  }
  return errors;
}

function discountLabel(c: Coupon): string {
  if (c.type === 'percent') return `${c.value}% off`;
  if (c.type === 'flat') return `${currency(c.value)} off`;
  return 'Free shipping';
}

function isExpired(c: Coupon): boolean {
  return new Date(c.expiresAt).getTime() <= Date.now();
}

function CouponCard({
  coupon,
  onToggle,
  onEdit,
  onDelete,
}: {
  coupon: Coupon;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const c = coupon;
  const pct = c.usageLimit > 0 ? Math.min(100, Math.round((c.used / c.usageLimit) * 100)) : 0;
  const expired = isExpired(c);
  const exhausted = c.used >= c.usageLimit;
  const barColor = exhausted ? 'bg-[#E26D5A]' : pct >= 80 ? 'bg-[#E0A458]' : 'bg-[#E4572E]';

  return (
    <Panel className={`flex flex-col p-5 transition ${!c.active || expired ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-block rounded-md border border-dashed border-[#E4572E]/50 bg-[#E4572E]/10 px-2.5 py-1 font-mono text-sm font-bold tracking-wider text-[#E4572E]">
            {c.code}
          </p>
          <p className="mt-2 text-lg font-semibold text-[#F2EBDD]">{discountLabel(c)}</p>
          <p className="text-xs text-[#A39A89]">
            {TYPE_LABELS[c.type]} · min {currency(c.minOrder)}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={c.active}
          aria-label={`Toggle ${c.code} ${c.active ? 'off' : 'on'}`}
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            c.active ? 'bg-[#E4572E]' : 'bg-[#2E2820]'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              c.active ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[#A39A89]">
            <span className="font-semibold tabular-nums text-[#F2EBDD]">{c.used}</span>
            <span className="text-[#A39A89]/70"> / {c.usageLimit} used</span>
          </span>
          <span className="tabular-nums text-[#A39A89]">{pct}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#14110D]">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#2E2820] pt-3.5">
        <div className="flex items-center gap-2 text-xs">
          {expired ? (
            <span className="rounded-full border border-[#E26D5A]/30 bg-[#E26D5A]/10 px-2 py-0.5 font-semibold text-[#E26D5A]">
              Expired
            </span>
          ) : exhausted ? (
            <span className="rounded-full border border-[#E0A458]/30 bg-[#E0A458]/10 px-2 py-0.5 font-semibold text-[#E0A458]">
              Limit reached
            </span>
          ) : !c.active ? (
            <span className="rounded-full border border-[#2E2820] bg-[#14110D] px-2 py-0.5 font-semibold text-[#A39A89]">
              Paused
            </span>
          ) : (
            <span className="rounded-full border border-[#7FB069]/30 bg-[#7FB069]/10 px-2 py-0.5 font-semibold text-[#7FB069]">
              Live
            </span>
          )}
          <span className="text-[#A39A89]">Ends {formatDate(c.expiresAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${c.code}`}
            className="rounded-lg p-2 text-[#A39A89] transition hover:bg-white/5 hover:text-[#E4572E]"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${c.code}`}
            className="rounded-lg p-2 text-[#A39A89] transition hover:bg-white/5 hover:text-[#E26D5A]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Panel>
  );
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponFormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

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

  const live = useMemo(() => coupons.filter((c) => c.active && !isExpired(c)).length, [coupons]);

  const flash = (msg: string) => {
    setBanner(msg);
    window.setTimeout(() => setBanner(null), 3200);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm(formFromCoupon(c));
    setErrors({});
    setModalOpen(true);
  };

  const set = <K extends keyof CouponFormState>(key: K, value: CouponFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
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
    flash(editing ? `Coupon ${code} updated.` : `Coupon ${code} created and live.`);
  };

  const toggleActive = (c: Coupon) => {
    const next = { ...c, active: !c.active };
    try {
      saveCoupon(next);
    } catch {
      return;
    }
    setCoupons((prev) => prev.map((x) => (x.code === c.code ? next : x)));
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    try {
      deleteCoupon(deleteTarget.code);
    } catch {
      setDeleteTarget(null);
      return;
    }
    setCoupons((prev) => prev.filter((c) => c.code !== deleteTarget.code));
    flash(`Coupon ${deleteTarget.code} deleted.`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons"
        sub={`${coupons.length} codes total · ${live} live right now. Shoppers apply them at checkout.`}
        actions={
          <Btn onClick={openAdd}>
            <Plus className="h-4 w-4" /> New coupon
          </Btn>
        }
      />

      {banner && <Toast message={banner} />}

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search codes…"
        ariaLabel="Search coupons"
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <EmptyBox
          icon={TicketPercent}
          title="No coupons found"
          hint={query ? 'Try a different search.' : 'Create your first coupon to start offering discounts.'}
          action={
            <Btn onClick={openAdd}>
              <Plus className="h-4 w-4" /> New coupon
            </Btn>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CouponCard
              key={c.code}
              coupon={c}
              onToggle={() => toggleActive(c)}
              onEdit={() => openEdit(c)}
              onDelete={() => setDeleteTarget(c)}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
          <div className="absolute inset-0 bg-black/70" onClick={() => setModalOpen(false)} aria-hidden="true" />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[14px] border border-[#2E2820] bg-[#1E1A14] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#F2EBDD]">
                  {editing ? `Edit ${editing.code}` : 'New coupon'}
                </h2>
                <p className="mt-0.5 text-sm text-[#A39A89]">
                  Shoppers enter this code at checkout to get the discount.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-[#A39A89] transition hover:bg-white/5 hover:text-[#F2EBDD]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Field label="Code" error={errors.code} htmlFor="coupon-code">
                <input
                  id="coupon-code"
                  value={form.code}
                  disabled={!!editing}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => set('code', e.target.value)}
                  placeholder="e.g. SUMMER25"
                  className={`${inputCls} font-mono uppercase ${editing ? 'opacity-50' : ''}`}
                />
              </Field>
              {editing && (
                <p className="-mt-2 text-xs text-[#A39A89]">
                  The code itself can&apos;t be changed — create a new coupon instead.
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Discount type" htmlFor="coupon-type">
                  <select
                    id="coupon-type"
                    value={form.type}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => set('type', e.target.value as CouponType)}
                    className={inputCls}
                  >
                    <option value="percent">Percent off</option>
                    <option value="flat">Flat amount off</option>
                    <option value="freeship">Free shipping</option>
                  </select>
                </Field>
                <Field
                  label={form.type === 'percent' ? 'Percent (%)' : form.type === 'flat' ? 'Amount (USD)' : 'Value'}
                  error={errors.value}
                  htmlFor="coupon-value"
                >
                  <input
                    id="coupon-value"
                    type="number"
                    min="0"
                    step="any"
                    disabled={form.type === 'freeship'}
                    value={form.type === 'freeship' ? '' : form.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set('value', e.target.value)}
                    placeholder={form.type === 'freeship' ? 'Not needed' : undefined}
                    className={`${inputCls} ${form.type === 'freeship' ? 'opacity-50' : ''}`}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Minimum order (USD)" error={errors.minOrder} htmlFor="coupon-min">
                  <input
                    id="coupon-min"
                    type="number"
                    min="0"
                    step="any"
                    value={form.minOrder}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set('minOrder', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Usage limit" error={errors.usageLimit} htmlFor="coupon-limit">
                  <input
                    id="coupon-limit"
                    type="number"
                    min="1"
                    step="1"
                    value={form.usageLimit}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set('usageLimit', e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Expires at" error={errors.expiresAt} htmlFor="coupon-expires">
                <input
                  id="coupon-expires"
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => set('expiresAt', e.target.value)}
                  className={`${inputCls} [color-scheme:dark]`}
                />
              </Field>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => set('active', e.target.checked)}
                  className="h-4 w-4 rounded accent-[#E4572E]"
                />
                <span className="text-sm text-[#F2EBDD]">Active — shoppers can use this coupon right away</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <Btn variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Btn>
                <Btn type="submit" size="sm">
                  {editing ? 'Save changes' : 'Create coupon'}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete coupon?"
          body={
            <p>
              <span className="font-mono font-semibold text-[#F2EBDD]">{deleteTarget.code}</span> will
              be removed permanently. Shoppers holding this code lose the discount.
            </p>
          }
          confirmLabel="Delete coupon"
          danger
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
