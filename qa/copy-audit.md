# NovaMart — Copy Audit (read-only)

**Date:** 2026-09-21 · **Auditor:** agent a23
**Scope:** all user-facing string literals in `app/**/*.tsx`, `components/**/*.tsx|ts`, plus `data/seed.json` category/product copy.
**Standard:** `COPY_DECK.md` + `DESIGN_BRIEF.md` §7 (dry, confident, human; specific over superlative).
**Method:** banned-word grep (any case), cliché-phrase grep, misspelling grep, exclamation audit, plus manual read of every headline/empty-state/error/microcopy on the storefront, account, and admin routes.

> ⚠️ Snapshot caveat: feature agents a11–a15 were actively editing files during this audit. Strings quoted below were live at audit time and may have moved since.

## Verdict: PASS — zero hard violations

| Check | Result |
|---|---|
| Banned words (`elevate`, `discover amazing`, `curated collection of premium`, `unleash`, `delve`, any case) | **0 hits** |
| Lorem ipsum / placeholder copy | **0** (only legitimate form-input `placeholder=` attributes) |
| AI-template clichés (`seamless`, `unlock`, `game-changer`, `cutting-edge`, `look no further`, `whether you're…`, `one-stop`, `dive into`, `embark`, `tapestry`, `bustling`, `next level`, `welcome to`, `premium`, `curated`, `exclusive`, `ultimate`) | **0 hits** |
| Misspellings (recieve/seperat/occured/definately/neccessary/acommodat/sucessfull/shippng/adress/checout/wishlistt/recomend/guarante/warantee/existant/publically) | **0 hits** |
| Exclamation marks in copy (deck allows ≤1 per page) | **0** — none anywhere |
| Brand voice consistency | **Strong** — dry, confident, human throughout |

What's working well (spot-checked, all on-voice):
- Hero uses deck Option A verbatim: `"Good goods, fairly priced."` (`components/home/Hero.tsx:9`)
- About page: `"We sell things we'd buy ourselves. That's the whole strategy."`, `"The old general store had it right…"` — excellent
- Deals: `"Deals worth opening."` / `"Marked down, honestly."` / `"No inflated was-prices here."`
- Checkout: `"Where is it going?"`, `"How fast?"`, `"Pick a pace. Standard is on us over $75."`
- Demo honesty: `"Demo checkout — no real charge."` + `"This storefront is a demonstration. No payment is processed here…"` (`app/checkout/page.tsx:524-533`)
- Footer: `"© 2026 NovaMart. A demo storefront — nothing here is really for sale."`
- Admin dark-side copy is professional: `"Mission control."` / `"Wipe every demo change in this browser and restore seed data."`
- Product "Care" accordion: `"Treat it decently and it will outlast your urge to replace it."` — peak NovaMart

## Findings (minor — all suggestions, voice already consistent)

### 1. Cart empty-state differs between drawer and page
- `components/cart/CartDrawer.tsx:78` — title `"Nothing here yet"` ✓ (matches deck)
- `app/cart/page.tsx:86` — title `"Your cart is empty"` ✗ (deck: `"Nothing here yet."`)
- Both use hint `"Good taste takes a moment. Start with today's deals and find something worth keeping."` (deck hint: `"Your cart is empty. The shop is not."`)
- **Suggested fix:** unify both to — title: `"Nothing here yet."` / hint: `"Your cart is empty. The shop is not."`

### 2. Coupon error copy drifts from the deck
- `components/cart/CouponForm.tsx:37` — `"That coupon no longer works for this order."`
- `components/cart/CouponForm.tsx:53` — `"That coupon code is not valid."`
- Deck §8 prescribes: `"That code doesn't work here. Check the spelling?"`
- **Suggested fix:** use the deck line for both.

### 3. Wishlist empty state drifts from the deck
- `app/account/wishlist/page.tsx:45-46` — `"Your wishlist is empty"` / `"Tap the heart on any product to save it here for later."`
- Deck: `"No favorites yet."` / `"Tap the heart on anything you like. We'll keep it warm."`
- **Suggested fix:** adopt the deck version — `"We'll keep it warm"` is the most NovaMart line in the deck.

### 4. Orders empty-state hints drift from the deck
- `app/account/orders/page.tsx:54-55` — `"Once you place an order, it will show up here with live status updates."`
- `app/account/page.tsx:102-103` — `"Your orders will land here once you place your first one."`
- Deck: `"Your history starts with the first box."`
- **Suggested fix:** use the deck hint on at least one; it's stronger than both.

### 5. Track "not found" copy is slightly weaker than the deck
- `app/track/page.tsx:32` — `` `We couldn't find order "${n}". Check the number and try again.` ``
- Deck: `"Can't find that order."` / `"Double-check the number — it starts with NM. Or track with your email instead."`
- **Suggested fix:** keep the dynamic version but add the deck's most useful fact: `We couldn't find order "${n}". Numbers start with NM — double-check and try again.`

### 6. Admin settings tagline placeholder is template-ish
- `app/admin/settings/page.tsx:177` — `placeholder="Everything you love, delivered."`
- **Suggested fix:** `placeholder="Good goods, fairly priced."` (the actual tagline).

### 7. Deck category one-liners are unused
- `COPY_DECK.md` §2 lines — `"The stuff that survives your pocket."`, `"Basics that outlast trends."`, `"For the rooms you actually live in."`, `"Fewer ingredients, better mornings."`, `"Gear that shows up when you do."`, `"For kids. And adults who admit it."` — appear **nowhere** in the code. Tiles show name + product count; category pages use seed descriptions.
- **Suggested fix:** use these as tile subtitles on the homepage category grid.

### 8. Cross-team note (visual, not copy) — flag for visual QA agent
- `components/cart/CartDrawer.tsx:98` — the unlocked free-shipping state uses hardcoded `#2F5D34` green text, which is not in the DESIGN_BRIEF palette. Copy itself is fine (`"Free standard shipping, unlocked"`).

## Counts
- Hard violations (banned / lorem / cliché / misspelling / over-`!`): **0**
- Suggested fixes: **7** copy + **1** cross-team visual note
- Files with findings: 8
