"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, DollarSign, Receipt, ShoppingBag } from "lucide-react";
import { getOrders, getProducts } from "@/lib/store";
import { currency, formatDate } from "@/lib/format";
import type { Order, Product } from "@/lib/types";
import StatCard from "@/components/admin/StatCard";
import RevenueChart from "@/components/admin/RevenueChart";
import StatusPill from "@/components/admin/StatusPill";
import { fraunces } from "@/components/admin/fonts";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW = 14;

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const isLiveOrder = (o: Order) => o.status !== "cancelled" && o.status !== "refunded";

function pctDelta(current: number, previous: number): { text: string; tone: "up" | "down" | "flat" } {
  if (previous <= 0) {
    if (current <= 0) return { text: "No prior-period data", tone: "flat" };
    return { text: "New this period", tone: "up" };
  }
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.05) return { text: "Flat vs prior 14 days", tone: "flat" };
  return {
    text: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs prior 14 days`,
    tone: pct >= 0 ? "up" : "down",
  };
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setOrders(getOrders());
    setProducts(getProducts());
  }, []);

  const live = useMemo(() => orders.filter(isLiveOrder), [orders]);

  /** Per-day series for the current and previous 14-day windows. */
  const series = useMemo(() => {
    const today = startOfDay(new Date());
    const mk = (offset: number) => {
      const days: { label: string; key: string; revenue: number; count: number }[] = [];
      for (let i = WINDOW - 1; i >= 0; i--) {
        const d = new Date(today.getTime() - (i + offset) * DAY_MS);
        days.push({
          label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          key: dayKey(d),
          revenue: 0,
          count: 0,
        });
      }
      const byKey = new Map(days.map((d) => [d.key, d]));
      for (const o of live) {
        const day = byKey.get(dayKey(new Date(o.createdAt)));
        if (day) {
          day.revenue += o.total;
          day.count += 1;
        }
      }
      return days;
    };
    return { current: mk(0), previous: mk(WINDOW) };
  }, [live]);

  const stats = useMemo(() => {
    const revenue = series.current.reduce((s, d) => s + d.revenue, 0);
    const prevRevenue = series.previous.reduce((s, d) => s + d.revenue, 0);
    const orderCount = series.current.reduce((s, d) => s + d.count, 0);
    const prevOrderCount = series.previous.reduce((s, d) => s + d.count, 0);
    const avg = orderCount > 0 ? revenue / orderCount : 0;
    const prevAvg = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;

    return {
      revenue,
      revenueDelta: pctDelta(revenue, prevRevenue),
      revenueSpark: series.current.map((d) => d.revenue),
      orderCount,
      orderDelta: pctDelta(orderCount, prevOrderCount),
      orderSpark: series.current.map((d) => d.count),
      avg,
      avgDelta: pctDelta(avg, prevAvg),
      avgSpark: series.current.map((d) => (d.count > 0 ? d.revenue / d.count : 0)),
    };
  }, [series]);

  const lowStock = useMemo(
    () =>
      [...products]
        .filter((p) => p.stock <= 5)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 8),
    [products]
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6),
    [orders]
  );

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={`${fraunces.className} text-3xl font-semibold text-[#F2EBDD] sm:text-4xl`}>
            Mission control.
          </h1>
          <p className="mt-1.5 text-sm text-[#A39A89]">
            The live pulse of the store — {todayLabel}. Last {WINDOW} days.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#2E2820] px-4 py-2 text-sm font-medium text-[#F2EBDD] transition-colors hover:border-[#E4572E] hover:text-[#E4572E]"
        >
          View store <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Revenue"
          value={currency(stats.revenue)}
          delta={stats.revenueDelta.text}
          deltaTone={stats.revenueDelta.tone}
          icon={DollarSign}
          tone="orange"
          spark={stats.revenueSpark}
        />
        <StatCard
          title="Orders"
          value={String(stats.orderCount)}
          delta={stats.orderDelta.text}
          deltaTone={stats.orderDelta.tone}
          icon={ShoppingBag}
          tone="green"
          spark={stats.orderSpark}
        />
        <StatCard
          title="Avg. order value"
          value={currency(stats.avg)}
          delta={stats.avgDelta.text}
          deltaTone={stats.avgDelta.tone}
          icon={Receipt}
          tone="amber"
          spark={stats.avgSpark}
        />
        <StatCard
          title="Low stock"
          value={String(lowStock.length)}
          delta={lowStock.length === 0 ? "Everything is stocked up" : "Products at 5 units or fewer"}
          deltaTone={lowStock.length === 0 ? "up" : "flat"}
          icon={AlertTriangle}
          tone="red"
        />
      </div>

      {/* Revenue chart */}
      <section className="rounded-[14px] border border-[#2E2820] bg-[#1E1A14] p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className={`${fraunces.className} text-xl font-semibold text-[#F2EBDD]`}>
              Revenue
            </h2>
            <p className="mt-0.5 text-xs text-[#A39A89]">Last {WINDOW} days, live orders only</p>
          </div>
          <p className="text-sm text-[#A39A89]">
            Total{" "}
            <span className="text-lg font-semibold text-[#F2EBDD]">
              {currency(stats.revenue)}
            </span>
          </p>
        </div>
        <div className="mt-4">
          <RevenueChart
            days={series.current.map((d) => ({ label: d.label, total: d.revenue }))}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Recent orders */}
        <section className="rounded-[14px] border border-[#2E2820] bg-[#1E1A14] p-5 sm:p-6 xl:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className={`${fraunces.className} text-xl font-semibold text-[#F2EBDD]`}>
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-[#E4572E] hover:underline"
            >
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-[#2E2820] px-4 py-8 text-center text-sm text-[#A39A89]">
              No orders yet. The moment someone checks out, it lands here.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-[#2E2820] text-left text-[11px] uppercase tracking-wider text-[#A39A89]">
                    <th scope="col" className="py-2.5 pr-4 font-semibold">Order</th>
                    <th scope="col" className="py-2.5 pr-4 font-semibold">Customer</th>
                    <th scope="col" className="py-2.5 pr-4 text-center font-semibold">Items</th>
                    <th scope="col" className="py-2.5 pr-4 font-semibold">Status</th>
                    <th scope="col" className="py-2.5 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-[#2E2820]/50 transition-colors last:border-0 hover:bg-[#26211A]"
                    >
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-semibold text-[#E4572E] hover:underline"
                        >
                          {o.number}
                        </Link>
                        <p className="mt-0.5 text-xs text-[#A39A89]">{formatDate(o.createdAt)}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-[#F2EBDD]">{o.name}</p>
                        <p className="mt-0.5 max-w-[180px] truncate text-xs text-[#A39A89]">
                          {o.email}
                        </p>
                      </td>
                      <td className="py-3 pr-4 text-center text-[#A39A89]">
                        {o.items.reduce((s, i) => s + i.qty, 0)}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusPill status={o.status} />
                      </td>
                      <td className="py-3 text-right font-semibold text-[#F2EBDD]">
                        {currency(o.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Low stock */}
        <section className="rounded-[14px] border border-[#2E2820] bg-[#1E1A14] p-5 sm:p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className={`${fraunces.className} text-xl font-semibold text-[#F2EBDD]`}>
              Running low
            </h2>
            <Link
              href="/admin/products"
              className="text-sm font-medium text-[#E4572E] hover:underline"
            >
              Restock
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-[#2E2820] px-4 py-8 text-center text-sm text-[#A39A89]">
              Shelves are full. Nothing needs restocking.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#2E2820]/60">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="block truncate text-sm font-medium text-[#F2EBDD] hover:text-[#E4572E]"
                    >
                      {p.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-[#A39A89]">
                      {p.brand} · {currency(p.price)}
                    </p>
                  </div>
                  <span
                    className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={
                      p.stock === 0
                        ? { color: "#E26D5A", backgroundColor: "rgba(226,109,90,0.12)" }
                        : { color: "#E0A458", backgroundColor: "rgba(224,164,88,0.12)" }
                    }
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
