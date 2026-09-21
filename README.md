# NovaMart

**Everything you love, delivered.** A complete, functional ecommerce demo store built with Next.js 14 (App Router), React 18, TypeScript, and Tailwind CSS.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build (must pass with zero TS errors)
npm run start   # serve the production build
npm run lint    # eslint
```

## Demo logins

| Role     | Email               | Password |
|----------|---------------------|----------|
| Admin    | admin@novamart.com  | admin123 |
| Customer | demo@novamart.com   | demo123  |

The admin dashboard lives at `/admin` (guarded — non-admins are redirected to `/admin/login`).

## Demo coupons

| Code      | Effect        | Min. order |
|-----------|---------------|------------|
| WELCOME10 | 10% off       | $50        |
| SAVE20    | $20 off       | $150       |
| FREESHIP  | Free shipping | $75        |
| STUDENT15 | 15% off       | $30        |

## What it does

- **Catalog** — 48 products across 6 categories, search, filters, sorting, product pages with galleries, specs, and reviews
- **Cart & checkout** — slide-over cart drawer, multi-step demo checkout (info → shipping → payment → review), order success + order tracking by order number
- **Accounts** — signup/login, order history, wishlist, saved addresses, settings
- **Admin** — overview dashboard (revenue stats, charts, low stock), product management, order management with status timeline + refunds, customers, coupons, reviews, store settings
- **Content** — home page (hero, categories, featured, deals countdown, testimonials), deals, about, contact, FAQ, shipping, privacy, terms

## Demo-grade persistence

There is no real database. `data/seed.json` holds the catalog (products, categories, coupons, reviews, settings). On first browser visit, `lib/store.ts` seeds everything into `localStorage` (keys prefixed `novamart_`) and all mutations — cart, users, orders, admin edits, coupons, settings — live there. Admin product edits are stored as a full-array override (`novamart_products_override`). Clearing site data resets the demo.

## Project structure

```
app/                 # App Router pages (layout, shop, product, cart, checkout, account, admin, content)
components/
  ui/                # Shared primitives (Button, Input, Modal, Stars, Price, …)
  layout/            # Header, Footer
  cart/              # CartShell provider + drawer (Agent 3)
  shop/              # ProductCard, filters (Agent 2)
  admin/             # Admin sidebar, stat cards, auth gate (Agent 5)
  home/              # Home page sections (Agent 9)
lib/
  types.ts           # Contract-fixed domain types
  store.ts           # localStorage data layer (exact function names per contract)
  format.ts          # currency(), formatDate(), orderStatusMeta
  cn.ts              # class-name joiner
data/seed.json       # 48 products / 6 categories / 4 coupons / 24 reviews / settings
```

See `CONTRACT.md` for the 10-agent build contract and `NOTES.md` for implementation decisions.
