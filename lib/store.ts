// NovaMart client-side demo store.
// All persistence is browser localStorage, keys prefixed `novamart_`.
// Seeded on first access from data/seed.json:
//   - users: admin@novamart.com / admin123 (role admin) + demo customer
//   - products: full array copy in `novamart_products_override` (admin edits mutate the copy)
//   - reviews, coupons, settings, orders, order counter
//
// This module is imported by BOTH server and client components, so every
// access is guarded with a `typeof window` check. On the server it returns
// safe fallbacks and never writes.

import type {
  Address,
  CartItem,
  Category,
  Coupon,
  Order,
  OrderStatus,
  Product,
  Review,
  StoreSettings,
  User,
} from './types';
import { currency } from './format';
import seedData from '../data/seed.json';

interface SeedData {
  products: Product[];
  categories: Category[];
  coupons: Coupon[];
  reviews: Review[];
  settings: StoreSettings;
}

const seed = seedData as unknown as SeedData;

const PREFIX = 'novamart_';
const isBrowser = (): boolean => typeof window !== 'undefined';

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full / private mode — demo continues in memory */
  }
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

const DEMO_ADDRESS: Address = {
  fullName: 'Demo Customer',
  phone: '+1 (555) 010-2030',
  street: '742 Evergreen Terrace',
  city: 'Springfield',
  postal: '90210',
  country: 'United States',
};

let seeded = false;

/** Seed all collections on first browser access. Idempotent. */
function ensureSeed(): void {
  if (!isBrowser() || seeded) return;
  seeded = true;
  try {
    if (!window.localStorage.getItem(PREFIX + 'users')) {
      const users: User[] = [
        {
          id: 'u_admin',
          name: 'NovaMart Admin',
          email: 'admin@novamart.com',
          password: 'admin123',
          role: 'admin',
          addresses: [],
          wishlist: [],
          createdAt: '2026-01-10T09:00:00.000Z',
        },
        {
          id: 'u_demo',
          name: 'Demo Customer',
          email: 'demo@novamart.com',
          password: 'demo123',
          role: 'customer',
          addresses: [DEMO_ADDRESS],
          wishlist: ['p001', 'p025', 'p041'],
          createdAt: '2026-03-02T09:00:00.000Z',
        },
      ];
      write('users', users);
    }
    if (!window.localStorage.getItem(PREFIX + 'products_override')) {
      write('products_override', seed.products);
    }
    if (!window.localStorage.getItem(PREFIX + 'reviews')) write('reviews', seed.reviews);
    if (!window.localStorage.getItem(PREFIX + 'coupons')) write('coupons', seed.coupons);
    if (!window.localStorage.getItem(PREFIX + 'settings')) write('settings', seed.settings);
    if (!window.localStorage.getItem(PREFIX + 'orders')) write('orders', []);
    if (!window.localStorage.getItem(PREFIX + 'order_counter')) write('order_counter', 1000);
  } catch {
    /* ignore seeding failures; fallbacks keep the app alive */
  }
}

/* ------------------------------------------------------------------ */
/* Catalog                                                             */
/* ------------------------------------------------------------------ */

export function getProducts(): Product[] {
  ensureSeed();
  // The server has no localStorage. Render the seed catalog during SSR so the
  // server HTML matches the first client render of a fresh browser exactly
  // (admin edits live in that browser's localStorage and apply after mount).
  if (!isBrowser()) return seed.products;
  return read<Product[]>('products_override', seed.products);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getProducts().find((p) => p.slug === slug);
}

export function getCategories(): Category[] {
  ensureSeed();
  return seed.categories;
}

export function getReviews(productId: string): Review[] {
  ensureSeed();
  const hidden = read<string[]>('reviews_hidden', []);
  return read<Review[]>('reviews', []).filter(
    (r) => r.productId === productId && !hidden.includes(r.id),
  );
}

