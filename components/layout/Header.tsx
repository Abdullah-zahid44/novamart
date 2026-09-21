'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, Menu, Search, ShoppingCart, User, X, Zap } from 'lucide-react';
import { useCart } from '@/components/cart/CartShell';
import { getSettings } from '@/lib/store';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/deals', label: 'Deals' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { count, setOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    try {
      setAnnouncement(getSettings().announcement);
    } catch {
      /* store unavailable during prerender */
    }
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
    setMenuOpen(false);
  };

  return (
    <>
      {announcement && (
        <div className="bg-[#1E1B4B] px-4 py-2 text-center text-xs font-medium tracking-wide text-white">
          {announcement}
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link href="/" className="flex items-center gap-2" aria-label="NovaMart home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Zap size={18} className="text-white" aria-hidden />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Nova<span className="text-indigo-600">Mart</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="ml-2 hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={submitSearch} role="search" className="ml-auto hidden min-w-0 flex-1 max-w-md md:block">
            <div className="relative">
              <Search
                size={16}
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, categories…"
                aria-label="Search products"
                className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-0.5 md:ml-0">
            <Link
              href="/shop"
              aria-label="Search"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Search size={20} />
            </Link>
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <Heart size={20} />
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <User size={20} />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`Open cart, ${count} items`}
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[11px] font-bold text-white">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 lg:hidden">
            <form onSubmit={submitSearch} role="search" className="mb-3 md:hidden">
              <div className="relative">
                <Search
                  size={16}
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                  aria-label="Search products"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </form>
            <nav aria-label="Mobile" className="flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-3 py-2.5 text-sm font-medium',
                    pathname === item.href
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-700 hover:bg-slate-100',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
