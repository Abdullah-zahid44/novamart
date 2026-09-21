'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PackageSearch, Search } from 'lucide-react';
import { getOrders } from '@/lib/store';
import { currency, formatDate, orderStatusMeta } from '@/lib/format';
import { Badge, Card, EmptyState, Input, Select } from '@/components/ui';
import type { Order, OrderStatus } from '@/lib/types';
import { ensureDemoOrders } from './seed';

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'];

function itemCount(order: Order): number {
  return order.items.reduce((n, i) => n + i.qty, 0);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<'all' | OrderStatus>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    ensureDemoOrders();
    const all = getOrders()
      .slice()
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    setOrders(all);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== 'all' && o.status !== status) return false;
      if (!q) return true;
      return (
        o.number.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      );
    });
  }, [orders, status, query]);

  const revenue = useMemo(() => filtered.reduce((s, o) => s + o.total, 0), [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} of {orders.length} orders
            {filtered.length > 0 && ` · ${currency(revenue)} total value`}
          </p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by order number, name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              aria-label="Search orders"
            />
          </div>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | OrderStatus)}
            options={[
              { value: 'all', label: 'All statuses' },
              ...ALL_STATUSES.map((s) => ({ value: s, label: orderStatusMeta[s].label })),
            ]}
            className="sm:w-52"
            aria-label="Filter by status"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
          hint={
            orders.length === 0
              ? 'Orders placed through the storefront checkout will appear here.'
              : 'Try a different search term or clear the status filter.'
          }
          action={undefined}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-3 font-semibold">Order</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Items</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Payment</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((o) => {
                  const meta = orderStatusMeta[o.status];
                  return (
                    <tr key={o.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          #{o.number}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{o.name}</div>
                        <div className="text-xs text-slate-500">{o.email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{itemCount(o)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {o.paymentMethod}
                        {o.paymentLast4 ? ` ···· ${o.paymentLast4}` : ''}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900">
                        {currency(o.total)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge>
                          <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${meta.dot}`} aria-hidden="true" />
                          {meta.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