export function searchProducts(q: string): Product[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return getProducts().filter((p) =>
    [p.name, p.brand, p.category, p.description, ...p.tags]
      .join(' ')
      .toLowerCase()
      .includes(needle),
  );
}

/* ------------------------------------------------------------------ */
/* Cart                                                                */
/* ------------------------------------------------------------------ */

export function getCart(): CartItem[] {
  ensureSeed();
  return read<CartItem[]>('cart', []);
}

export function setCart(items: CartItem[]): void {
  ensureSeed();
  write('cart', items);
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

function getUsers(): User[] {
  ensureSeed();
  return read<User[]>('users', []);
}

function saveUsers(users: User[]): void {
  write('users', users);
}

export function signup(
  name: string,
  email: string,
  password: string,
): { ok: boolean; user?: User; error?: string } {
  ensureSeed();
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanName) return { ok: false, error: 'Please enter your name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters long.' };
  }
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { ok: false, error: 'An account with this email already exists. Try logging in.' };
  }
  const user: User = {
    id: uid('u'),
    name: cleanName,
    email: cleanEmail,
    password,
    role: 'customer',
    addresses: [],
    wishlist: [],
    createdAt: nowIso(),
  };
  users.push(user);
  saveUsers(users);
  write('session', user.id);
  return { ok: true, user };
}

export function login(
  email: string,
  password: string,
): { ok: boolean; user?: User; error?: string } {
  ensureSeed();
  const cleanEmail = email.trim().toLowerCase();
  const user = getUsers().find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user || user.password !== password) {
    return { ok: false, error: 'Invalid email or password.' };
  }
  write('session', user.id);
  return { ok: true, user };
}

export function logout(): void {
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(PREFIX + 'session');
    } catch {
      /* ignore */
    }
  }
}

export function currentUser(): User | null {
  ensureSeed();
  const id = read<string | null>('session', null);
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
}

export function updateUser(id: string, patch: Partial<User>): void {
  ensureSeed();
  const users = getUsers().map((u) =>
    u.id === id ? { ...u, ...patch, id: u.id, email: u.email } : u,
  );
  saveUsers(users);
}

/* ------------------------------------------------------------------ */
/* Wishlist                                                            */
/* ------------------------------------------------------------------ */

export function getWishlist(): string[] {
  ensureSeed();
  const user = currentUser();
  if (user) return user.wishlist ?? [];
  return read<string[]>('wishlist_guest', []);
}

export function toggleWishlist(productId: string): string[] {
  ensureSeed();
  const user = currentUser();
  if (user) {
    const next = new Set(user.wishlist ?? []);
    if (next.has(productId)) next.delete(productId);
    else next.add(productId);
    const list = Array.from(next);
    updateUser(user.id, { wishlist: list });
    return list;
  }
  const guest = new Set(read<string[]>('wishlist_guest', []));
  if (guest.has(productId)) guest.delete(productId);
  else guest.add(productId);
  const list = Array.from(guest);
  write('wishlist_guest', list);
  return list;
}

/* ------------------------------------------------------------------ */
/* Coupons                                                             */
/* ------------------------------------------------------------------ */

export function getCoupons(): Coupon[] {
  ensureSeed();
  return read<Coupon[]>('coupons', []);
}

export function validateCoupon(
  code: string,
  subtotal: number,
): { ok: boolean; coupon?: Coupon; discount?: number; freeShip?: boolean; error?: string } {
  ensureSeed();
  const coupon = getCoupons().find(
    (c) => c.code.toLowerCase() === code.trim().toLowerCase(),
  );
  if (!coupon) return { ok: false, error: 'That coupon code was not recognized.' };
  if (!coupon.active) return { ok: false, error: 'This coupon is no longer active.' };
  if (new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { ok: false, error: 'This coupon has expired.' };
  }
  if (coupon.used >= coupon.usageLimit) {
    return { ok: false, error: 'This coupon has reached its usage limit.' };
  }
  if (subtotal < coupon.minOrder) {
    return {
      ok: false,
      error: `This coupon needs a minimum order of ${currency(coupon.minOrder)}.`,
    };
  }
  let discount = 0;
  let freeShip = false;
  if (coupon.type === 'percent') {
    discount = Math.round(subtotal * (coupon.value / 100) * 100) / 100;
  } else if (coupon.type === 'flat') {
    discount = Math.min(coupon.value, subtotal);
  } else if (coupon.type === 'freeship') {
    freeShip = true;
  }
  return { ok: true, coupon, discount, freeShip };
}

