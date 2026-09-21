'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Crown, DollarSign, ShoppingBag, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getOrders } from '@/lib/store';
import { currency, formatDate } from '@/lib/format';
import type { Order } from '@/lib/types';
import { ensureDemoOrders } from '../orders/seed';
import {
  EmptyBox,
  PageHeader,
  Panel,
  SearchInput,
  StatusPill,
  rowCls,
  tdCls,
  thCls,
  theadCls,
} from '../_ui';

interface CustomerRow {
  email: string;
  name: string;
  firstSeen: string;
  orders: Order[];
  orderCount: number;
  totalSpent: number;
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Panel className="flex items-center gap-3.5 p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E4572E]/10 text-[#E4572E]">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A39A89]">
          {label}
        </span>
        <span className="block text-xl font-bold tabular-nums text-[#F2EBDD]">{value}</span>
      </span>
    </Panel>
  );
}

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState('');
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  useEffect(() => {
    ensureDemoOrders();
    try {
      setOrders(getOrders());
    } catch {
      setOrders([]);
    }
  }, []);

  const rows: CustomerRow[] = useMemo(() => {
    const byEmail = new Map<string, Order[]>();
    for (const o of orders) {
      const key = o.email.trim().toLowerCase();
      if (!key) continue;
      const list = byEmail.get(key) ?? [];
      list.push(o);
      byEmail.set(key, list);
    }
    return Array.from(byEmail.entries())
      .map(([email, list]) => {
        const sorted = list.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const totalSpent = sorted
          .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
          .reduce((s, o) => s + o.total, 0);
        return {
          email,
          name: sorted[0].name,
          firstSeen: sorted[sorted.length - 1].createdAt,
          orders: sorted,
          orderCount: sorted.length,
          totalSpent,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.email.includes(q));
  }, [rows, query]);

  const totals = useMemo(() => {
    const valid = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded');
    return {
      customers: rows.length,
      orderCount: orders.length,
      revenue: valid.reduce((s, o) => s + o.total, 0),
    };
  }, [rows, orders]);

  const topSpender = rows[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        sub="Everyone who has ordered, ranked by lifetime spend. Built from order history — no account required to buy."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat icon={Users} label="Customers" value={String(totals.customers)} />
        <Stat icon={ShoppingBag} label="Total orders" value={String(totals.orderCount)} />
        <Stat icon={DollarSign} label="Customer revenue" value={currency(totals.revenue)} />
      </div>

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search by name or email…"
        ariaLabel="Search customers"
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <EmptyBox
          icon={Users}
          title="No customers found"
          hint={
            query
              ? 'Try a different search.'
              : 'Nobody has ordered yet — customers appear here after their first checkout.'
          }
        />
      ) : (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className={theadCls}>
                  <th scope="col" className={thCls}>Customer</th>
                  <th scope="col" className={`${thCls} text-right`}>Orders</th>
                  <th scope="col" className={`${thCls} text-right`}>Lifetime spend</th>
                  <th scope="col" className={thCls}>First order</th>
                  <th scope="col" className={thCls}>
                    <span className="sr-only">Expand</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const expanded = expandedEmail === row.email;
                  const isTop = topSpender && row.email === topSpender.email;
                  return (
                    <Fragment key={row.email}>
                      <tr
                        onClick={() => setExpandedEmail(expanded ? null : row.email)}
                        className={`${rowCls} cursor-pointer`}
                      >
                        <td className={tdCls}>
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#2E2820] bg-[#14110D] text-sm font-bold text-[#E4572E]">
                              {row.name.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <p className="flex items-center gap-1.5 font-semibold text-[#F2EBDD]">
                                {row.name}
                                {isTop && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-[#C99A2C]/30 bg-[#C99A2C]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#C99A2C]">
                                    <Crown className="h-3 w-3" /> Top
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-[#A39A89]">{row.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className={`${tdCls} text-right tabular-nums text-[#F2EBDD]`}>
                          {row.orderCount}
                        </td>
                        <td className={`${tdCls} text-right font-semibold tabular-nums text-[#F2EBDD]`}>
                          {currency(row.totalSpent)}
                        </td>
                        <td className={`${tdCls} whitespace-nowrap text-[#A39A89]`}>
                          {formatDate(row.firstSeen)}
                        </td>
                        <td className={tdCls}>
                          <ChevronDown
                            className={`h-4 w-4 text-[#A39A89] transition-transform ${expanded ? 'rotate-180' : ''}`}
                          />
                        </td>
                      </tr>
                      {expanded && (
                        <tr className="border-b border-[#2E2820]/60 bg-[#14110D]/60 last:border-0">
                          <td colSpan={5} className="px-4 py-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#A39A89]">
                              Order history — {row.name}
                            </p>
                            <div className="overflow-x-auto rounded-lg border border-[#2E2820]">
                              <table className="w-full min-w-[560px] bg-[#1E1A14] text-left text-sm">
                                <thead>
                                  <tr className={theadCls}>
                                    <th scope="col" className={thCls}>Order</th>
                                    <th scope="col" className={thCls}>Date</th>
                                    <th scope="col" className={thCls}>Status</th>
                                    <th scope="col" className={`${thCls} text-right`}>Items</th>
                                    <th scope="col" className={`${thCls} text-right`}>Total</th>
                                    <th scope="col" className={thCls}>
                                      <span className="sr-only">View</span>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {row.orders.map((o) => (
                                    <tr key={o.id} className={rowCls}>
                                      <td className={`${tdCls} font-mono text-xs text-[#A39A89]`}>
                                        #{o.number}
                                      </td>
                                      <td className={`${tdCls} whitespace-nowrap text-[#A39A89]`}>
                                        {formatDate(o.createdAt)}
                                      </td>
                                      <td className={tdCls}>
                                        <StatusPill status={o.status} />
                                      </td>
                                      <td className={`${tdCls} text-right tabular-nums text-[#A39A89]`}>
                                        {o.items.reduce((s, i) => s + i.qty, 0)}
                                      </td>
                                      <td className={`${tdCls} text-right font-semibold tabular-nums text-[#F2EBDD]`}>
                                        {currency(o.total)}
                                      </td>
                                      <td className={`${tdCls} text-right`}>
                                        <Link
                                          href={`/admin/orders/${o.id}`}
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-xs font-semibold text-[#E4572E] hover:underline"
                                        >
                                          View order
                                        </Link>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
