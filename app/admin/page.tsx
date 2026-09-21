"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DollarSign, ShoppingBag, Users, Receipt, AlertTriangle } from "lucide-react";
import { getOrders, getProducts } from "@/lib/store";
import { currency, formatDate, orderStatusMeta } from "@/lib/format";
import type { Order, OrderStatus, Product } from "@/lib/types";
import StatCard from "@/components/admin/StatCard";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const isLiveOrder = (o: Order) => o.status !== "cancelled" && o.status !== "refunded";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setOrders(getOrders());
    setProducts(getProducts());
  }, []);

  const stats = useMemo(() => {
    const live = orders.filter(isLiveOrder);
    const revenue = live.reduce((sum, o) => sum + o.total, 0);
    const customers = new Set(orders.map((o) => o.email.toLowerCase())).size;
    const avg = live.length > 0 ? revenue / live.length : 0;

    const now = Date.now();
    const last7 = live.filter((o) => now - new Date(o.createdAt).getTime() < 7 * DAY_MS);
    const prev7 = live.filter((o) => {
      const age = now - new Date(o.createdAt).getTime();
      return age >= 7 * DAY_MS && age < 14 * DAY_MS;
    });
    const r7 = last7.reduce((s, o) => s + o.total, 0);
    const rPrev = prev7.reduce((s, o) => s + o.total, 0);
    const deltaPct = rPrev > 0 ? ((r7 - rPrev) / rPrev) * 100 : r7 > 0 ? 100 : 0;
    const delta = `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(1)}% vs prior 7 days`;

    return { revenue, orderCount: orders.length, customers, avg, delta };
  }, [orders]);

  const chart = useMemo(() => {
    const today = startOfDay(new Date());
    const days: { label: string; total: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today.getTime() - i * DAY_MS);
      const key = dayKey(d);
      const total = orders
        .filter(isLiveOrder)
        .filter((o) => dayKey(new Date(o.createdAt)) === key)
        .reduce((s, o) => s + o.total, 0);
      days.push({
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        total,
      });
    }
    const max = Math.max(...days.map((d) => d.total), 1);
    return { days, max };
  }, [orders]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [orders]
  );

  const lowStock = useMemo(
    () =>
      [...products]
        .filter((p) => p.stock < 10)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 8),
    [products]
  );

  const statusCounts = useMemo(() => {
    const counts = {} as Record<OrderStatus, number>;
    (Object.keys(orderStatusMeta) as OrderStatus[]).forEach((s) => (counts[s] = 0));
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    return counts;
  }, [orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Store performance at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total revenue" value={currency(stats.revenue)} delta={stats.delta} icon={DollarSign} tone="emerald" />
        <StatCard title="Orders" value={String(stats.orderCount)} delta="All time" icon={ShoppingBag} tone="indigo" />
        <StatCard title="Customers" value={String(stats.customers)} delta="Unique order emails" icon={Users} tone="amber" />
        <StatCard title="Avg. order value" value={currency(stats.avg)} delta="Per completed order" icon={Receipt} tone="rose" />
      </div>

      {/* Status counts */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Orders by status</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(orderStatusMeta) as OrderStatus[]).map((status) => (
            <Link
              key={status}
              href={`/admin/orders?status=${status}`}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
            >
              <span className={`h-2 w-2 rounded-full ${orderStatusMeta[status].dot}`} />
              <span className="font-medium">{orderStatusMeta[status].label}</span>
              <span className="text-gray-500">{statusCounts[status]}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Revenue chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Revenue — last 14 days</h2>
          <span className="text-xs text-gray-500">Max {currency(chart.max)}</span>
        </div>
        <div className="mt-4 flex h-48 items-end gap-1.5 sm:gap-2">
          {chart.days.map((d) => (
            <div key={d.label} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                title={`${d.label}: ${currency(d.total)}`}
                className="w-full rounded-t-md bg-indigo-500 transition-colors group-hover:bg-indigo-600"
                style={{ height: `${Math.max((d.total / chart.max) * 100, 1.5)}%` }}
              />
              <p className="mt-1 hidden truncate text-center text-[10px] text-gray-400 sm:block">
                {d.label}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-gray-400 sm:hidden">
          <span>{chart.days[0].label}</span>
          <span>{chart.days[chart.days.length - 1].label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="py-2 pr-3 font-medium">Order</th>
                    <th className="py-2 pr-3 font-medium">Customer</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 pr-3">
                        <Link href={`/admin/orders/${o.id}`} className="font-medium text-indigo-600 hover:underline">
                          {o.number}
                        </Link>
                        <p className="text-xs text-gray-400">{formatDate(o.createdAt)}</p>
                      </td>
                      <td className="py-2.5 pr-3 text-gray-700">{o.name}</td>
                      <td className="py-2.5 pr-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                          <span className={`h-1.5 w-1.5 rounded-full ${orderStatusMeta[o.status].dot}`} />
                          {orderStatusMeta[o.status].label}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-medium text-gray-900">{currency(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Low stock</h2>
            <Link href="/admin/products" className="text-sm font-medium text-indigo-600 hover:underline">
              Manage products
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">All products are well stocked.</p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-50">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link href={`/admin/products/${p.id}`} className="truncate text-sm font-medium text-gray-900 hover:text-indigo-600">
                      {p.name}
                    </Link>
                    <p className="text-xs text-gray-400">{p.brand} · {currency(p.price)}</p>
                  </div>
                  <span
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      p.stock === 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