export function saveCoupon(c: Coupon): void {
  ensureSeed();
  const coupons = getCoupons();
  const idx = coupons.findIndex((x) => x.code.toLowerCase() === c.code.toLowerCase());
  if (idx >= 0) coupons[idx] = c;
  else coupons.push(c);
  write('coupons', coupons);
}

export function deleteCoupon(code: string): void {
  ensureSeed();
  write(
    'coupons',
    getCoupons().filter((c) => c.code.toLowerCase() !== code.toLowerCase()),
  );
}

export function markCouponUsed(code: string): void {
  ensureSeed();
  const coupons = getCoupons().map((c) =>
    c.code.toLowerCase() === code.toLowerCase() ? { ...c, used: c.used + 1 } : c,
  );
  write('coupons', coupons);
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export function createOrder(
  input: Omit<Order, 'id' | 'number' | 'timeline' | 'createdAt' | 'status'> & {
    status?: OrderStatus;
  },
): Order {
  ensureSeed();
  const counter = read<number>('order_counter', 1000) + 1;
  write('order_counter', counter);
  const status: OrderStatus = input.status ?? 'pending';
  const at = nowIso();
  const order: Order = {
    ...input,
    id: uid('ord'),
    number: `NM-${String(counter).padStart(6, '0')}`,
    status,
    timeline: [{ status, at, note: 'Order placed' }],
    createdAt: at,
  };
  const orders = getOrders();
  orders.unshift(order);
  write('orders', orders);
  if (input.couponCode) markCouponUsed(input.couponCode);
  return order;
}

export function getOrders(): Order[] {
  ensureSeed();
  return read<Order[]>('orders', []);
}

export function getOrdersByEmail(email: string): Order[] {
  const needle = email.trim().toLowerCase();
  return getOrders().filter((o) => o.email.toLowerCase() === needle);
}

export function getOrderById(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

export function getOrderByNumber(number: string): Order | undefined {
  const needle = number.trim().toUpperCase();
  return getOrders().find((o) => o.number.toUpperCase() === needle);
}

export function updateOrder(id: string, patch: Partial<Order>): void {
  ensureSeed();
  const orders = getOrders().map((o) => {
    if (o.id !== id) return o;
    const next: Order = { ...o, ...patch, id: o.id };
    if (patch.status && patch.status !== o.status) {
      next.timeline = [...o.timeline, { status: patch.status, at: nowIso() }];
    }
    return next;
  });
  write('orders', orders);
}

/* ------------------------------------------------------------------ */
/* Admin catalog                                                       */
/* ------------------------------------------------------------------ */

export function saveProduct(p: Product): void {
  ensureSeed();
  const products = getProducts();
  const idx = products.findIndex((x) => x.id === p.id);
  if (idx >= 0) products[idx] = p;
  else products.unshift(p);
  write('products_override', products);
}

export function deleteProduct(id: string): void {
  ensureSeed();
  write(
    'products_override',
    getProducts().filter((p) => p.id !== id),
  );
}

export function adjustStock(id: string, delta: number): void {
  ensureSeed();
  const products = getProducts().map((p) =>
    p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p,
  );
  write('products_override', products);
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export function getSettings(): StoreSettings {
  ensureSeed();
  return read<StoreSettings>('settings', seed.settings);
}

export function saveSettings(s: StoreSettings): void {
  ensureSeed();
  write('settings', s);
}
