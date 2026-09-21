"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Package, Search, ShoppingBag } from "lucide-react";
import { currentUser, getOrders, getProducts, logout } from "@/lib/store";
import type { Order, Product } from "@/lib/types";

interface TopbarProps {
  onMenu: () => void;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Topbar({ onMenu }: TopbarProps) {
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = currentUser();
    if (u) setAdminName(u.name);
  }, []);

  const ensureData = () => {
    if (loaded) return;
    setLoaded(true);
    try {
      setProducts(getProducts());
      setOrders(getOrders());
    } catch {
      /* demo store — search simply stays empty */
    }
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { products: [] as Product[], orders: [] as Order[] };
    return {
      products: products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q)
        )
        .slice(0, 5),
      orders: orders
        .filter(
          (o) =>
            o.number.toLowerCase().includes(q) ||
            o.name.toLowerCase().includes(q) ||
            o.email.toLowerCase().includes(q)
        )
        .slice(0, 5),
    };
  }, [query, products, orders]);

  const showResults = focused && query.trim().length >= 2;
  const hasResults = results.products.length > 0 || results.orders.length > 0;

  const handleSignOut = () => {
    logout();
    router.replace("/admin/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#2E2820] bg-[#14110D]/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-[#A39A89] hover:bg-[#2E2820] hover:text-[#F2EBDD] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global search */}
        <div ref={boxRef} className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A39A89]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              ensureData();
              setFocused(true);
            }}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setQuery("");
                setFocused(false);
              }
            }}
            placeholder="Search orders, products…"
            aria-label="Search orders and products"
            className="w-full rounded-full border border-[#2E2820] bg-[#1E1A14] py-2 pl-10 pr-4 text-sm text-[#F2EBDD] placeholder-[#A39A89]/70 outline-none transition-colors focus:border-[#E4572E]"
          />
          {showResults && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[#2E2820] bg-[#1E1A14] shadow-2xl">
              {!hasResults ? (
                <p className="px-4 py-3 text-sm text-[#A39A89]">
                  Nothing found for “{query.trim()}”.
                </p>
              ) : (
                <>
                  {results.orders.length > 0 && (
                    <div className="py-1">
                      <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-[#A39A89]">
                        Orders
                      </p>
                      {results.orders.map((o) => (
                        <Link
                          key={o.id}
                          href={`/admin/orders/${o.id}`}
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[#2E2820]"
                        >
                          <ShoppingBag className="h-4 w-4 shrink-0 text-[#E4572E]" />
                          <span className="font-medium text-[#F2EBDD]">{o.number}</span>
                          <span className="truncate text-[#A39A89]">{o.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {results.products.length > 0 && (
                    <div className="border-t border-[#2E2820] py-1">
                      <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-[#A39A89]">
                        Products
                      </p>
                      {results.products.map((p) => (
                        <Link
                          key={p.id}
                          href={`/admin/products/${p.id}`}
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[#2E2820]"
                        >
                          <Package className="h-4 w-4 shrink-0 text-[#E4572E]" />
                          <span className="truncate font-medium text-[#F2EBDD]">{p.name}</span>
                          <span className="ml-auto shrink-0 text-xs text-[#A39A89]">
                            {p.stock} in stock
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-[#F2EBDD]">{adminName}</p>
            <p className="text-xs text-[#A39A89]">Administrator</p>
          </div>
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4572E] text-sm font-bold text-white"
            aria-hidden
          >
            {initials(adminName)}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            title="Sign out"
            className="rounded-lg p-2 text-[#A39A89] hover:bg-[#2E2820] hover:text-[#E26D5A]"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
