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
  { href: "/account/wishlist", label: "Wishlist", hint: "Items you're saving", icon: Heart },
  { href: "/account/addresses", label: "Addresses", hint: "Delivery destinations", icon: MapPin },
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here&apos;s a snapshot of your NovaMart activity.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs font-medium text-gray-500">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent orders</h2>
          {orders.length > 0 && (
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            hint="Your orders will show up here once you place your first one."
            action={
              <Link href="/shop">
                <Button variant="primary">Start shopping</Button>
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
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Order {o.number}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(o.createdAt)} · {itemCount}{" "}
                            {itemCount === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-900">{currency(o.total)}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
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
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick links</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {QUICK_LINKS.map((q) => (
            <Link key={q.href} href={q.href}>
              <Card className="group flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                  <q.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{q.label}</p>
                  <p className="text-xs text-gray-500">{q.hint}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
