'use client';

import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import { getSettings, saveSettings } from '@/lib/store';
import type { StoreSettings } from '@/lib/types';

interface SettingsForm {
  storeName: string;
  tagline: string;
  announcement: string;
  shippingFlat: string;
  freeShipOver: string;
  taxRate: string;
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

  if (!f.storeName.trim()) {
    errors.storeName = 'Store name is required.';
  } else if (f.storeName.trim().length > 60) {
    errors.storeName = 'Keep the store name under 60 characters.';
  }
  if (f.tagline.trim().length > 120) {
    errors.tagline = 'Keep the tagline under 120 characters.';
  }
  if (f.announcement.trim().length > 160) {
    errors.announcement = 'Keep the announcement under 160 characters.';

  }
  const shippingFlat = Number(f.shippingFlat);
  if (f.shippingFlat.trim() === '' || !Number.isFinite(shippingFlat) || shippingFlat < 0) {
    errors.shippingFlat = 'Enter a shipping fee of $0 or more.';
  }
  const freeShipOver = Number(f.freeShipOver);
  if (f.freeShipOver.trim() === '' || !Number.isFinite(freeShipOver) || freeShipOver < 0) {
    errors.freeShipOver = 'Enter an order threshold of $0 or more.';
  }
  const taxRate = Number(f.taxRate);
  if (f.taxRate.trim() === '' || !Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
    errors.taxRate = 'Enter a tax rate between 0 and 100.';
  }
  if (!f.supportEmail.trim()) {
    errors.supportEmail = 'Support email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.supportEmail.trim())) {
    errors.supportEmail = 'Enter a valid email address.';
  }

  return errors;
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
const labelClass = 'block text-sm font-medium text-gray-700';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-600">{message}</p>;
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

  useEffect(() => {
    if (!confirmReset) return;
    const t = setTimeout(() => setConfirmReset(false), 6000);
    return () => clearTimeout(t);
  }, [confirmReset]);

  function set<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  function handleSubmit(e: FormEvent) {
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
      taxRate: Number(form.taxRate) / 100,
      supportEmail: form.supportEmail.trim(),
    };
    try {
      saveSettings(settings);
    } catch {
      setSaveFailed(true);
      return;
    }
    setSaved(true);
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('novamart_'))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* storage unavailable — still reload */
    }
    window.location.reload();
  }

  if (form === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Loading store settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Control how your storefront looks and how checkout totals are calculated.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          Settings saved — the storefront picks them up right away.
        </div>
      )}
      {saveFailed && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          Could not save settings — please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Branding</h2>
          <p className="mt-0.5 text-sm text-gray-500">Name, tagline, and the site-wide announcement bar.</p>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="set-storeName" className={labelClass}>
                Store name
              </label>
              <input
                id="set-storeName"
                value={form.storeName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => set('storeName', e.target.value)}
                className={inputClass}
              />
              <FieldError message={errors.storeName} />
            </div>
            <div>
              <label htmlFor="set-tagline" className={labelClass}>
                Tagline
              </label>
              <input
                id="set-tagline"
                value={form.tagline}
                onChange={(e: ChangeEvent<HTMLInputElement>) => set('tagline', e.target.value)}
                placeholder="Everything you love, delivered."
                className={inputClass}
              />
              <FieldError message={errors.tagline} />
            </div>
            <div>
              <label htmlFor="set-announcement" className={labelClass}>
                Announcement bar
              </label>
              <input
                id="set-announcement"
                value={form.announcement}
                onChange={(e: ChangeEvent<HTMLInputElement>) => set('announcement', e.target.value)}
                placeholder="e.g. Free shipping on orders over $75"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to hide the announcement bar on the storefront.
              </p>
              <FieldError message={errors.announcement} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Shipping &amp; tax</h2>
          <p className="mt-0.5 text-sm text-gray-500">Used at checkout to calculate order totals.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="set-shipping" className={labelClass}>
                Flat shipping fee (USD)
              </label>
              <input
                id="set-shipping"
                type="number"
                min="0"
                step="any"
                value={form.shippingFlat}
                onChange={(e: ChangeEvent<HTMLInputElement>) => set('shippingFlat', e.target.value)}
                className={inputClass}
              />
              <FieldError message={errors.shippingFlat} />
            </div>
            <div>
              <label htmlFor="set-freeship" className={labelClass}>
                Free shipping over (USD)
              </label>
              <input
                id="set-freeship"
                type="number"
                min="0"
                step="any"
                value={form.freeShipOver}
                onChange={(e: ChangeEvent<HTMLInputElement>) => set('freeShipOver', e.target.value)}
                className={inputClass}
              />
              <FieldError message={errors.freeShipOver} />
            </div>
            <div>
              <label htmlFor="set-tax" className={labelClass}>
                Tax rate (%)
              </label>
              <input
                id="set-tax"
                type="number"
                min="0"
                max="100"
                step="any"
                value={form.taxRate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => set('taxRate', e.target.value)}
                className={inputClass}
              />
              <FieldError message={errors.taxRate} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Support</h2>
          <p className="mt-0.5 text-sm text-gray-500">Where shoppers can reach you for help.</p>
          <div className="mt-4">
            <label htmlFor="set-email" className={labelClass}>
              Support email
            </label>
            <input
              id="set-email"
              type="email"
              value={form.supportEmail}
              onChange={(e: ChangeEvent<HTMLInputElement>) => set('supportEmail', e.target.value)}
              className={`${inputClass} max-w-md`}
            />
            <FieldError message={errors.supportEmail} />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Save settings
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-rose-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-rose-700">Danger zone</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Resetting clears every demo change stored in this browser — carts, users, orders, coupons,
          settings, and admin edits — and restores the original seed data on the next load.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className={`mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white ${
            confirmReset ? 'bg-rose-700 hover:bg-rose-800' : 'bg-rose-600 hover:bg-rose-700'
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          {confirmReset ? 'Click again to confirm reset' : 'Reset demo data'}
        </button>
        {confirmReset && (
          <p className="mt-2 text-xs text-rose-600">
            This cannot be undone. Click the button once more to wipe all demo data.
          </p>
        )}
      </div>
    </div>
  );
}
