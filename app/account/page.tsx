"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  MapPin,
  Package,
  Settings,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";
import { currentUser, getOrdersByEmail, getWishlist } from "@/lib/store";
import type { Order, User } from "@/lib/types";
import { currency, formatDate, orderStatusMeta } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

function byNewest(a: Order, b: Order) {
  return +new Date(b.createdAt) - +new Date(a.createdAt);
}

const QUICK_LINKS = [
  { href: "/account/orders", label: "Track orders", hint: "See where your parcels are", icon: Truck },
  { href: "/account/wishlist", label: "Wishlist", hint: "Things you're keeping an eye on", icon: Heart },
  { href: "/account/addresses", label: "Addresses", hint: "Where orders get delivered", icon: MapPin },
  { href: "/account/settings", label: "Settings", hint: "Name and password", icon: Settings },
];

export default function AccountDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const u = currentUser();
    if (!u) return;
    setUser(u);
    setOrders(getOrdersByEmail(u.email).slice().sort(byNewest));
    setWishlistCount(getWishlist().length);
  }, []);

  if (!user) return null;

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const recent = orders.slice(0, 3);

  const stats = [
    { label: "Orders placed", value: String(orders.length), icon: ShoppingBag },
    { label: "Wishlist items", value: String(wishlistCount), icon: Heart },
    { label: "Total spent", value: currency(totalSpent), icon: Wallet },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Good to see you, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted">
          A quick look at your NovaMart activity.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand text-accent">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="tnum text-xl font-semibold text-ink">{s.value}</p>
                <p className="text-xs font-medium text-muted">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Recent orders</h2>
          {orders.length > 0 && (
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-deep hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            hint="Your history starts with the first box."
            action={
              <Link href="/shop">
                <Button variant="primary">Browse the shop</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {recent.map((o) => {
              const meta = orderStatusMeta[o.status];
              const itemCount = o.items.reduce((s, i) => s + i.qty, 0);
              return (
                <Link key={o.id} href={`/account/orders/${o.id}`}>
                  <Card className="p-4 transition-shadow hover:shadow-md sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand text-muted">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink">Order {o.number}</p>
                          <p className="text-xs text-muted">
                            {formatDate(o.createdAt)} · {itemCount}{" "}
                            {itemCount === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="tnum text-sm font-semibold text-ink">{currency(o.total)}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1 text-xs font-medium text-ink">
                          <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">Quick links</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {QUICK_LINKS.map((q) => (
            <Link key={q.href} href={q.href}>
              <Card className="group flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  <q.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">{q.label}</p>
                  <p className="text-xs text-muted">{q.hint}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-line transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
