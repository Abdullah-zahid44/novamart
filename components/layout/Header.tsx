'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useCart } from '@/components/cart/CartShell';
import { getCategories, getWishlist } from '@/lib/store';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/cn';

const MARQUEE_ITEMS = 'FREE SHIPPING OVER $75  ✦  NEW DROPS EVERY FRIDAY  ✦  EASY 30-DAY RETURNS  ✦  ';

function CountBadge({ count, label }: { count: number; label: string }) {
  if (count <= 0) return null;
  return (
    <span
      aria-label={label}
      className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold leading-none text-white"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Header() {
  const router = useRouter();
  const { count: cartCount, setOpen } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [wishCount, setWishCount] = useState(0);
  const [dropOpen, setDropOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setCategories(getCategories());
    const syncWishlist = () => setWishCount(getWishlist().length);
    syncWishlist();
    window.addEventListener('storage', syncWishlist);
    // Wishlist changes in this tab don't fire storage events; refresh on focus.
    window.addEventListener('focus', syncWishlist);
    return () => {
      window.removeEventListener('storage', syncWishlist);
      window.removeEventListener('focus', syncWishlist);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropOpen(false);
        setSearchOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Mobile drawer: trap Tab inside while open, focus it on open, and return
  // focus to the menu button on close.
  useEffect(() => {
    if (!drawerOpen) return;
    const drawer = drawerRef.current;
    const SELECTOR =
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = (): HTMLElement[] =>
      drawer
        ? Array.from(drawer.querySelectorAll<HTMLElement>(SELECTOR)).filter(
            (el) => el.getClientRects().length > 0,
          )
        : [];
    const raf = requestAnimationFrame(() => {
      (focusables()[0] ?? drawer)?.focus({ preventScroll: true });
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !drawer) return;
      const els = focusables();
      if (els.length === 0) {
        e.preventDefault();
        return;
      }
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !drawer.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      menuBtnRef.current?.focus({ preventScroll: true });
    };
  }, [drawerOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    setDrawerOpen(false);
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  };

  const iconBtn =
    'relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

  return (
    <>
      {/* Announcement marquee — ink bg, paper text, pure CSS (DESIGN_BRIEF §5.1) */}
      <div className="overflow-hidden bg-ink py-2 text-paper" aria-hidden>
        <div className="animate-marquee flex w-max whitespace-nowrap">
          {[0, 1].map((half) => (
            <span key={half} className="text-[11px] font-semibold tracking-[0.2em]">
              {MARQUEE_ITEMS.repeat(4)}
            </span>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
          <button
            ref={menuBtnRef}
            type="button"
            className={cn(iconBtn, 'lg:hidden')}
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={20} />
          </button>

          <Link href="/" className="font-display text-[1.65rem] font-bold tracking-tight text-ink">
            NovaMart
            <span className="ml-1 inline-block h-2 w-2 rounded-full bg-accent align-baseline" aria-hidden />
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Primary">
            <Link
              href="/shop"
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-sand"
            >
              Shop
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setDropOpen(true)}
              onMouseLeave={() => setDropOpen(false)}
            >
              <button
                type="button"
                aria-expanded={dropOpen}
                aria-haspopup="true"
                onClick={() => setDropOpen((v) => !v)}
                className={cn(
                  'flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-sand',
                  dropOpen ? 'bg-sand text-ink' : 'text-ink',
                )}
              >
                Categories
                <ChevronDown size={15} aria-hidden className={cn('transition-transform', dropOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute left-0 top-full w-64 pt-2"
                  >
                    <div className="overflow-hidden rounded-[14px] border border-line bg-card py-2 shadow-lg shadow-ink/5">
                      {categories.map((c) => (
                        <Link
                          key={c.id}
                          href={`/shop/${c.slug}`}
                          onClick={() => setDropOpen(false)}
                          className="flex items-center justify-between px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-sand"
                        >
                          {c.name}
                          <span className="text-muted" aria-hidden>→</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link
              href="/deals"
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-sand"
            >
              Deals
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            </Link>
            <Link
              href="/about"
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-sand"
            >
              Our Story
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <form onSubmit={submitSearch} className="flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.input
                    ref={searchRef}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 180, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search the store…"
                    aria-label="Search products"
                    className="h-10 overflow-hidden rounded-full border border-line bg-card px-4 text-sm text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none"
                  />
                )}
              </AnimatePresence>
              <button
                type={searchOpen ? 'submit' : 'button'}
                aria-label="Search"
                onClick={() => !searchOpen && setSearchOpen(true)}
                className={iconBtn}
              >
                <Search size={19} />
              </button>
            </form>
            <Link href="/account" aria-label="Your account" className={iconBtn}>
              <User size={19} />
            </Link>
            <Link href="/account/wishlist" aria-label="Wishlist" className={iconBtn}>
              <Heart size={19} />
              <CountBadge count={wishCount} label={`${wishCount} items in wishlist`} />
            </Link>
            <button
              type="button"
              aria-label={`Open cart, ${cartCount} items`}
              onClick={() => setOpen(true)}
              className={iconBtn}
            >
              <ShoppingBag size={19} />
              <CountBadge count={cartCount} label={`${cartCount} items in cart`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — backdrop and panel are direct, keyed AnimatePresence
          children so the exit animation runs and the dialog truly unmounts. */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {drawerOpen && (
          <motion.aside
            key="drawer-panel"
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
            className="fixed right-0 top-0 z-[61] flex h-full w-80 max-w-[85vw] flex-col bg-paper px-6 py-5"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            tabIndex={-1}
          >
              <div className="flex items-center justify-between">
                <span className="font-display text-xl font-bold text-ink">
                  NovaMart
                  <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setDrawerOpen(false)}
                  className={iconBtn}
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile">
                {[
                  { href: '/shop', label: 'Shop everything' },
                  { href: '/deals', label: 'Deals' },
                  { href: '/about', label: 'Our Story' },
                  { href: '/track', label: 'Track an order' },
                  { href: '/account', label: 'Your account' },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-xl px-3 py-3 font-display text-2xl font-semibold text-ink transition-colors hover:bg-sand"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <p className="mb-2 mt-8 text-xs font-bold uppercase tracking-[0.2em] text-muted">
                Categories
              </p>
              <div className="flex flex-col gap-1 overflow-y-auto">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/shop/${c.slug}`}
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-sand"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
              <form onSubmit={submitSearch} className="mt-auto pt-6">
                <div className="flex items-center gap-2 rounded-full border border-line bg-card p-1.5 pl-4">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search the store…"
                    aria-label="Search products"
                    className="h-9 w-full bg-transparent text-sm text-ink placeholder:text-muted/70 focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-paper"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </form>
            </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
