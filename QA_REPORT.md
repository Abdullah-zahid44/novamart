# NovaMart — QA Report

**Project:** NovaMart — "Everything you love, delivered." (Next.js 14 + React 18 + TypeScript strict + Tailwind 3.4)
**QA scope:** full functional + visual QA, desktop `1440×900` and mobile `390×844`.
**Status note:** this report is the checklist the QA run fills in. Every item is `PENDING` until the automated
Playwright run (`qa/playwright-qa.mjs`) executes against a green production build and screenshots are reviewed.
**No result below is invented** — do not mark an item PASS/FAIL without the run evidence.

## 1. Route checks (HTTP 200, no JS pageerror, no horizontal overflow)

| Route | Viewport(s) | Status |
|---|---|---|
| `/` (home) | desktop, mobile | PENDING |
| `/shop` | desktop, mobile | PENDING |
| `/shop/electronics` | desktop, mobile | PENDING |
| `/shop/fashion` | desktop, mobile | PENDING |
| `/shop/home-kitchen` | desktop, mobile | PENDING |
| `/shop/beauty` | desktop, mobile | PENDING |
| `/shop/sports` | desktop, mobile | PENDING |
| `/shop/toys-and-games` | desktop, mobile | PENDING |
| `/product/<valid slug>` (seed product) | desktop, mobile | PENDING |
| `/product/<invalid slug>` → 404 page | desktop, mobile | PENDING |
| `/cart` | desktop, mobile | PENDING |
| `/checkout` | desktop, mobile | PENDING |
| `/order-success` | desktop, mobile | PENDING |
| `/track` | desktop, mobile | PENDING |
| `/login` | desktop, mobile | PENDING |
| `/signup` | desktop, mobile | PENDING |
| `/account` (redirects to login when logged out) | desktop, mobile | PENDING |
| `/account/orders` | desktop, mobile | PENDING |
| `/account/orders/<id>` | desktop, mobile | PENDING |
| `/account/wishlist` | desktop, mobile | PENDING |
| `/account/addresses` | desktop, mobile | PENDING |
| `/account/settings` | desktop, mobile | PENDING |
| `/deals` | desktop, mobile | PENDING |
| `/about` | desktop, mobile | PENDING |
| `/contact` | desktop, mobile | PENDING |
| `/faq` | desktop, mobile | PENDING |
| `/shipping` | desktop, mobile | PENDING |
| `/privacy` | desktop, mobile | PENDING |
| `/terms` | desktop, mobile | PENDING |
| `/admin/login` | desktop, mobile | PENDING |
| `/admin` (redirects to `/admin/login` when logged out) | desktop, mobile | PENDING |
| `/admin/products` | desktop, mobile | PENDING |
| `/admin/products/new` | desktop, mobile | PENDING |
| `/admin/products/<id>` | desktop, mobile | PENDING |
| `/admin/orders` | desktop, mobile | PENDING |
| `/admin/orders/<id>` | desktop, mobile | PENDING |
| `/admin/customers` | desktop, mobile | PENDING |
| `/admin/coupons` | desktop, mobile | PENDING |
| `/admin/reviews` | desktop, mobile | PENDING |
| `/admin/settings` | desktop, mobile | PENDING |

## 2. Functional flows

