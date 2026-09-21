'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, DollarSign, Search, ShoppingBag, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getOrders } from '@/lib/store';
import { currency, formatDate, orderStatusMeta } from '@/lib/format';
import type { Order, User } from '@/lib/types';

interface CustomerRow {
  user: User;
  orders: Order[];
  totalSpent: number;
}

function isUserArray(v: unknown): v is User[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every(
      (u): u is User =>
        typeof u === 'object' &&
        u !== null &&
        typeof (u as { email?: unknown }).email === 'string' &&
        typeof (u as { name?: unknown }).name === 'string'
    )
  );
}

/**
 * lib/store seeds users into localStorage under a novamart_-prefixed key.
 * The contract does not name the exact key, so scan for the array of user
 * records (preferring the conventional `novamart_users` key).
 */
function loadUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('novamart_'));
    const ordered = [...keys].sort((a, b) =>
      a === 'novamart_users' ? -1 : b === 'novamart_users' ? 1 : 0
    );
    for (const key of ordered) {
      try {
        const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
        if (isUserArray(parsed)) return parsed;
      } catch {
        /* try the next key */
      }
    }
  } catch {
    /* storage unavailable */
  }
  return [];
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
        <span className="block text-lg font-bold text-gray-900">{value}</span>
      </span>
    </div>
  );
}

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setUsers(loadUsers());
    try {
      setOrders(getOrders());
    } catch {
      setOrders([]);
    }
  }, []);

  const rows: CustomerRow[] = useMemo(() => {
    const byEmail = new Map<string, Order[]>();
    for (const o of orders) {
      const key = o.email.toLowerCase();
      const list = byEmail.get(key) ?? [];
      list.push(o);
      byEmail.set(key, list);
    }
    return users
      .map((user) => {
        const userOrders = (byEmail.get(user.email.toLowerCase()) ?? [])
          .slice()
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const totalSpent = userOrders
          .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
          .reduce((sum, o) => sum + o.total, 0);
        return { user, orders: userOrders, totalSpent };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [users, orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.user.name.toLowerCase().includes(q) || r.user.email.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const totals = useMemo(() => {
    const valid = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded');
    return {
      customers: rows.filter((r) => r.user.role === 'customer').length,
      orderCount: orders.length,
      revenue: valid.reduce((s, o) => s + o.total, 0),
    };
  }, [rows, orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Every registered shopper, their order history, and lifetime spend.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat icon={Users} label="Customers" value={String(totals.customers)} />
        <Stat icon={ShoppingBag} label="Total orders" value={String(totals.orderCount)} />
        <Stat icon={DollarSign} label="Customer revenue" value={currency(totals.revenue)} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 font-medium text-gray-900">No customers found</p>
            <p className="mt-1 text-sm text-gray-500">
              {query ? 'Try a different search.' : 'No registered users yet — new signups will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Orders</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Total spent</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Joined</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((row) => {
                  const expanded = expandedId === row.user.id;
                  return (
                    <Fragment key={row.user.id}>
                      <tr
                        onClick={() => setExpandedId(expanded ? null : row.user.id)}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{row.user.name}</p>
                          <p className="text-xs text-gray-500">{row.user.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              row.user.role === 'admin'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {row.user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-900">
                          {row.orders.length}
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900">
                          {currency(row.totalSpent)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                          {formatDate(row.user.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                          />
                        </td>
                      </tr>
                      {expanded && (
                        <tr className="bg-gray-50/60">
                          <td colSpan={6} className="px-4 py-4">
                            {row.orders.length === 0 ? (
                              <p className="text-sm text-gray-500">
                                {row.user.name} hasn&apos;t placed any orders yet.
                              </p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-3 py-2 text-left font-medium text-gray-500">Order</th>
                                      <th className="px-3 py-2 text-left font-medium text-gray-500">Date</th>
                                      <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
                                      <th className="px-3 py-2 text-right font-medium text-gray-500">Items</th>
                                      <th className="px-3 py-2 text-right font-medium text-gray-500">Total</th>
                                      <th className="px-3 py-2" />
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {row.orders.map((o) => {
                                      const meta = orderStatusMeta[o.status];
                                      return (
                                        <tr key={o.id}>
                                          <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-900">
                                            {o.number}
                                          </td>
                                          <td className="whitespace-nowrap px-3 py-2 text-gray-500">
                                            {formatDate(o.createdAt)}
                                          </td>
                                          <td className="px-3 py-2">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                                              {meta.label}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2 text-right tabular-nums text-gray-600">
                                            {o.items.reduce((s, i) => s + i.qty, 0)}
                                          </td>
                                          <td className="px-3 py-2 text-right font-medium tabular-nums text-gray-900">
                                            {currency(o.total)}
                                          </td>
                                          <td className="px-3 py-2 text-right">
                                            <Link
                                              href={`/admin/orders/${o.id}`}
                                              onClick={(e) => e.stopPropagation()}
                                              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                            >
                                              View
                                            </Link>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
