'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Plus, X } from 'lucide-react';
import { getCategories, getProducts, saveProduct } from '@/lib/store';
import type { Category, Product } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';

type BadgeValue = '' | 'NEW' | 'SALE' | 'HOT' | 'BESTSELLER';

interface SpecRow {
  key: string;
  value: string;
}

interface ProductFormProps {
  product?: Product;
  mode: 'new' | 'edit';
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function splitCSV(s: string): string[] {
  const seen = new Set<string>();
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x) => {
      const k = x.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

function generateId(): string {
  return `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

const selectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200';

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

export default function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [brand, setBrand] = useState(product?.brand ?? '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice ? String(product.compareAtPrice) : ''
  );
  const [stock, setStock] = useState(product ? String(product.stock) : '0');
  const [colors, setColors] = useState(product?.colors.join(', ') ?? '');
  const [sizes, setSizes] = useState(product?.sizes?.join(', ') ?? '');
  const [tags, setTags] = useState(product?.tags.join(', ') ?? '');
  const [badge, setBadge] = useState<BadgeValue>(product?.badge ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [specs, setSpecs] = useState<SpecRow[]>(
    product && Object.keys(product.specs).length > 0
      ? Object.entries(product.specs).map(([key, value]) => ({ key, value }))
      : [{ key: '', value: '' }]
  );
  const [imagesText, setImagesText] = useState(product?.images.join('\n') ?? '');
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const handleSlugChange = (v: string) => {
    setSlug(v);
    setSlugTouched(true);
  };

  const updateSpec = (i: number, field: 'key' | 'value', v: string) => {
    setSpecs((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: v } : row)));
  };

  const removeSpec = (i: number) => {
    setSpecs((prev) => (prev.length === 1 ? [{ key: '', value: '' }] : prev.filter((_, idx) => idx !== i)));
  };

  const imageLines = imagesText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const removeImageLine = (line: string) => {
    const next = imagesText
      .split('\n')
      .filter((l) => l.trim() !== line)
      .join('\n');
    setImagesText(next);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Product name must be at least 2 characters.';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      e.slug = 'Slug must be lowercase letters, numbers and hyphens, e.g. "wireless-headphones".';
    const dup = getProducts().some((p) => p.slug === slug && p.id !== product?.id);
    if (dup) e.slug = 'This slug is already used by another product. Make it unique.';
    if (!brand.trim()) e.brand = 'Brand is required.';
    if (!category) e.category = 'Please choose a category.';
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) e.price = 'Price must be a number greater than 0.';
    if (compareAtPrice.trim()) {
      const c = parseFloat(compareAtPrice);
      if (isNaN(c) || c <= 0) e.compareAtPrice = 'Compare-at price must be greater than 0.';
    }
    const stockNum = Number(stock);
    if (stock.trim() === '' || !Number.isInteger(stockNum) || stockNum < 0)
      e.stock = 'Stock must be a whole number, 0 or more.';
    const badLine = imageLines.findIndex((l) => !/^https?:\/\/.+/.test(l));
    if (badLine >= 0)
      e.images = `Line ${badLine + 1} is not a valid URL. Every line must start with http:// or https://.`;
    if (!description.trim()) e.description = 'Description is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true);
    const priceNum = parseFloat(price);
    const compareNum = compareAtPrice.trim() ? parseFloat(compareAtPrice) : undefined;
    const specEntries = specs.filter((r) => r.key.trim()).map((r) => [r.key.trim(), r.value.trim()]);
    const finalProduct: Product = {
      id: product?.id ?? generateId(),
      slug,
      name: name.trim(),
      brand: brand.trim(),
      category,
      price: priceNum,
      compareAtPrice: compareNum,
      rating: product?.rating ?? 0,
      reviewsCount: product?.reviewsCount ?? 0,
      images: imageLines,
      colors: splitCSV(colors),
      sizes: splitCSV(sizes).length > 0 ? splitCSV(sizes) : undefined,
      stock: Number(stock),
      tags: splitCSV(tags),
      badge: badge || undefined,
      description: description.trim(),
      specs: Object.fromEntries(specEntries),
      featured,
      createdAt: product?.createdAt ?? new Date().toISOString(),
    };
    saveProduct(finalProduct);
    setSaved(true);
    window.setTimeout(() => router.push('/admin/products'), 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {saved && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Product saved successfully. Returning to the product list…
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-5 p-6">
            <h2 className="text-base font-semibold text-slate-900">Basic information</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Product name" error={errors.name}>
                <Input
                  value={name}
                  onChange={(ev) => handleNameChange(ev.target.value)}
                  placeholder="Aurora Wireless Headphones"
                />
              </Field>
              <Field label="URL slug" error={errors.slug} hint="Auto-generated from the name; you can edit it.">
                <Input
                  value={slug}
                  onChange={(ev) => handleSlugChange(ev.target.value)}
                  placeholder="aurora-wireless-headphones"
                />
              </Field>
              <Field label="Brand" error={errors.brand}>
                <Input value={brand} onChange={(ev) => setBrand(ev.target.value)} placeholder="Aurora" />
              </Field>
              <Field label="Category" error={errors.category}>
                <select value={category} onChange={(ev) => setCategory(ev.target.value)} className={selectClass}>
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Description" error={errors.description}>
              <Textarea
                value={description}
                onChange={(ev) => setDescription(ev.target.value)}
                rows={5}
                placeholder="Describe what makes this product special, who it is for, and what is included in the box."
              />
            </Field>
            <Field label="Tags" hint="Comma-separated keywords that help customers find this product.">
              <Input
                value={tags}
                onChange={(ev) => setTags(ev.target.value)}
                placeholder="wireless, bluetooth, noise cancelling, travel"
              />
            </Field>
          </Card>

          <Card className="space-y-5 p-6">
            <h2 className="text-base font-semibold text-slate-900">Pricing &amp; inventory</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Price (USD)" error={errors.price}>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(ev) => setPrice(ev.target.value)}
                  placeholder="149.99"
                />
              </Field>
              <Field label="Compare-at price (USD)" error={errors.compareAtPrice} hint="Optional original price for sale items.">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(ev) => setCompareAtPrice(ev.target.value)}
                  placeholder="199.99"
                />
              </Field>
              <Field label="Stock on hand" error={errors.stock}>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(ev) => setStock(ev.target.value)}
                  placeholder="25"
                />
              </Field>
            </div>
          </Card>

          <Card className="space-y-5 p-6">
            <h2 className="text-base font-semibold text-slate-900">Variants</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Colors" hint="Comma-separated, e.g. Midnight Black, Arctic White, Crimson Red.">
                <Input
                  value={colors}
                  onChange={(ev) => setColors(ev.target.value)}
                  placeholder="Midnight Black, Arctic White"
                />
              </Field>
              <Field label="Sizes" hint="Comma-separated, e.g. XS, S, M, L, XL. Leave empty if not applicable.">
                <Input
                  value={sizes}
                  onChange={(ev) => setSizes(ev.target.value)}
                  placeholder="S, M, L, XL"
                />
              </Field>
            </div>
          </Card>

          <Card className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Specifications</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => setSpecs((p) => [...p, { key: '', value: '' }])}>
                <Plus className="mr-1.5 h-4 w-4" /> Add row
              </Button>
            </div>
            <div className="space-y-3">
              {specs.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={row.key}
                    onChange={(ev) => updateSpec(i, 'key', ev.target.value)}
                    placeholder="Key, e.g. Battery life"
                    className="w-1/3"
                  />
                  <Input
                    value={row.value}
                    onChange={(ev) => updateSpec(i, 'value', ev.target.value)}
                    placeholder="Value, e.g. Up to 40 hours"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Remove specification row"
                    onClick={() => removeSpec(i)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <h2 className="text-base font-semibold text-slate-900">Images</h2>
            <Field label="Image URLs" error={errors.images} hint="One URL per line. The first image is the cover.">
              <Textarea
                value={imagesText}
                onChange={(ev) => setImagesText(ev.target.value)}
                rows={4}
                placeholder={'https://picsum.photos/seed/aurora-1/800/800\nhttps://picsum.photos/seed/aurora-2/800/800'}
              />
            </Field>
            {imageLines.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {imageLines.map((line) => (
                  <div key={line} className="group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={line}
                      alt="Product preview"
                      className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                      onError={(ev) => {
                        (ev.target as HTMLImageElement).src = 'https://picsum.photos/seed/novamart/200/200';
                      }}
                    />
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() => removeImageLine(line)}
                      className="absolute -right-1.5 -top-1.5 hidden rounded-full bg-rose-600 p-0.5 text-white shadow group-hover:block"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="space-y-5 p-6">
            <h2 className="text-base font-semibold text-slate-900">Visibility</h2>
            <Field label="Badge">
              <select value={badge} onChange={(ev) => setBadge(ev.target.value as BadgeValue)} className={selectClass}>
                <option value="">None</option>
                <option value="NEW">New</option>
                <option value="SALE">Sale</option>
                <option value="HOT">Hot</option>
                <option value="BESTSELLER">Bestseller</option>
              </select>
            </Field>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={featured}
                onChange={(ev) => setFeatured(ev.target.checked)}
                className="mt-1 h-4 w-4 rounded accent-indigo-600"
              />
              <span>
                <span className="block text-sm font-medium text-slate-700">Featured product</span>
                <span className="block text-xs text-slate-500">Show this product in the homepage featured section.</span>
              </span>
            </label>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-2 py-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving…' : mode === 'new' ? 'Add product' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
