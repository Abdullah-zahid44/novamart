"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { currentUser, getOrderById } from "@/lib/store";
import type { Order, User } from "@/lib/types";
import { currency, formatDate, orderStatusMeta } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function TotalsRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between text-sm ${
        strong ? "font-bold text-gray-900" : "text-gray-600"
      }`}
    >
      <span>{label}</span>
      <span className={strong ? "text-base" : ""}>{value}</span>
    </div>
  );
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | undefined | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = currentUser();
    setUser(u);
    const o = getOrderById(params.id);
    // Privacy: only the owner of the order (or an admin) may view it.
    if (o && u && (o.email === u.email || u.role === "admin")) {
      setOrder(o);
    } else {
      setOrder(null);
    }
    setReady(true);
  }, [params.id]);

  if (!ready) return null;

  if (!order) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Order not found"
        hint="We couldn't find an order with that ID on your account. Check the link or head back to your order history."
        action={
          <Link href="/account/orders">
            <Button variant="primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to orders
            </Button>
          </Link>
        }
      />
    );
  }

  const meta = orderStatusMeta[order.status];
  const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
  const timeline = order.timeline.slice().reverse();

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Order {order.number}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Placed {formatDate(order.createdAt)} · {itemCount}{" "}
            {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700">
          <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-gray-900">Items</h2>
            <ul className="mt-4 divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <li key={`${item.productId}-${idx}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {[item.color, item.size].filter(Boolean).join(" · ") || "Standard"} · Qty{" "}
                      {item.qty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {currency(item.price * item.qty)}
                    </p>
                    <p className="text-xs text-gray-500">{currency(item.price)} each</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* Status timeline */}
          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-gray-900">Order timeline</h2>
            <ol className="mt-4 space-y-0">
              {timeline.map((t, idx) => {
                const m = orderStatusMeta[t.status];
                const last = idx === timeline.length - 1;
                return (
                  <li key={`${t.status}-${t.at}`} className="relative flex gap-4 pb-6 last:pb-0">
                    {!last && (
                      <span
                        aria-hidden="true"
                        className="absolute left-[7px] top-5 h-full w-px bg-gray-200"
                      />
                    )}
                    <span className={`mt-1 h-4 w-4 shrink-0 rounded-full ${m.dot}`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(t.at)} · {formatTime(t.at)}
                      </p>
                      {t.note && <p className="mt-1 text-sm text-gray-600">{t.note}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Delivery address */}
          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-gray-900">Delivery address</h2>
            <address className="mt-3 text-sm not-italic leading-relaxed text-gray-600">
              <p className="font-semibold text-gray-900">{order.address.fullName}</p>
              <p>{order.address.street}</p>
              <p>
                {order.address.city}, {order.address.postal}
              </p>
              <p>{order.address.country}</p>
              <p className="mt-1">Phone: {order.address.phone}</p>
            </address>
          </Card>

          {/* Payment */}
          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-gray-900">Payment</h2>
            <p className="mt-3 text-sm text-gray-600">
              {order.paymentMethod}
              {order.paymentLast4 ? ` ending in ${order.paymentLast4}` : ""}
            </p>
            {order.couponCode && (
              <p className="mt-2 text-sm text-gray-600">
                Coupon applied:{" "}
                <span className="font-mono font-semibold text-emerald-700">
                  {order.couponCode}
                </span>
              </p>
            )}
          </Card>

          {/* Totals */}
          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-gray-900">Order summary</h2>
            <div className="mt-4 space-y-2.5">
              <TotalsRow label="Subtotal" value={currency(order.subtotal)} />
              {order.discount > 0 && (
                <TotalsRow label="Discount" value={`−${currency(order.discount)}`} />
              )}
              <TotalsRow
                label="Shipping"
                value={order.shipping === 0 ? "Free" : currency(order.shipping)}
              />
              <TotalsRow label="Tax" value={currency(order.tax)} />
              <div className="border-t border-gray-200 pt-2.5">
                <TotalsRow label="Total" value={currency(order.total)} strong />
              </div>
            </div>
          </Card>

          {user && (
            <p className="text-xs text-gray-500">
              Need help with this order? Contact our support team with order number{" "}
              <span className="font-semibold">{order.number}</span>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
