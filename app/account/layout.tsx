"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { currentUser, logout } from "@/lib/store";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package, exact: false },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart, exact: false },
  { href: "/account/addresses", label: "Addresses", icon: MapPin, exact: false },
  { href: "/account/settings", label: "Settings", icon: Settings, exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = currentUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="sr-only">Loading your account…</span>
      </div>
    );
  }

  function handleSignOut() {
    logout();
    router.push("/");
  }

  const initial = (user?.name ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="md:w-64 md:shrink-0">
          {/* User card */}
          <div className="mb-4 flex items-center gap-3 rounded-[14px] border border-line bg-card p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest font-display text-lg font-semibold text-paper">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
          </div>

          {/* Mobile nav: horizontal scroll pills */}
          <nav aria-label="Account" className="flex gap-2 overflow-x-auto pb-1 md:hidden">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-accent bg-accent text-white"
                      : "border-line bg-card text-ink hover:border-ink/30"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop nav */}
          <nav aria-label="Account" className="hidden md:block">
            <div className="rounded-[14px] border border-line bg-card p-2">
              {NAV.map((item) => {
                const active = isActive(pathname, item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-sand text-ink"
                        : "text-muted hover:bg-sand/60 hover:text-ink"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${active ? "text-accent" : ""}`} />
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-2 border-t border-line pt-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-[#E26D5A]/10 hover:text-[#A33B2A]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {children}

          {/* Mobile sign out */}
          <div className="mt-8 md:hidden">
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
