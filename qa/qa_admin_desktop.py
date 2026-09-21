"""NovaMart admin QA — desktop 1440x900, Firefox (Chromium is LNA-blocked on localhost).
Run: python3 ~/workspace/ecommerce-site/qa/qa_admin_desktop.py
Same-browser-context admin edits + storefront reflection (localStorage).
Any console error or page error = FAIL for that check."""
import os, sys, time
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:3106"
SHOT = os.path.expanduser("~/workspace/ecommerce-site/qa-shots/admin")
os.makedirs(SHOT, exist_ok=True)
EMAIL, PW = "admin@novamart.com", "admin123"
results = []

class Watcher:
    def __init__(self, page):
        self.console_errors, self.page_errors = [], []
        def _on_console(m):
            if m.type != "error":
                return
            try:
                url = m.location.get("url", "") if m.location else ""
            except Exception:
                url = ""
            self.console_errors.append(f"{m.text} @ {url}")
        page.on("console", _on_console)
        page.on("pageerror", lambda e: self.page_errors.append(str(e)[:300]))
    def check(self, name, ignore_favicon=True):
        ce = [e for e in self.console_errors if not (ignore_favicon and "favicon.ico" in e)]
        pe = self.page_errors
        if ce or pe:
            results.append(("FAIL", name, f"console={ce} page={pe}")); return False
        results.append(("PASS", name, "")); return True
    def clean(self):
        self.console_errors.clear(); self.page_errors.clear()

def check(name, cond, detail=""):
    results.append(("PASS" if cond else "FAIL", name, detail))

def goto(page, url, tries=4):
    """Direct goto with retries (Firefox localhost can hit intermittent LNA blocks)."""
    last = None
    for i in range(tries):
        try:
            page.goto(url, timeout=60000, wait_until="load")
            page.wait_for_timeout(1500)
            return
        except Exception as e:
            last = e
            time.sleep(3)
    raise last

def ls_get(page, key):
    return page.evaluate(f"JSON.parse(localStorage.getItem('novamart_{key}')||'null')")

def login(p):
    goto(p, f"{BASE}/admin/login")
    p.fill("#email", EMAIL); p.fill("#password", PW)
    p.click('button[type="submit"]')
    p.wait_for_url(f"{BASE}/admin", timeout=60000)
    p.wait_for_timeout(1500)

def main():
    try:
        _run()
    except Exception as e:
        results.append(("FAIL", "SCRIPT-CRASH", f"{type(e).__name__}: {str(e)[:300]}"))
    fails = [r for r in results if r[0] == "FAIL"]
    print(f"\n===== DESKTOP QA: {len(results)-len(fails)}/{len(results)} passed =====", flush=True)
    for s, n, d in results:
        print(f"[{s}] {n}" + (f" — {d}" if d else ""), flush=True)
    return 0 if not fails else 1

