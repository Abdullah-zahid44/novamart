# NovaMart — Build Contract (ALL 10 AGENTS READ THIS FIRST)

General-purpose multi-category ecommerce demo store. Brand: **NovaMart**, tagline "Everything you love, delivered."
Repo: `~/workspace/ecommerce-site/` — Next.js 14 (App Router) + React 18 + TypeScript (strict) + Tailwind CSS 3.4 + lucide-react.
Currency: USD. UI language: English.

## Stack rules
- No `src/` dir. `app/` at repo root. Server components by default; `"use client"` only where interactivity needs it.
- Tailwind only for styling. No other CSS frameworks, no new npm deps without writing it in NOTES.md.
- Images: `next/image` with `images.remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }]` in next.config.js (Agent 1 sets this). Product/category images are `https://picsum.photos/seed/<seed>/800/800` style URLs.
- Persistence is DEMO-grade: static seed in `data/seed.json` + browser localStorage for all mutations (cart, users, orders, admin edits, coupons, settings). No real database, no real payments (checkout is a demo flow).
- TypeScript strict. No `any` without a comment justifying it.
- Mobile-first responsive. Semantic HTML.

## Design tokens (Agent 1 implements in tailwind.config + globals.css)
- Primary: indigo-600 (#4F46E5), hover indigo-700. Dark accent: #1E1B4B for footer/hero gradients.
- Deal/sale accent: amber-400 (#FBBF24). Success: emerald-600. Danger: rose-600.
- Font: Inter via next/font/google. Radius: rounded-xl cards, rounded-lg buttons/inputs.
- Never ship generic rainbow AI-looking UI: restrained palette, hierarchy via size/weight/whitespace first.

## lib/types.ts (Agent 1 — EXACT shapes, everyone imports from here)
```ts
export interface Product { id: string; slug: string; name: string; brand: string; category: string; /* category slug */ price: number; compareAtPrice?: number; rating: number; reviewsCount: number; images: string[]; colors: string[]; sizes?: string[]; stock: number; tags: string[]; badge?: 'NEW' | 'SALE' | 'HOT' | 'BESTSELLER'; description: string; specs: Record<string, string>; featured?: boolean; createdAt: string; }
export interface Category { id: string; name: string; slug: string; image: string; description: string; }
export interface CartItem { productId: string; slug: string; name: string; price: number; image: string; color?: string; size?: string; qty: number; }
export interface Address { fullName: string; phone: string; street: string; city: string; postal: string; country: string; }
export interface User { id: string; name: string; email: string; password: string; role: 'customer' | 'admin'; addresses: Address[]; wishlist: string[]; createdAt: string; }
export type CouponType = 'percent' | 'flat' | 'freeship';
export interface Coupon { code: string; type: CouponType; value: number; minOrder: number; expiresAt: string; usageLimit: number; used: number; active: boolean; }
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export interface OrderItem { productId: string; name: string; price: number; qty: number; image: string; color?: string; size?: string; }
export interface Order { id: string; number: string; email: string; name: string; items: OrderItem[]; subtotal: number; discount: number; shipping: number; tax: number; total: number; couponCode?: string; status: OrderStatus; paymentMethod: string; paymentLast4?: string; address: Address; timeline: { status: OrderStatus; at: string; note?: string }[]; createdAt: string; }
export interface Review { id: string; productId: string; userName: string; rating: number; title: string; body: string; createdAt: string; }
export interface StoreSettings { storeName: string; tagline: string; announcement: string; shippingFlat: number; freeShipOver: number; taxRate: number; supportEmail: string; }
```

## lib/store.ts (Agent 1 — EXACT function names, client-side localStorage)
Keys prefixed `novamart_`. On first call, seed: users ← one admin `admin@novamart.com / admin123` (role admin) + one demo customer; products ← data/seed.json (admin edits saved to `novamart_products_override` as full array).
- Catalog: `getProducts(): Product[]`, `getProductBySlug(slug): Product | undefined`, `getCategories(): Category[]`, `getReviews(productId): Review[]`, `searchProducts(q): Product[]`
- Cart: `getCart(): CartItem[]`, `setCart(items): void`
- Auth: `signup(name, email, password): { ok: boolean; user?: User; error?: string }`, `login(email, password): { ok: boolean; user?: User; error?: string }`, `logout(): void`, `currentUser(): User | null`, `updateUser(id, patch: Partial<User>): void`
- Wishlist: `getWishlist(): string[]`, `toggleWishlist(productId: string): string[]`
- Coupons: `getCoupons(): Coupon[]`, `validateCoupon(code, subtotal): { ok: boolean; coupon?: Coupon; discount?: number; freeShip?: boolean; error?: string }`, `saveCoupon(c: Coupon): void`, `deleteCoupon(code: string): void`, `markCouponUsed(code): void`
- Orders: `createOrder(input: Omit<Order,'id'|'number'|'timeline'|'createdAt'|'status'> & {status?: OrderStatus}): Order`, `getOrders(): Order[]`, `getOrdersByEmail(email): Order[]`, `getOrderById(id): Order | undefined`, `getOrderByNumber(number): Order | undefined`, `updateOrder(id, patch: Partial<Order>): void`
- Admin catalog: `saveProduct(p: Product): void`, `deleteProduct(id: string): void`, `adjustStock(id: string, delta: number): void`
- Settings: `getSettings(): StoreSettings`, `saveSettings(s: StoreSettings): void`

## lib/format.ts (Agent 1)
- `currency(n: number): string` → `$1,234.50`
- `formatDate(iso: string): string` → e.g. `Sep 21, 2026`
- `orderStatusMeta: Record<OrderStatus, { label: string; dot: string }>` (dot = tailwind bg class)

## Shared components (Agent 1 — components/ui/)
Button (variants: primary | secondary | outline | danger | ghost; sizes sm | md | lg), Input, Textarea, Select, Badge, Card, Modal, Stars ({value, size}), QtySelector ({value, onChange, max}), EmptyState ({icon: LucideIcon, title, hint, action}), SectionHeading ({kicker?, title, sub?, link?}), Price ({value, compareAt?, size?}).

## Cart shell (Agent 3 — components/cart/CartShell.tsx)
Exports `CartShell({children})` = CartProvider + CartDrawer rendered together, and `useCart()` returning `{ items, addItem(item: Omit<CartItem,'qty'>, qty?: number), removeItem(productId, color?, size?), updateQty(productId, color?, size?, qty), clear, count, subtotal, isOpen, setOpen }`. **Agent 1's app/layout.tsx MUST wrap `{children}` in `<CartShell>`** (import from this path even though Agent 3 writes it).

## Cross-agent shared components (fixed props — owners in brackets)
- `components/shop/ProductCard.tsx` [Agent 2]: props `{ product: Product }`. Card with image, badge, name, brand, stars, price, add-to-cart button (uses useCart).
- `components/layout/Header.tsx`, `components/layout/Footer.tsx` [Agent 1].
- `components/admin/Sidebar.tsx`, `components/admin/StatCard.tsx`, `components/admin/AdminGate.tsx` [Agent 5]: AdminGate = client component, redirects non-admins to `/admin/login`.

## File ownership (STRICT — touch ONLY your files; Agent 10 may edit anything to fix the build)
- A1 scaffold: package.json (next ^14.2, react ^18.3, typescript, tailwindcss ^3.4, postcss, autoprefixer, lucide-react), next.config.js, tsconfig.json, tailwind.config.ts, postcss.config.js, .gitignore, app/layout.tsx, app/globals.css, lib/*, data/seed.json (48 products / 6 categories: electronics, home-kitchen, fashion, beauty, sports, toys-and-games / 4 coupons: WELCOME10 percent-10 min $50, SAVE20 flat-20 min $150, FREESHIP freeship min $75, STUDENT15 percent-15 min $30 / ~24 reviews / store settings), components/ui/*, components/layout/*, README.md, NOTES.md
- A2 catalog: app/shop/page.tsx (filters via URL params: q, category, min, max, sort, rating), app/shop/[category]/page.tsx, app/product/[slug]/page.tsx, components/shop/* (ProductCard, Filters, SortBar, ImageGallery, ReviewsList, SearchBar)
- A3 cart/checkout: components/cart/*, app/cart/page.tsx, app/checkout/page.tsx (steps: info → shipping → payment-demo → review → place), app/order-success/page.tsx, app/track/page.tsx (lookup by order number + email)
- A4 auth/account: app/login/page.tsx, app/signup/page.tsx, app/account/layout.tsx, app/account/page.tsx, app/account/orders/page.tsx, app/account/orders/[id]/page.tsx, app/account/wishlist/page.tsx, app/account/addresses/page.tsx, app/account/settings/page.tsx
- A5 admin shell: app/admin/login/page.tsx, app/admin/layout.tsx (client; renders bare children on /admin/login, else Sidebar shell + AdminGate), app/admin/page.tsx (overview: revenue stat cards, CSS-bar revenue chart, recent orders table, low-stock list), components/admin/*
- A6 admin products: app/admin/products/page.tsx (table, search, stock quick-adjust), app/admin/products/new/page.tsx, app/admin/products/[id]/page.tsx (full edit form incl. images[], colors, sizes, specs)
- A7 admin orders: app/admin/orders/page.tsx (filter by status, search), app/admin/orders/[id]/page.tsx (items, address, timeline, status buttons incl. refund)
- A8 admin customers/coupons/reviews/settings: app/admin/customers/page.tsx, app/admin/coupons/page.tsx, app/admin/reviews/page.tsx, app/admin/settings/page.tsx
- A9 home+content: app/page.tsx (hero, category tiles, featured grid via ProductCard, deals-of-day w/ countdown, testimonials, brand strip, newsletter), app/deals/page.tsx, app/about/page.tsx, app/contact/page.tsx, app/faq/page.tsx, app/shipping/page.tsx, app/privacy/page.tsx, app/terms/page.tsx, app/not-found.tsx, components/home/*
- A10 QA: no owned files; polls for `.done-a1`…`.done-a9`, then build+fix+smoke test, writes QA_REPORT.md + NOTES.md additions.

## Done protocol
When finished, run `touch ~/workspace/ecommerce-site/.done-a<N>` (your number). If blocked, write `~/workspace/ecommerce-site/BLOCKED-a<N>.md` explaining what and what you need.
A10: poll every 60s for all nine markers (timeout 90 min), then `npm install`, `npx tsc --noEmit`, `npm run build`; fix every error (you may edit any file); then `npm start` in background and curl-check `/`, `/shop`, `/shop/electronics`, one `/product/<slug>`, `/cart`, `/checkout`, `/login`, `/signup`, `/track`, `/admin/login`, `/admin`, `/deals` for HTTP 200; write QA_REPORT.md; `touch .done-a10`.

## Notes for all
- English UI. No lorem ipsum — write real-sounding copy.
## Integration notes (Agent 10, 2026-09-21 — append-only, APIs above unchanged)

- `getUsers()` exists in `lib/store.ts` but is intentionally **not exported** — it was never part of the
  contract. Admin customers page reads `novamart_users` from localStorage defensively. Do not add an
  export without updating the contract.
- **`taxRate` scale = fraction** (e.g. `0.08` for 8%). `computeTotals`, the demo-order seeder, and the seed
  file all treat it as a fraction. The admin settings UI displays/edits it as a percent (label: "Tax rate (%)")
  and converts on load/save. Keep the fraction convention in any new consumer.
- `createOrder` internally calls `markCouponUsed` when `couponCode` is passed — callers must not call it again.
- Cart `addItem` takes **one** argument: `Omit<CartItem,'qty'> & { qty?: number }` (qty folded into the object).

## Notes for all (unchanged)
- English UI. No lorem ipsum — write real-sounding copy.
- Every form validates input and shows errors. Every destructive admin action has a confirm.
- `npm run build` must pass with zero TS errors — that is the definition of done.
