# NovaMart — Masterpiece Redesign Brief

The user rejected the generic template look. This brief is the single source of truth for the
visual redesign. **CONTRACT.md still governs all APIs, routes, and data logic — this brief
overrides only the visual layer.** Do not change `lib/store.ts` API shapes, route paths, or
seed product IDs/prices. You MAY improve product descriptions/names in `data/seed.json`
(keep IDs, slugs, prices, stock).

## 1. Brand idea

**NovaMart — "The new general store."** A curated shop that feels like a beloved neighborhood
institution, not a faceless marketplace. Confident, warm, a little dry-witted. Every pixel
should feel *decided*, not defaulted.

## 2. Palette — warm editorial paper (storefront)

| Token | Hex | Usage |
|---|---|---|
| paper | `#F6F1E8` | page background |
| card | `#FFFDF8` | cards, surfaces |
| ink | `#191410` | primary text, headings |
| muted | `#857B6B` | secondary text |
| line | `#E3D9C6` | 1px borders, dividers |
| sand | `#EDE5D3` | alt section backgrounds |
| accent | `#E4572E` | burnt orange — primary CTAs, links, sale badges, active states |
| accent-ink | `#B23A17` | accent hover / pressed |
| forest | `#1E3A2F` | footer bg, editorial feature panels |
| gold | `#C99A2C` | star ratings only |

**Admin (dark "mission control"):**

| Token | Hex |
|---|---|
| bg `#14110D` | panel `#1E1A14` | line `#2E2820` | text `#F2EBDD` |
| muted `#A39A89` | accent `#E4572E` (same orange) | green `#7FB069` | red `#E26D5A` | amber `#E0A458` |

### Hard rules
- **NO gradients** anywhere (especially purple/blue). Flat, confident color.
- **NO default Tailwind indigo/blue** anywhere. The old `#4F46E5` is banned.
- Buttons: primary = accent pill (border-radius 999px), ink text? No — white text on accent.
  Secondary = 1px `line` border pill, ink text.
- Cards: `card` bg, 1px `line` border, radius 14px, subtle shadow only on hover.
- Links in body copy: accent, underline on hover.

## 3. Typography (next/font/google)

- **Display: `Fraunces`** — weights 400..700 + italic. Hero, section titles, product names on
  product page, prices in cart? (prices: body font, semibold).
- **Body/UI: `Space Grotesk`** — 400/500/600/700. Everything else.
- Scale: hero `clamp(3rem, 8vw, 6.5rem)` Fraunces 560, tight leading; section titles
  `clamp(1.9rem, 4vw, 2.9rem)` Fraunces; card product names 1.02rem Space Grotesk 600.

## 4. Motion (framer-motion — installed)

- Scroll reveal: fade + translateY(24px), 0.6s easeOut, once.
- Hero: staggered line entrance on load.
- Announcement marquee: pure CSS keyframes, infinite.
- Product card hover: translateY(-4px), image scale 1.04, quick-add slides up.
- Buttons: active:scale-[0.98]. Page: subtle fade on route change (layout-level).
- Respect `prefers-reduced-motion`.

## 5. Signature elements (build these)

1. **Announcement marquee** (top, ink bg, paper text): `FREE SHIPPING OVER $75 ✦ NEW DROPS EVERY FRIDAY ✦ EASY 30-DAY RETURNS ✦` repeating.
2. **Header**: paper bg, bottom 1px `line`. Logo: `NovaMart` in Fraunces 700 with orange `●`.
   Nav: Shop, Categories (dropdown w/ 6 categories), Deals, Our Story. Right: search icon
   (expands), account, wishlist w/ count, cart w/ count badge (accent).
