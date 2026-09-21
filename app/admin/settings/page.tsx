'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import { getSettings, saveSettings } from '@/lib/store';
import { currency } from '@/lib/format';
import type { StoreSettings } from '@/lib/types';
import { Btn, ConfirmDialog, Field, PageHeader, Panel, Toast, inputCls } from '../_ui';

interface SettingsForm {
  storeName: string;
  tagline: string;
  announcement: string;
  shippingFlat: string;
  freeShipOver: string;
  taxRate: string; // displayed as PERCENT, saved as fraction (/100) — do not change this convention
  supportEmail: string;
}

function formFromSettings(s: StoreSettings): SettingsForm {
  return {
    storeName: s.storeName,
    tagline: s.tagline,
    announcement: s.announcement,
    shippingFlat: String(s.shippingFlat),
    freeShipOver: String(s.freeShipOver),
    taxRate: String(Math.round(s.taxRate * 100 * 100) / 100),
    supportEmail: s.supportEmail,
  };
}

function validateForm(f: SettingsForm): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!f.storeName.trim()) errors.storeName = 'Store name is required.';
  else if (f.storeName.trim().length > 60) errors.storeName = 'Keep the store name under 60 characters.';
  if (f.tagline.trim().length > 120) errors.tagline = 'Keep the tagline under 120 characters.';
  if (f.announcement.trim().length > 160) errors.announcement = 'Keep the announcement under 160 characters.';
  const shippingFlat = Number(f.shippingFlat);
  if (f.shippingFlat.trim() === '' || !Number.isFinite(shippingFlat) || shippingFlat < 0)
    errors.shippingFlat = 'Enter a shipping fee of $0 or more.';
  const freeShipOver = Number(f.freeShipOver);
  if (f.freeShipOver.trim() === '' || !Number.isFinite(freeShipOver) || freeShipOver < 0)
    errors.freeShipOver = 'Enter an order threshold of $0 or more.';
  const taxRate = Number(f.taxRate);
  if (f.taxRate.trim() === '' || !Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100)
    errors.taxRate = 'Enter a tax rate between 0 and 100.';
  if (!f.supportEmail.trim()) errors.supportEmail = 'Support email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.supportEmail.trim()))
    errors.supportEmail = 'Enter a valid email address.';
  return errors;
}

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-semibold text-[#F2EBDD]">{title}</h2>
      <p className="mt-0.5 text-[13px] text-[#A39A89]">{sub}</p>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    try {
      setForm(formFromSettings(getSettings()));
    } catch {
      setForm(null);
    }
  }, []);

  const set = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  };

  /** Live preview of what a $100 order would cost with the current draft values. */
  const preview = useMemo(() => {
    if (!form) return null;
    const taxPct = Number(form.taxRate);
    const ship = Number(form.shippingFlat);
    const threshold = Number(form.freeShipOver);
    if (![taxPct, ship, threshold].every(Number.isFinite)) return null;
    const subtotal = 100;
    const tax = Math.round(subtotal * (taxPct / 100) * 100) / 100;
    const shipping = subtotal >= threshold ? 0 : ship;
    return { tax, shipping, total: Math.round((subtotal + tax + shipping) * 100) / 100 };
  }, [form]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const errs = validateForm(form);
    setErrors(errs);
    setSaved(false);
    setSaveFailed(false);
    if (Object.keys(errs).length > 0) return;

    const settings: StoreSettings = {
      storeName: form.storeName.trim(),
      tagline: form.tagline.trim(),
      announcement: form.announcement.trim(),
      shippingFlat: Number(form.shippingFlat),
      freeShipOver: Number(form.freeShipOver),
      taxRate: Number(form.taxRate) / 100, // percent → fraction (store convention)
      supportEmail: form.supportEmail.trim(),
    };
    try {
      saveSettings(settings);
    } catch {
      setSaveFailed(true);
      return;
    }
    setSaved(true);
  };

  const handleReset = () => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('novamart_'))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* storage unavailable — still reload */
    }
    window.location.reload();
  };

  if (form === null) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" sub="Loading store settings…" />
        <Panel className="h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        sub="Control how the storefront reads and how checkout totals are calculated. Everything saves to this browser."
      />

      {saved && <Toast message="Settings saved — the storefront picks them up right away." />}
      {saveFailed && (
        <div className="flex items-center gap-2.5 rounded-[14px] border border-[#E26D5A]/30 bg-[#E26D5A]/10 px-4 py-3 text-sm font-medium text-[#E26D5A]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Could not save settings — please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Panel className="p-6">
              <SectionHead title="Branding" sub="Name, tagline, and the site-wide announcement bar." />
              <div className="space-y-4">
                <Field label="Store name" error={errors.storeName} htmlFor="set-storeName">
                  <input
                    id="set-storeName"
                    value={form.storeName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set('storeName', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Tagline" error={errors.tagline} htmlFor="set-tagline">
                  <input
                    id="set-tagline"
                    value={form.tagline}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set('tagline', e.target.value)}
                    placeholder="Everything you love, delivered."
                    className={inputCls}
                  />
                </Field>
                <Field
                  label="Announcement bar"
                  error={errors.announcement}
                  hint="Leave empty to hide the announcement bar on the storefront."
                  htmlFor="set-announcement"
                >
                  <input
                    id="set-announcement"
                    value={form.announcement}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set('announcement', e.target.value)}
                    placeholder="e.g. Free shipping on orders over $75"
                    className={inputCls}
                  />
                </Field>
              </div>
            </Panel>

            <Panel className="p-6">
              <SectionHead title="Shipping & tax" sub="Used at checkout to calculate order totals." />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Flat shipping (USD)" error={errors.shippingFlat} htmlFor="set-shipping">
                  <input
                    id="set-shipping"
                    type="number"
                    min="0"
                    step="any"
                    value={form.shippingFlat}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set('shippingFlat', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Free shipping over (USD)" error={errors.freeShipOver} htmlFor="set-freeship">
                  <input
                    id="set-freeship"
                    type="number"
                    min="0"
                    step="any"
                    value={form.freeShipOver}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set('freeShipOver', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Tax rate (%)" error={errors.taxRate} htmlFor="set-tax">
                  <input
                    id="set-tax"
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    value={form.taxRate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set('taxRate', e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
            </Panel>

            <Panel className="p-6">
              <SectionHead title="Support" sub="Where shoppers reach you for help." />
              <Field label="Support email" error={errors.supportEmail} htmlFor="set-email">
                <input
                  id="set-email"
                  type="email"
                  value={form.supportEmail}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => set('supportEmail', e.target.value)}
                  className={`${inputCls} max-w-md`}
                />
              </Field>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel className="p-6">
              <SectionHead title="Checkout preview" sub="What a $100 order costs with these values." />
              {preview ? (
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#A39A89]">Subtotal</dt>
                    <dd className="tabular-nums text-[#F2EBDD]">{currency(100)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#A39A89]">Tax ({form.taxRate || '0'}%)</dt>
                    <dd className="tabular-nums text-[#F2EBDD]">{currency(preview.tax)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#A39A89]">Shipping</dt>
                    <dd className="tabular-nums text-[#F2EBDD]">
                      {preview.shipping === 0 ? 'Free' : currency(preview.shipping)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-[#2E2820] pt-2.5">
                    <dt className="font-semibold text-[#F2EBDD]">Total</dt>
                    <dd className="font-bold tabular-nums text-[#E4572E]">{currency(preview.total)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-[#A39A89]">Enter valid numbers to see the preview.</p>
              )}
            </Panel>

            <Panel className="border-[#E26D5A]/25 p-6">
              <SectionHead title="Danger zone" sub="Wipe every demo change in this browser and restore seed data." />
              <Btn variant="danger" onClick={() => setConfirmReset(true)}>
                <RotateCcw className="h-4 w-4" /> Reset demo data
              </Btn>
            </Panel>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#2E2820] pt-5">
          <span className="mr-auto flex items-center gap-1.5 text-xs text-[#A39A89]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#7FB069]" />
            Tax is stored as a fraction (8% → 0.08) — the checkout math depends on it.
          </span>
          <Btn type="submit">Save settings</Btn>
        </div>
      </form>

      {confirmReset && (
        <ConfirmDialog
          title="Reset all demo data?"
          body={
            <p>
              Carts, users, orders, coupons, settings and admin edits in this browser will be wiped
              and the original seed data restored. This cannot be undone.
            </p>
          }
          confirmLabel="Wipe everything"
          danger
          onCancel={() => setConfirmReset(false)}
          onConfirm={handleReset}
        />
      )}
    </div>
  );
}