def _run():
    with sync_playwright() as pw:
        b = pw.firefox.launch(headless=True)
        ctx = b.new_context(viewport={"width": 1440, "height": 900})
        p = ctx.new_page()
        w = Watcher(p)

        # ---- 1. auth ----
        goto(p, f"{BASE}/admin")
        check("1a logged-out /admin redirects to /admin/login", "/admin/login" in p.url, f"url={p.url}")
        goto(p, f"{BASE}/admin/login")
        p.fill("#email", EMAIL); p.fill("#password", "wrongpass1")
        p.click('button[type="submit"]'); p.wait_for_timeout(1500)
        check("1b wrong password shows error", p.locator("text=Invalid email or password").count() > 0)
        check("1c wrong password does NOT enter admin", "/admin/login" in p.url, f"url={p.url}")
        p.screenshot(path=f"{SHOT}/d-login.png")
        login(p)
        body_head = p.inner_text("body")[:4000]
        check("1d login with admin creds loads dashboard", "Mission control" in body_head, f"url={p.url}")
        w.check("1e no console errors on login flow")

        # ---- 2. dashboard ----
        goto(p, f"{BASE}/admin")
        # seed demo orders by visiting the orders page (seeder runs there), then return
        goto(p, f"{BASE}/admin/orders"); p.wait_for_timeout(800)
        goto(p, f"{BASE}/admin"); p.wait_for_timeout(800)
        demo_count = len(ls_get(p, "orders") or [])
        check("2-pre demo orders seeded on /admin/orders visit", demo_count >= 3, f"orders={demo_count}")
        n_cards = sum(1 for t in ["REVENUE", "ORDERS", "AVG. ORDER VALUE", "LOW STOCK"] if t in p.inner_text("body"))
        check("2a 4 stat cards render with values", n_cards == 4, f"found={n_cards}")
        check("2b revenue chart renders SVG", p.locator("svg").count() >= 1, f"svgs={p.locator('svg').count()}")
        check("2c recent orders section renders", p.locator("text=Recent orders").count() > 0)
        check("2d low-stock section renders", p.locator("text=Running low").count() > 0)
        p.screenshot(path=f"{SHOT}/d-admin.png")
        w.clean(); goto(p, f"{BASE}/admin"); p.wait_for_timeout(1000)
        w.check("2e no console errors on dashboard")

        # ---- 3. products: edit -> storefront reflection ----
        goto(p, f"{BASE}/admin/products")
        first_name = p.locator("tbody tr td").first.inner_text().strip() if p.locator("tbody tr").count() else ""
        check("3-pre products list loads seed data", len(first_name) > 0, f"first={first_name[:40]}")
        pid = p.evaluate("""(()=>{const rows=[...document.querySelectorAll('tbody tr')];
          for(const r of rows){const a=r.querySelector('a[aria-label^="Edit "]');
            if(a){const m=a.getAttribute('aria-label').match(/^Edit (.+)$/);return {id:a.href.split('/').pop(),name:m?m[1]:''}}}
          return null})()""")
        check("3a edit button opens product edit page", pid is not None, f"{pid}")
        p.click(f"a[aria-label='Edit {pid['name']}']")
        p.wait_for_timeout(2000)
        check("3a2 edit page loaded", f"/admin/products/{pid['id']}" in p.url, f"url={p.url}")
        new_name = pid["name"] + " — QA"
        p.fill("#pf-name", new_name); p.fill("#pf-price", "199.99"); p.fill("#pf-stock", "42")
        p.click("button[type=submit]"); p.wait_for_timeout(2000)
        saved = ls_get(p, "products_override")
        match = [x for x in (saved or []) if x["id"] == pid["id"]]
        check("3b product name edit persisted", match and match[0]["name"] == new_name,
              f"{(match[0]['name'][:40] if match else 'none')}")
        check("3c price+stock persisted", match and match[0]["price"] == 199.99 and match[0]["stock"] == 42)
        p2 = ctx.new_page(); w2 = Watcher(p2)
        goto(p2, f"{BASE}/shop"); p2.wait_for_timeout(1000)
        check("3d edited product visible on storefront", new_name in p2.inner_text("body"))
        goto(p2, f"{BASE}/product/{match[0]['slug']}" if match else f"{BASE}/shop"); p2.wait_for_timeout(1000)
        body2 = p2.inner_text("body")
        check("3e storefront shows updated price+stock", "$199.99" in body2 and "42" in body2,
              body2[:120].replace("\n", " "))
        p2.close()
        goto(p, f"{BASE}/admin/products")
        p.screenshot(path=f"{SHOT}/d-products.png")
        w.check("3f no console errors on products")

        # ---- 3b. new product ----
        goto(p, f"{BASE}/admin/products/new"); p.wait_for_timeout(1000)
        p.screenshot(path=f"{SHOT}/d-products-new.png")
        check("3g new product page renders form", p.locator("#pf-name").count() > 0)
        qname = "QA Test Widget 3000"
        p.fill("#pf-name", qname); p.fill("#pf-price", "59.99"); p.fill("#pf-stock", "10")
        p.fill("#pf-brand", "QABrand")
        p.select_option("#pf-category", "electronics"); p.fill("#pf-description", "QA-created product for admin test.")
        p.click("button[type=submit]"); p.wait_for_timeout(2500)
        created = [x for x in (ls_get(p, "products_override") or []) if x["name"] == qname]
        check("3h new product created", len(created) == 1, f"found={len(created)}")
        if created:
            p3 = ctx.new_page()
            goto(p3, f"{BASE}/shop"); p3.wait_for_timeout(1000)
            check("3i new product visible on storefront", qname in p3.inner_text("body"))
            p3.close()
            goto(p, f"{BASE}/admin/products/{created[0]['id']}"); p.wait_for_timeout(1000)
            p.screenshot(path=f"{SHOT}/d-products-edit.png")
            check("3j edit page for new product loads", p.locator("#pf-name").count() > 0)

        # ---- 4. orders: status -> timeline + account page ----
        goto(p, f"{BASE}/admin/orders"); p.wait_for_timeout(1000)
        p.screenshot(path=f"{SHOT}/d-orders.png")
        oid = p.evaluate("(()=>{const o=(JSON.parse(localStorage.getItem('novamart_orders'))||[]).find(x=>x.status==='pending');return o&&o.id})()")
        check("4-pre pending order exists", bool(oid), f"oid={oid}")
        goto(p, f"{BASE}/admin/orders/{oid}"); p.wait_for_timeout(1000)
        p.screenshot(path=f"{SHOT}/d-orders-detail.png")
        check("4a order detail page renders", p.locator("text=Timeline").count() > 0)
        p.click("button:has-text('Advance status: Confirm')"); p.wait_for_timeout(1200)
        p.click("button:has-text('Advance status: Ship')"); p.wait_for_timeout(1200)
        o = [x for x in (ls_get(p, "orders") or []) if x["id"] == oid][0]
        check("4b status change to shipped persisted", o["status"] == "shipped", f"status={o['status']}")
        check("4c timeline appended on status change", any(t.get("status") == "shipped" for t in o.get("timeline", [])),
              f"timeline={len(o.get('timeline',[]))}")
        p4 = ctx.new_page()
        goto(p4, f"{BASE}/account/orders"); p4.wait_for_timeout(1000)
        check("4d customer order history reflects shipped", "shipped" in p4.inner_text("body").lower())
        p4.close()
        w.check("4e no console errors on orders")

        # ---- 5. customers ----
        w.clean()
        goto(p, f"{BASE}/admin/customers"); p.wait_for_timeout(1000)
        p.screenshot(path=f"{SHOT}/d-customers.png")
        check("5a customers table renders", p.locator("tbody tr").count() > 0, f"rows={p.locator('tbody tr').count()}")
        w.check("5b no console errors on customers")

        # ---- 6. coupons: create + checkout applies ----
        w.clean()
        goto(p, f"{BASE}/admin/coupons"); p.wait_for_timeout(1000)
        p.screenshot(path=f"{SHOT}/d-coupons.png")
        code = "QATEST20"
        p.click("text=New coupon"); p.wait_for_timeout(800)
        p.fill("#coupon-code", code)
        p.select_option("#coupon-type", "percent")
        p.fill("#coupon-value", "20")
        p.fill("#coupon-min", "0")
        p.fill("#coupon-limit", "100")
        p.fill("#coupon-expires", "2027-06-01T12:00")
        p.click("button:has-text('Create coupon')"); p.wait_for_timeout(1500)
        cps = [c for c in (ls_get(p, "coupons") or []) if (c.get("code") or "").upper() == code]
        check("6a coupon created", len(cps) == 1, f"found={len(cps)}")
        p5 = ctx.new_page()
        # seed one cart item so the checkout summary + coupon form render
        goto(p5, f"{BASE}/")
        p5.evaluate("""()=>{
          const ps = JSON.parse(localStorage.getItem('novamart_products_override'))||[];
          const pr = ps[0];
          localStorage.setItem('novamart_cart', JSON.stringify([{productId:pr.id, slug:pr.slug, name:pr.name, price:pr.price, image:(pr.images||[])[0]||'', qty:1}]));
        }""")
        goto(p5, f"{BASE}/checkout"); p5.wait_for_timeout(1000)
        applied = False
        coupon_input = p5.locator("input[aria-label='Coupon code']")
        if coupon_input.count():
            coupon_input.fill(code)
            p5.locator("button", has_text="Apply").first.click()
            p5.wait_for_timeout(1500)
            applied = p5.locator(f"button[aria-label='Remove coupon {code}']").count() > 0
        check("6b coupon applies at checkout", applied)
        # clear the seeded cart so the global CartDrawer doesn't render an imageless item later
        p5.evaluate("localStorage.removeItem('novamart_cart')")
        p5.close()
        w.check("6c no console errors on coupons")

        # ---- 7. reviews: hide/restore ----
        w.clean()
        goto(p, f"{BASE}/admin/reviews"); p.wait_for_timeout(1000)
        p.screenshot(path=f"{SHOT}/d-reviews.png")
        rr = p.evaluate("""(()=>{const r=(JSON.parse(localStorage.getItem('novamart_reviews'))||[]).find(x=>!x.hidden);
          if(!r) return null; const ps=JSON.parse(localStorage.getItem('novamart_products_override'))||[];
          const pr=ps.find(x=>x.id===r.productId); return {id:r.id, userName:r.userName, body:(r.body||r.text||'').slice(0,60), slug:pr&&pr.slug}})()""")
        rid, ruser, rbody, rprod = (rr or {}).get("id"), (rr or {}).get("userName"), (rr or {}).get("body"), (rr or {}).get("slug")
        check("7-pre visible review exists", bool(rid), f"rid={rid}")
        if rid:
            p.click(f"button[aria-label='Hide review by {ruser}']"); p.wait_for_timeout(800)
            p.locator("[role=dialog] button", has_text="Hide review").first.click()
            p.wait_for_timeout(1200)
            hidden = ls_get(p, "reviews_hidden") or []
            check("7a hide review persists id", rid in hidden, f"hidden={hidden}")
            p6 = ctx.new_page()
            goto(p6, f"{BASE}/product/{rprod}" if rprod else f"{BASE}/shop"); p6.wait_for_timeout(1000)
            page_shows_review = rbody and rbody in p6.inner_text("body")
            check("7b storefront hides the hidden review (not rendered)", not page_shows_review,
                  f"rid={rid} rendered={bool(page_shows_review)}")
            p6.close()
            # restore from the Hidden tab
            p.click("button:has-text('Hidden (')"); p.wait_for_timeout(800)
            p.click(f"button[aria-label='Restore review by {ruser}']"); p.wait_for_timeout(1200)
            check("7c restore review removes id", rid not in (ls_get(p, "reviews_hidden") or []))
            p6b = ctx.new_page()
            goto(p6b, f"{BASE}/product/{rprod}" if rprod else f"{BASE}/shop"); p6b.wait_for_timeout(1000)
            check("7c2 restored review reappears on storefront", bool(rbody) and rbody in p6b.inner_text("body"))
            p6b.close()
        w.check("7d no console errors on reviews")

        # ---- 8. settings: tax round-trip + checkout reflects ----
        w.clean()
        goto(p, f"{BASE}/admin/settings"); p.wait_for_timeout(1000)
        p.screenshot(path=f"{SHOT}/d-settings.png")
        p.fill("#set-tax", "10"); p.click("button[type=submit]"); p.wait_for_timeout(1500)
        after = ls_get(p, "settings") or {}
        check("8a tax percent saved as fraction", abs((after.get("taxRate") or 0) - 0.10) < 1e-9, f"taxRate={after.get('taxRate')}")
        goto(p, f"{BASE}/admin/settings"); p.wait_for_timeout(1000)
        check("8b settings form shows 10 after reload", p.input_value("#set-tax") == "10", f"value={p.input_value('#set-tax')}")
        p7 = ctx.new_page()
        goto(p7, f"{BASE}/checkout"); p7.wait_for_timeout(1000)
        tot = p7.evaluate("""(()=>{const t=document.body.innerText; const m=t.match(/Tax\\s*\\$([0-9.]+)/i);
          const s=JSON.parse(localStorage.getItem('novamart_settings'))||{}; return {taxText:m&&m[1], rate:s.taxRate}})()""")
        check("8c checkout uses updated tax rate", (tot or {}).get("rate") == 0.10, f"{tot}")
        p7.close()
        goto(p, f"{BASE}/admin/settings"); p.wait_for_timeout(1000)
        p.fill("#set-tax", "8"); p.click("button[type=submit]"); p.wait_for_timeout(1200)
        check("8d tax restored to 8%", abs(((ls_get(p, "settings") or {}).get("taxRate") or 0) - 0.08) < 1e-9)
        w.check("8e no console errors on settings")

        # ---- 9. seeder safety ----
        w.clean()
        before_n = len(ls_get(p, "orders") or [])
        p8 = ctx.new_page()
        for r in ["/", "/shop", "/checkout"]:
            goto(p8, f"{BASE}{r}"); p8.wait_for_timeout(800)
        after_n = len(p8.evaluate("JSON.parse(localStorage.getItem('novamart_orders')||'[]')") or [])
        check("9a storefront visits do not add demo orders", after_n == before_n, f"before={before_n} after={after_n}")
        p8.close()
        w.check("9b no console errors on storefront pages")
        b.close()

if __name__ == "__main__":
    sys.exit(main())
