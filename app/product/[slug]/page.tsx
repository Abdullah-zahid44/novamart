'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Check, ChevronRight, ShoppingCart, Zap } from 'lucide-react';
import { getCategories, getProductBySlug, getProducts } from '@/lib/store';
import { ImageGallery } from '@/components/shop/ImageGallery';
import { ReviewsList } from '@/components/shop/ReviewsList';
import { ProductCard } from '@/components/shop/ProductCard';
import { Stars } from '@/components/ui/Stars';
import { Price } from '@/components/ui/Price';
import { QtySelector } from '@/components/ui/QtySelector';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/components/cart/CartShell';

const isHex = (value: string) => /^#([0-9a-f]{3}){1,2}$/i.test(value);

type Tab = 'description' | 'specs' | 'reviews';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { addItem, setOpen } = useCart();

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>('description');

  const product = useMemo(() => getProductBySlug(slug), [slug]);

  const category = useMemo(() => {
    if (!product) return undefined;
    return getCategories().find((c) => c.slug === product.category);
  }, [product]);

  const related = useMemo(() => {
    if (!product) return [];
    return getProducts()
      .filter((p) => p.category === product.category && p.slug !== product.slug)
      .slice(0, 4);
  }, [product]);

  if (!product) notFound();

  const hasColors = product.colors.length > 0;
  const hasSizes = (product.sizes ?? []).length > 0;
  const soldOut = product.stock === 0;
  const lowStock = !soldOut && product.stock <= 5;
  const optionsComplete =
    (!hasColors || selectedColor !== '') && (!hasSizes || selectedSize !== '');
  const canBuy = !soldOut && optionsComplete;

  const discountPct =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  const cartPayload = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.images[0] ?? '',
    color: selectedColor || undefined,
    size: selectedSize || undefined,
  };

  const handleAdd = () => {
    if (!canBuy) return;
    addItem({ ...cartPayload, qty });
    setOpen(true);
  };

  const handleBuyNow = () => {
    if (!canBuy) return;
    addItem({ ...cartPayload, qty });
    router.push('/checkout');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'description', label: 'Description' },
    { id: 'specs', label: 'Specifications' },
    { id: 'reviews', label: `Reviews (${product.reviewsCount})` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-gray-500">
        <Link href="/" className="hover:text-indigo-600">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-indigo-600">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        {category && (
          <>
            <Link href={`/shop/${category.slug}`} className="hover:text-indigo-600">
              {category.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ImageGallery images={product.images} name={product.name} badge={product.badge} />

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Stars value={product.rating} size="md" />
            <span className="text-sm text-gray-600">
              {product.rating.toFixed(1)} · {product.reviewsCount} reviews
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Price value={product.price} compareAt={product.compareAtPrice} size="lg" />
            {discountPct > 0 && (
              <span className="rounded-md bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700">
                Save {discountPct}%
              </span>
            )}
          </div>

          <div className="mt-3 text-sm">
            {soldOut ? (
              <span className="font-semibold text-rose-600">Out of stock</span>
            ) : lowStock ? (
              <span className="font-semibold text-amber-600">Only {product.stock} left in stock — order soon</span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                <Check className="h-4 w-4" /> In stock
              </span>
            )}
          </div>

          {hasColors && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-gray-900">
                Color{selectedColor && <span className="ml-1 font-normal text-gray-500">: {selectedColor}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    aria-label={`Select color ${color}`}
                    aria-pressed={selectedColor === color}
                    className={`flex h-9 items-center justify-center rounded-lg border-2 px-3 text-xs font-medium transition-colors ${
                      selectedColor === color
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {isHex(color) ? (
                      <span
                        className="h-5 w-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ) : (
                      color
                    )}
                  </button>
                ))}
              </div>
              {hasColors && !selectedColor && (
                <p className="mt-1.5 text-xs text-rose-600">Please choose a color.</p>
              )}
            </div>
          )}

          {hasSizes && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-gray-900">Size</p>
              <div className="flex flex-wrap gap-2">
                {(product.sizes ?? []).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize === size}
                    className={`min-w-[3rem] rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && <p className="mt-1.5 text-xs text-rose-600">Please choose a size.</p>}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">Quantity</span>
            <QtySelector value={qty} onChange={setQty} max={Math.max(1, Math.min(product.stock, 10))} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" size="lg" onClick={handleAdd} disabled={!canBuy} className="flex-1">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button variant="secondary" size="lg" onClick={handleBuyNow} disabled={!canBuy} className="flex-1">
              <Zap className="mr-2 h-5 w-5" />
              Buy Now
            </Button>
          </div>

          {product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <div className="flex gap-1 border-b border-gray-200" role="tablist" aria-label="Product information">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === 'description' && (
            <div className="max-w-3xl">
              <p className="leading-7 text-gray-700">{product.description}</p>
            </div>
          )}

          {tab === 'specs' && (
            <div className="max-w-3xl overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([key, value], i) => (
                    <tr key={key} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <th className="w-1/3 px-4 py-3 text-left font-semibold text-gray-900">{key}</th>
                      <td className="px-4 py-3 text-gray-700">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'reviews' && (
            <ReviewsList
              productId={product.id}
              rating={product.rating}
              reviewsCount={product.reviewsCount}
            />
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900">You may also like</h2>
          <p className="mt-1 text-sm text-gray-600">More from {category?.name ?? 'this category'}</p>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