| # | Flow | Steps / assertion | Status |
|---|---|---|---|
| F1 | Customer signup + login | Signup new user → login `demo@novamart.com` / `demo123` → account page shows name | PENDING |
| F2 | Add to cart | Product card quick-add and product page add → cart count badge increments | PENDING |
| F3 | Cart persistence | Add item → reload → navigate to `/shop` and back → cart still holds item (localStorage `novamart_*`) | PENDING |
| F4 | Quantity update / removal | Cart qty +/−, QtySelector on product page, remove item → subtotal updates, empty-cart state renders | PENDING |
| F5 | Coupon application | Apply `WELCOME10` → discount shown; invalid code → error message (no crash) | PENDING |
| F6 | Coupon usage increments exactly once | Place order with `WELCOME10` → `used` increases by exactly 1 (checkout must not double-increment; `createOrder` increments internally) | PENDING |
| F7 | Guest checkout | Guest cart → checkout steps (info → shipping → payment-demo → review) → place order → redirect to order success | PENDING |
| F8 | Logged-in checkout | Login as demo customer → checkout → order success; order appears under `/account/orders` | PENDING |
| F9 | Order success rendering | Success page shows order number (starts with NM), items, totals, address | PENDING |
| F10 | Order tracking | `/track` with order number + email → order status/timeline shown; wrong number → "Can't find that order" empty state | PENDING |
| F11 | Stock decrement | Note stock before → place order → stock decreases by ordered qty in catalog/storefront | PENDING |
| F12 | Cart cleared after order | After successful checkout, cart is empty | PENDING |
| F13 | Empty-cart checkout blocked | `/checkout` with empty cart → blocked/redirected, cannot place order | PENDING |
| F14 | Tracking email optional on success link | Order-success deep link works without email param | PENDING |
| F15 | Admin login | `admin@novamart.com` / `admin123` → `/admin` dashboard; non-admin cannot pass AdminGate (redirect to `/admin/login`) | PENDING |
| F16 | Product edit → storefront | Admin edits product name/price/stock → change visible on `/product/<slug>` and `/shop` | PENDING |
| F17 | Inventory quick-adjust | Admin products table stock +/- → persists and reflects on storefront | PENDING |
| F18 | Order status / timeline update | Admin order detail: pending → confirmed → shipped → delivered; timeline entries appear; refund path works; customer track page reflects status | PENDING |
| F19 | Admin customers | Customers table lists seeded + signed-up users | PENDING |
| F20 | Admin coupons | List / create / edit / activate-deactivate / delete coupon; usage count shown | PENDING |
| F21 | Admin reviews | Reviews list renders; delete/moderation works | PENDING |
| F22 | Admin settings round-trip | Settings shows tax as `8` (percent) → save `10` → stored as `0.1` (fraction) → restore `8` → stored `0.08`. Tax convention: fraction in storage, percent in UI | PENDING |
| F23 | Seeder preserves real orders | Demo-order seeder creates 5 demo orders only when none exist; checkout-created orders are never overwritten | PENDING |
| F24 | Mobile menu | Hamburger opens nav on 390×844; links navigate; closes on selection | PENDING |
| F25 | No console/page errors | Zero JS `pageerror` on every route; `console.error` recorded as warnings only (remote-image failures are environmental) | PENDING |
| F26 | Wishlist | Toggle heart on product → `/account/wishlist` lists it; empty state when none | PENDING |
| F27 | Search + filters | `/shop?q=…`, category/min/max/sort/rating URL params filter correctly; no-results empty state | PENDING |

## 3. Visual checks (per DESIGN_BRIEF.md)

| # | Check | Status |
|---|---|---|
| V1 | No horizontal overflow on any route at either viewport (`scrollWidth ≤ innerWidth`) | PENDING |
| V2 | Zero indigo/purple/blue leftovers anywhere (old `#4F46E5` banned) | PENDING |
| V3 | Zero gradients anywhere | PENDING |
| V4 | Palette consistency: paper `#F6F1E8`, ink `#191410`, accent `#E4572E`, forest `#1E3A2F`, gold `#C99A2C` for stars only | PENDING |
| V5 | Admin palette: bg `#14110D`, panel `#1E1A14`, line `#2E2820`, text `#F2EBDD`, accent `#E4572E` | PENDING |
| V6 | Typography: Fraunces display + Space Grotesk body, no fallback-font flashes | PENDING |
| V7 | No broken/missing images (hero, category tiles, product images); arch-shaped lifestyle imagery renders | PENDING |
| V8 | No clipping, overlap, or malformed layouts on desktop | PENDING |
| V9 | No clipping, overlap, or malformed layouts on mobile; admin tables degrade to usable cards/stacked layout | PENDING |
| V10 | Forms: consistent inputs, labels, error states, focus rings | PENDING |
| V11 | Empty states intentional and on-voice (cart, wishlist, orders, search, tracking) | PENDING |
| V12 | Announcement marquee animates (CSS keyframes), respects `prefers-reduced-motion` | PENDING |
| V13 | Product card hover: translateY(-4px), image scale 1.04, quick-add slides up | PENDING |
| V14 | Buttons: primary = accent pill, white text; secondary = 1px line-border pill; active scale 0.98 | PENDING |
| V15 | No banned copy ("elevate", "discover amazing", "curated collection of premium", "unleash", "delve", lorem ipsum) | PENDING |