3. **Hero**: giant Fraunces headline, e.g. *"Good goods, fairly priced."* + one-line subcopy +
   two pill CTAs (Shop the collection → /shop, Today's deals → /deals) + hero image
   (editorial lifestyle, `public/images/hero.jpg`) in arch shape (`border-radius: 999px 999px 18px 18px`).
   Small print row: ★ 4.9 from 12k reviews · 30-day returns · Ships in 24h.
4. **Category tiles**: 6 editorial cards with generated imagery, serif labels, hover zoom.
5. **Product card**: 4:5 image, serif name (1.02rem), muted category, price row + small stars,
   hover reveals "Quick add" pill over image bottom.
6. **Editorial banner** (forest bg, paper text): brand story snippet + CTA.
7. **Reviews**: real-sounding quotes, names, star rows — no lorem.
8. **Footer** (forest): giant Fraunces wordmark, 4 link columns, newsletter input (pill),
   bottom row: © 2026 NovaMart · payment marks as text (VISA MC AMEX).
9. **Admin**: dark sidebar (logo, nav: Dashboard, Orders, Products, Customers, Coupons,
   Reviews, Settings, View store), topbar with search + admin avatar. Dashboard: 4 stat cards
   (Revenue, Orders, Avg. order, Low stock) with SVG sparkline/area chart, revenue area chart
   (SVG, last 14 days from orders), recent orders table, low-stock alert list. Tables: dark
   panels, status pills (amber/blue/green), drawers for detail/edit.

## 6. Page-by-page art direction

- `/` — marquee, hero, category tiles, "This week's drops" product rail, editorial banner,
  bestsellers grid, reviews, newsletter, footer.
- `/shop`, `/shop/[category]` — editorial header (serif title + count), sticky filter rail
  (desktop) / drawer (mobile), sort bar, product grid.
- `/product/[slug]` — breadcrumbs, gallery (main + thumbs, hover zoom), sticky info column:
  serif title, stars + review count, price, color/size pills, qty + Add to cart (accent pill),
  Buy now, accordion (Details, Shipping & returns, Care), reviews section, "Pairs well with" rail.
- `/cart` — serif title, line items with thumbs, qty steppers, coupon field, order summary card
  (sand bg), checkout CTA.
- `/checkout` — 4 steps with progress indicator, forms in cards, order summary sidebar,
  DEMO payment notice styled as an ink callout (not an ugly yellow box).
- `/order-success` — big serif "Thank you.", order number in mono chip, timeline, CTA pills.
- `/track` — centered card, order number input, timeline.
- `/login`, `/signup` — split layout: forest panel with serif quote + form card.
- `/account/*` — sidebar layout, warm cards.
- `/deals` — countdown band (accent bg), deal grid with "−20%" badges.
- `/about`, `/contact`, `/faq`, `/shipping`, `/privacy`, `/terms` — editorial serif headers,
  generous measure (max-w-prose), forest quote blocks.
- `/admin/*` — dark mission-control per §5.9. Login: centered dark card.

## 7. Copy voice

Dry, confident, human. Specific over superlative.
- Good: "Good goods, fairly priced." / "Restocked Friday. Gone by Monday, usually."
  / "We sell things we'd buy ourselves. That's the whole strategy."
- **BANNED**: "elevate", "discover amazing", "curate(d) collection of premium",
  "unleash", "delve", "lorem ipsum", more than one exclamation mark per page,
  purple prose about lifestyles.

## 8. Imagery

- `public/images/`: `hero.jpg` (warm lifestyle flat-lay, editorial), `story.jpg`,
  `cat-electronics.jpg`, `cat-fashion.jpg`, `cat-home.jpg`, `cat-beauty.jpg`,
  `cat-sports.jpg`, `cat-toys.jpg` — warm, consistent grade, no text in images.
- Product thumbs: keep existing picsum seeds (deterministic); treat with rounded-14px +
  hover scale. Do not hotlink new random images.

## 9. Engineering constraints

- Next.js 14 App Router, strict TS, Tailwind 3.4. `npm install` then `npx tsc --noEmit`
  then `npm run build` must be green before you finish.
- framer-motion is installed — use it; do not add heavy new deps without need.
- Keep all CONTRACT.md APIs: `lib/store.ts`, `CartShell`/`useCart`, `ProductCard({product})`,
  ui barrel exports. You may EXTEND ui primitives' styling but not break prop shapes
  (Button, QtySelector({value,onChange,max}), EmptyState({icon,title,hint,action}),
  SectionHeading, Price, Stars, Badge, Card, Input, Select, Textarea, Modal).
- Mobile-first responsive; test 390px and 1440px mentally and via build.
- Write `.done-a<N>` when your section is complete (keep your assigned N).
