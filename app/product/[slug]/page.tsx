'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronRight,
  Heart,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Undo2,
  Zap,
} from 'lucide-react';
import {
  getCategories,
  getProductBySlug,
  getProducts,
  getWishlist,
  toggleWishlist,
} from '@/lib/store';
import { ImageGallery } from '@/components/shop/ImageGallery';
import { ReviewsList } from '@/components/shop/ReviewsList';
import { ProductCard } from '@/components/shop/ProductCard';
import { Stars } from '@/components/ui/Stars';
import { Price } from '@/components/ui/Price';
import { QtySelector } from '@/components/ui/QtySelector';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/components/cart/CartShell';
import { notFound, useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

const isHex = (value: string) => /^#([0-9a-f]{3}){1,2}$/i.test(value);

/* ---------- Accordion ---------- */

function Accordion({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-[15px] font-semibold text-ink">{title}</span>
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink transition-transform duration-300',
            open && 'rotate-45 border-ink',
          )}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-[15px] leading-7 text-ink/75">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Page ---------- */

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { addItem, setOpen } = useCart();

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  // Product data lives in localStorage (see lib/store.ts), which is empty during
  // SSR/prerender. Gate the lookup behind mount so the server renders a loading
  // skeleton (HTTP 200) instead of a false 404; genuinely missing slugs still
  // hit notFound() after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const product = useMemo(() => (mounted ? getProductBySlug(slug) : undefined), [slug, mounted]);

  const category = useMemo(() => {
    if (!product) return undefined;
    return getCategories().find((c) => c.slug === product.category);
  }, [product]);

  const pairsWellWith = useMemo(() => {
    if (!product) return [];
    return getProducts()
      .filter((p) => p.category === product.category && p.slug !== product.slug)
      .slice(0, 8);
  }, [product]);

  useEffect(() => {
    if (product) setWishlisted(getWishlist().includes(product.id));
  }, [product]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-10" aria-label="Loading product">
        <div className="h-4 w-64 rounded bg-line" />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="aspect-square rounded-[14px] bg-line" />
          <div className="space-y-4">
            <div className="h-9 w-3/4 rounded bg-line" />
            <div className="h-5 w-1/3 rounded bg-line" />
            <div className="h-10 w-1/2 rounded bg-line" />
            <div className="h-12 w-full rounded-full bg-line" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) notFound();

  const hasColors = product.colors.length > 0;
  const hasSizes = (product.sizes ?? []).length > 0;
  const soldOut = product.stock === 0;
  const lowStock = !soldOut && product.stock <= 5;
  const optionsComplete =
    (!hasColors || selectedColor !== '') && (!hasSizes || selectedSize !== '');
  const canBuy = !soldOut && optionsComplete;

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

  const handleWishlist = () => {
    if (!product) return;
    const next = toggleWishlist(product.id);
    setWishlisted(next.includes(product.id));
  };

  const optionBtn = (selected: boolean) =>
    cn(
      'flex min-h-[2.5rem] items-center justify-center rounded-full border px-4 text-sm font-medium transition-all active:scale-[0.98]',
      selected
        ? 'border-accent bg-accent/10 font-semibold text-accent-deep'
        : 'border-line bg-card text-ink hover:border-muted',
    );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:pt-10">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-accent">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href="/shop" className="transition-colors hover:text-accent">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        {category && (
          <>
            <Link href={`/shop/${category.slug}`} className="transition-colors hover:text-accent">
              {category.name}
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
          </>
        )}
        <span className="max-w-[16rem] truncate text-ink sm:max-w-none">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <ImageGallery images={product.images} name={product.name} badge={product.badge} />
        </motion.div>

        {/* Sticky info column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 }}
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
            {product.brand}
          </p>
          <h1 className="mt-2 font-display text-[clamp(1.9rem,3.5vw,2.75rem)] font-medium leading-[1.08] text-ink">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2">
            <Stars value={product.rating} size="md" />
            <a href="#reviews" className="text-sm text-muted underline-offset-4 hover:text-accent hover:underline">
              {product.rating.toFixed(1)} · {product.reviewsCount} reviews
            </a>
          </div>

          <div className="mt-4">
            <Price value={product.price} compareAt={product.compareAtPrice} size="lg" />
          </div>

          <div className="mt-3 text-sm">
            {soldOut ? (
              <span className="font-semibold text-muted">Out of stock — back soon</span>
            ) : lowStock ? (
              <span className="font-semibold text-accent-deep">
                Only {product.stock} left — they go fast
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-semibold text-forest">
                <Check className="h-4 w-4" aria-hidden /> In stock, ships within 24 hours
              </span>
            )}
          </div>

          {hasColors && (
            <div className="mt-6">
              <p className="mb-2.5 text-sm font-semibold text-ink">
                Colour
                {selectedColor && <span className="ml-1.5 font-normal text-muted">{selectedColor}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    aria-label={`Select colour ${color}`}
                    aria-pressed={selectedColor === color}
                    className={optionBtn(selectedColor === color)}
                  >
                    {isHex(color) ? (
                      <span
                        className="h-5 w-5 rounded-full border border-line"
                        style={{ backgroundColor: color }}
                        aria-hidden
                      />
                    ) : (
                      color
                    )}
                  </button>
                ))}
              </div>
              {!selectedColor && (
                <p className="mt-1.5 text-xs text-accent-deep">Pick a colour first.</p>
              )}
            </div>
          )}

          {hasSizes && (
            <div className="mt-5">
              <p className="mb-2.5 text-sm font-semibold text-ink">Size</p>
              <div className="flex flex-wrap gap-2">
                {(product.sizes ?? []).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize === size}
                    className={cn(optionBtn(selectedSize === size), 'min-w-[3rem]')}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="mt-1.5 text-xs text-accent-deep">Pick a size first.</p>
              )}
            </div>
          )}

          <div className="mt-7 flex items-center gap-4">
            <QtySelector value={qty} onChange={setQty} max={Math.max(1, Math.min(product.stock, 10))} />
            <span className="text-sm text-muted">Quantity</span>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleAdd}
              disabled={!canBuy}
              className="w-full"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden />
              {soldOut ? 'Out of stock' : 'Add to cart'}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleBuyNow}
              disabled={!canBuy}
              className="w-full"
            >
              <Zap className="h-5 w-5" aria-hidden />
              Buy now
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleWishlist}
              aria-pressed={wishlisted}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="w-full"
            >
              <Heart
                className={cn('h-5 w-5', wishlisted && 'fill-current')}
                aria-hidden
              />
              {wishlisted ? 'Saved to wishlist' : 'Add to wishlist'}
            </Button>
          </div>

          {/* Trust rows */}
          <div className="mt-6 divide-y divide-line rounded-[14px] border border-line bg-card">
            {[
              { icon: Truck, text: 'Free shipping on orders over $75' },
              { icon: Undo2, text: '30-day returns, no questions asked' },
              { icon: ShieldCheck, text: 'Covered by the NovaMart promise' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 px-5 py-3.5">
                <Icon className="h-5 w-5 shrink-0 text-accent" aria-hidden />
                <p className="text-sm text-ink/80">{text}</p>
              </div>
            ))}
          </div>

          {product.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-sand px-3 py-1 text-xs text-muted">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Accordions */}
      <div className="mt-14 max-w-3xl border-t border-line">
        <Accordion title="Details" defaultOpen>
          <p>{product.description}</p>
          {Object.keys(product.specs).length > 0 && (
            <dl className="mt-5 overflow-hidden rounded-[14px] border border-line">
              {Object.entries(product.specs).map(([key, value], i) => (
                <div
                  key={key}
                  className={cn('grid grid-cols-[10rem_1fr] gap-4 px-4 py-3 text-sm', i % 2 === 0 && 'bg-sand/50')}
                >
                  <dt className="font-semibold text-ink">{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </Accordion>
        <Accordion title="Shipping & returns">
          <p>
            Orders placed before 2pm leave our warehouse the same day. Standard
            delivery takes 2–5 business days, and shipping is free over $75.
          </p>
          <p className="mt-3">
            Not right for you? Send it back within 30 days for a full refund —
            no interrogation, no restocking fees.
          </p>
        </Accordion>
        <Accordion title="Care">
          <p>
            Keep it dry, keep it out of harsh sun, and wipe it down with a soft
            cloth now and then. Treat it decently and it will outlast your urge
            to replace it.
          </p>
        </Accordion>
      </div>

      {/* Reviews */}
      <div id="reviews" className="mt-14 scroll-mt-24">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
            Reviews
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.25rem)] font-medium text-ink">
            What owners say.
          </h2>
        </div>
        <ReviewsList
          productId={product.id}
          rating={product.rating}
          reviewsCount={product.reviewsCount}
        />
      </div>

      {/* Pairs well with */}
      {pairsWellWith.length > 0 && (
        <div className="mt-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                {category?.name ?? 'More to browse'}
              </p>
              <h2 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.25rem)] font-medium text-ink">
                Pairs well with
              </h2>
            </div>
            {category && (
              <Link
                href={`/shop/${category.slug}`}
                className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-accent underline-offset-4 hover:text-accent-deep hover:underline sm:inline-flex"
              >
                View all <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
            {pairsWellWith.map((p) => (
              <div key={p.id} className="w-52 shrink-0 snap-start sm:w-60">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
