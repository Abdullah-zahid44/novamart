'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, PackageSearch } from 'lucide-react';
import { getOrders } from '@/lib/store';
import { currency, formatDate, orderStatusMeta } from '@/lib/format';
import type { Order, OrderStatus } from '@/lib/types';
import { ensureDemoOrders } from './seed';
import {
  EmptyBox,
  Mono,
  PageHeader,
  Panel,
  SearchInput,
  StatusPill,
  inputCls,
  rowCls,
  tdCls,
  thCls,
  theadCls,
} from '../_ui';

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
    setOrders(
      getOrders()
        .slice()
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    );
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

  const counts = useMemo(() => {
    const m = new Map<OrderStatus, number>();
    for (const o of orders) m.set(o.status, (m.get(o.status) ?? 0) + 1);
    return m;
  }, [orders]);

  const revenue = useMemo(() => filtered.reduce((s, o) => s + o.total, 0), [filtered]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        sub={`${filtered.length} of ${orders.length} orders${
          filtered.length > 0 ? ` · ${currency(revenue)} total value` : ''
        }`}
      />

      <Panel className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by order number, name or email…"
            ariaLabel="Search orders"
            className="flex-1"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | OrderStatus)}
            className={`${inputCls} sm:w-60`}
            aria-label="Filter by status"
          >
            <option value="all">All statuses ({orders.length})</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {orderStatusMeta[s].label} ({counts.get(s) ?? 0})
              </option>
            ))}
          </select>
        </div>
      </Panel>

      {filtered.length === 0 ? (
        <EmptyBox
          icon={PackageSearch}
          title={orders.length === 0 ? 'No orders yet' : 'No orders match these filters'}
          hint={
            orders.length === 0
              ? 'Orders placed through the storefront checkout will land here.'
              : 'Try a different search term or clear the status filter.'
          }
        />
      ) : (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className={theadCls}>
                  <th scope="col" className={thCls}>Order</th>
                  <th scope="col" className={thCls}>Date</th>
                  <th scope="col" className={thCls}>Customer</th>
                  <th scope="col" className={thCls}>Items</th>
                  <th scope="col" className={thCls}>Payment</th>
                  <th scope="col" className={`${thCls} text-right`}>Total</th>
                  <th scope="col" className={thCls}>Status</th>
                  <th scope="col" className={thCls}>
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className={rowCls}>
                    <td className={tdCls}>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-semibold text-[#E4572E] hover:underline"
                      >
                        #{o.number}
                      </Link>
                    </td>
                    <td className={`${tdCls} whitespace-nowrap text-[#A39A89]`}>
                      {formatDate(o.createdAt)}
                    </td>
                    <td className={tdCls}>
                      <p className="font-medium text-[#F2EBDD]">{o.name}</p>
                      <p className="text-xs text-[#A39A89]">{o.email}</p>
                    </td>
                    <td className={`${tdCls} tabular-nums text-[#A39A89]`}>{itemCount(o)}</td>
                    <td className={`${tdCls} whitespace-nowrap text-[#A39A89]`}>
                      {o.paymentMethod}
                      {o.paymentLast4 ? (
                        <span className="text-[#A39A89]/70"> ···· {o.paymentLast4}</span>
                      ) : null}
                    </td>
                    <td className={`${tdCls} whitespace-nowrap text-right font-semibold tabular-nums text-[#F2EBDD]`}>
                      {currency(o.total)}
                    </td>
                    <td className={tdCls}>
                      <StatusPill status={o.status} />
                    </td>
                    <td className={tdCls}>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        aria-label={`Open order ${o.number}`}
                        className="inline-flex items-center gap-1 rounded-full border border-[#2E2820] px-3 py-1.5 text-xs font-semibold text-[#A39A89] transition hover:border-[#E4572E] hover:text-[#E4572E]"
                      >
                        Open <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-[#2E2820] px-4 py-3 text-xs text-[#A39A89]">
            <Mono>Demo data</Mono> — seeded orders are marked internally and never overwrite real
            checkout orders.
          </p>
        </Panel>
      )}
    </div>
  );
}
