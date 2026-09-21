# NovaMart Accessibility Audit (static, read-only)

**Date:** 2026-09-21 · **Scope:** 82 `.tsx` files under `app/` and `components/` · **Method:** static code inspection only (no runtime browser test). Items that cannot be verified statically are marked **needs runtime check**.

**Contrast reference (computed, WCAG 2.1 AA):**
| Pair | Ratio | AA normal (4.5) |
|---|---|---|
| accent `#E4572E` on paper `#F6F1E8` | 3.27:1 | FAIL |
| white on accent `#E4572E` | 3.68:1 | FAIL |
| muted `#857B6B` on paper `#F6F1E8` | 3.70:1 | FAIL |
| muted `#857B6B` on card `#FFFDF8` | 4.10:1 | FAIL |
| accent `#E4572E` on sand `#EDE5D3` | 2.94:1 | FAIL (even large text) |
| accent-ink `#B23A17` on paper | 5.32:1 | PASS |
| white on accent-deep `#B23A17` | 5.98:1 | PASS |
| paper on forest `#1E3A2F` | 10.97:1 | PASS |
| admin text `#F2EBDD` on bg `#14110D` | 15.87:1 | PASS |
| admin muted `#A39A89` on bg/panel | 6.76 / 6.22:1 | PASS |

---

## Major

1. **`app/admin/products/ProductForm.tsx` (all `<Field>` usages, ~lines 194–430) — issue — major.**
   `Field` (`app/admin/_ui.tsx:108`) renders `<label htmlFor={htmlFor}>` but every call site omits `htmlFor` and every `<input>/<select>/<textarea>` omits `id`. The visible labels are **not programmatically associated** with their controls — screen readers announce ~15 unlabeled fields (name, slug, brand, category, description, tags, price, compare-at, stock, colors, sizes, specs, images, badge, featured).

2. **`components/ui/Button.tsx:18` — primary variant `bg-accent text-white` — issue — major.**
   White on `#E4572E` = 3.68:1, fails AA for normal text. This is the primary CTA style site-wide (add-to-cart, checkout, forms). Note: this exact pairing is mandated by DESIGN_BRIEF §2, so fixing it is a design decision — `accent-deep #B23A17` with white text passes at 5.98:1.

3. **Eyebrow kickers `text-xs font-bold uppercase text-accent` on paper — issue — major.**
   Accent on paper = 3.27:1, fails AA for small text. Repeated brand pattern on: `components/home/Hero.tsx:54`, `app/page.tsx:136`, `app/shop/page.tsx:133`, `app/product/[slug]/page.tsx:384,403`, `app/cart/page.tsx:100`, `app/checkout/page.tsx:268`, `app/track/page.tsx:62`. Recommend `accent-ink #B23A17` (5.32:1) for these.

4. **Muted secondary text `text-muted` (`#857B6B`) on paper/card — issue — major.**
   3.70:1 on paper / 4.10:1 on card — fails AA for body-size text. Used pervasively (category labels, descriptions, helper text, prices' context). Recommend darkening muted toward `#6E6455` (≈4.6:1).

5. **`components/ui/Modal.tsx` — no focus trap, no initial focus — issue — major.**
   Escape-to-close ✓, `role="dialog"` + `aria-modal="true"` ✓, backdrop close ✓ — but Tab can leave the dialog and focus is not moved into it on open. Keyboard/SR users can tab behind the modal.

6. **`components/layout/Header.tsx:239` — mobile nav drawer — issue — major.**
   `role="dialog" aria-label="Menu"` ✓ and close button has `aria-label="Close menu"` ✓, but there is **no Escape-to-close** and no focus trap. (Hamburger button itself `Header.tsx:94` has `aria-label="Open menu"` ✓ and is a native button, so keyboard activation is fine.)

## Minor

7. **`app/admin/page.tsx:229–233` — 5 `<th>` without `scope="col"` — issue — minor.**
   All other admin tables (32 `<th>` across orders/products/customers/reviews) include scope; only the dashboard recent-orders table omits it.

8. **`components/layout/Header.tsx:76` — `iconBtn` class has no `focus-visible` ring — issue — minor.**
   Header icon buttons (menu, search, cart, wishlist) rely on the browser default outline. Inconsistent with `Button.tsx`, which has explicit `focus-visible:ring-2`.

9. **`app/layout.tsx` — no skip-to-content link — issue — minor.**
   Keyboard users must tab through the full header (nav, dropdown, search, account, cart) on every page.

10. **`components/cart/CartDrawer.tsx:51` — `role="dialog"` without `aria-modal="true"` — issue — minor.**
    Escape-to-close ✓ (`CartDrawer.tsx:23`), labelled close/remove buttons ✓, free-shipping `role="progressbar"` has full `aria-valuenow/min/max` ✓.

11. **`text-accent` icons on `bg-sand` chips — issue — minor.**
    e.g. `app/about/page.tsx:78`, `app/contact/page.tsx:53`, `app/shipping/page.tsx:42` — 2.94:1, but these are decorative icons (no text); acceptable, flagged for completeness.

12. **`components/admin/Topbar.tsx:106` — Escape clears the search query but does not dismiss the results dropdown — issue — minor.**

## Needs runtime check (could not verify statically)

- **Focus trap behavior** in Modal, mobile nav drawer, and CartDrawer (Tab cycling, focus return to trigger) — needs keyboard test in a real browser.
- **Toast announcements** (`Toast` in admin `_ui`, cart feedback) — whether `aria-live` regions announce to screen readers.
- **Dynamic cart/account updates** — whether quantity changes and order-status changes are announced.
- **Marquee** (`Header.tsx:82`) is `aria-hidden` ✓ statically, but confirm it is truly `prefers-reduced-motion`-safe at runtime (CSS `@media (prefers-reduced-motion: reduce)` exists in `app/globals.css:59` and framer-motion `useReducedMotion` is used in Hero/ProductGrid/Reveal ✓).
- **`accent #E4572E` on forest `#1E3A2F` (3.35:1)** — token pairing fails AA; no usage found statically on those surfaces, confirm at runtime.

## Verified OK

- **Images:** all `<Image>`/`<img>`/SmartImage instances carry meaningful `alt` (product names, `alt="Product preview"`, thumbnails `View image N of …` via `ImageGallery.tsx:51,65`). No `alt=""` misuse found; SmartImage's missing-asset fallback uses `role="img"` + `aria-label` correctly.
- **Icon-only buttons:** all 23+ have `aria-label` (QtySelector ±, search/cart/menu/close/remove/sign-out). No unnamed buttons found.
- **Form labels:** storefront `Input`/`Select`/`Textarea` render associated `<label htmlFor>`; checkout radios wrapped in `<label>` inside `role="radiogroup"` (`checkout/page.tsx:450`); Filters radios/checkboxes wrapped in `<label>`; coupons/settings/review forms use `id`-associated labels. **Exception: admin ProductForm (see Major #1).**
- **Stars:** `role="img"` + `aria-label="Rated X out of 5 stars"`, icons `aria-hidden` (`Stars.tsx:14`).
- **Countdown:** `role="timer"` + `aria-label` (`Countdown.tsx:48`).
- **Checkout steps:** `<ol aria-label="Checkout steps">` with `aria-current="step"` (`checkout/page.tsx:274,290`).
- **Headings:** every page renders exactly one `<h1>` (via `EditorialHeader` on editorial pages).
- **Inputs' focus rings:** all text inputs pair `focus:outline-none` with a visible `focus:ring-2`; no outline removed without replacement found.
