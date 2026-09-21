"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { currentUser, getOrdersByEmail } from "@/lib/store";
import type { Order } from "@/lib/types";
import { currency, formatDate, orderStatusMeta } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

function byNewest(a: Order, b: Order) {
  return +new Date(b.createdAt) - +new Date(a.createdAt);
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const meta = orderStatusMeta[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = currentUser();
    if (!u) return;
    setOrders(getOrdersByEmail(u.email).slice().sort(byNewest));
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Order history
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Every order you&apos;ve placed at NovaMart, newest first.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          hint="When you place an order it will appear here with live status updates."
          action={
            <Link href="/shop">
              <Button variant="primary">Browse the shop</Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Items</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">
                    <span className="sr-only">Details</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => {
                  const itemCount = o.items.reduce((s, i) => s + i.qty, 0);
                  return (
                    <tr key={o.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-5 py-4 font-semibold text-gray-900">{o.number}</td>
                      <td className="px-5 py-4 text-gray-600">{formatDate(o.createdAt)}</td>
                      <td className="px-5 py-4 text-gray-600">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {currency(o.total)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/account/orders/${o.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          View <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {orders.map((o) => {
              const itemCount = o.items.reduce((s, i) => s + i.qty, 0);
              return (
                <Link key={o.id} href={`/account/orders/${o.id}`}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Order {o.number}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {formatDate(o.createdAt)} · {itemCount}{" "}
                          {itemCount === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-sm font-bold text-gray-900">{currency(o.total)}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
                        View details <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