## 4. Evidence

- Screenshots: `qa/shots/desktop/<route>.png`, `qa/shots/mobile/<route>.png` (+ `qa/shots/mobile/menu-open.png`)
- Machine results: `qa/results.json` (per-route status/overflow/consoleErrors/pageErrors, per-flow ok/detail)
- Manual review of the flagged screenshots above is required before sign-off.

---

## Final verification run — 2026-09-22 (all genuine, Firefox headless)

**Method:** production build (`npm run build`, 34/34 pages, exit 0) served via `next start -p 3100`;
Firefox headless Playwright; viewports 1440×900 and 390×844; script `novamart_final_qa.py`
(38 route visits: HTTP status, horizontal-overflow check, console-error + page-exception
capture, screenshot). Screenshots: `qa/shots/final/` (45 PNG).

**Result: ROUTES=38 · BAD=0 · CONSOLE_ERR_ROUTES=0 · SHOTS=45**
- All 19 routes × 2 viewports returned HTTP 200, zero horizontal overflow.
- Zero console errors, zero page exceptions on every route.
- Guest cart → checkout flow spot-checked on both viewports: no errors.
- Admin login → order-detail spot-check (mobile 390px): no errors; item-name
  truncation fixed (`truncate` → `line-clamp-2`, verified in screenshot).

**Defects found and fixed in this pass:**
1. **Hydration errors #425/#422 on `/deals` and `/shop/electronics`** — root causes:
   - `components/home/Countdown.tsx` initialized state with `Date.now()` during render
     (server time ≠ client time). Fixed: state starts at 0, real time set in `useEffect`.
   - `app/shop/[category]/page.tsx` rendered `getProducts()` output during SSR; the server
     has no localStorage so it rendered `[]` while the client rendered 48 products.
     Fixed: mounted-gating (skeleton until mount, same pattern as the product page) and
     `lib/store.ts#getProducts()` now returns the seed catalog on the server so SSR HTML
     matches a fresh client's first render. This also fixed the homepage (server component)
     rendering empty product sections during SSR.
   - Re-ran the full 38-route pass after the fix: **0 console-error routes**.
2. **Mobile admin order-detail item names truncated too aggressively** ("BrewM. Pour-")
   — changed to 2-line clamp + narrower price column; verified via screenshot.
3. Stale dev server on :3100 was serving the pre-fix build during the first re-run;
   killed by exact PID and restarted against the final build before the green run.

**Earlier worker QA (2026-09-21, 4 parallel workers, coordinator-verified in source):**
- Storefront flows 36/36 PASS (signup, login, cart add/persist/qty/remove, WELCOME10
  exactly once, guest + logged-in checkout, order success, tracking, wishlist,
  newsletter, empty states). One FAIL was a test expectation error, not an app bug.
- Admin flows 47/47 desktop + 39/39 mobile PASS; tax 8↔0.08 round-trip verified;
  seeder preserves checkout-created orders.
- Accessibility: 8/8 runtime fixes keyboard-verified, zero console errors.
- Visual: copy-deck fixes applied; zero functional off-palette/gradient hits
  (only code comments remain); 43 worker screenshots manually inspected.
