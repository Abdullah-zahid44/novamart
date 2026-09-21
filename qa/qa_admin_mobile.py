"""NovaMart admin QA — mobile 390x844, Firefox (Chromium is LNA-blocked on localhost).
Run: python3 ~/workspace/ecommerce-site/qa/qa_admin_mobile.py
Same-browser-context admin edits + storefront reflection (localStorage).
Any console error or page error = FAIL for that check. Also checks mobile layout:
sidebar drawer, no horizontal overflow, tables scroll horizontally."""
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
    def check(self, name):
        ce = self.console_errors
        pe = self.page_errors
        if ce or pe:
            results.append(("FAIL", name, f"console={ce} page={pe}")); return False
        results.append(("PASS", name, "")); return True
    def clean(self):
        self.console_errors.clear(); self.page_errors.clear()

def check(name, cond, detail=""):
    results.append(("PASS" if cond else "FAIL", name, detail))

def goto(page, url, tries=4):
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

def layout_checks(page, name):
    overflow = page.evaluate("()=>document.documentElement.scrollWidth - document.documentElement.clientWidth")
    check(f"{name}: no page-level horizontal overflow", (overflow or 0) <= 1, f"overflow={overflow}px")
    if page.locator("table").count():
        scrollable = page.evaluate("""()=>{
          const t=document.querySelector('table');
          if(!t) return true;
          let el=t.parentElement, ok=false, depth=0;
          while(el && depth<6){ const s=getComputedStyle(el);
            if((s.overflowX==='auto'||s.overflowX==='scroll') && el.scrollWidth>el.clientWidth+1){ok=true;break;}
            el=el.parentElement; depth++; }
          const pageOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
          return ok || pageOverflow<=1;
        }""")
        check(f"{name}: table scrolls horizontally or fits", bool(scrollable))

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
    print(f"\n===== MOBILE QA: {len(results)-len(fails)}/{len(results)} passed =====", flush=True)
    for s, n, d in results:
        print(f"[{s}] {n}" + (f" — {d}" if d else ""), flush=True)
    return 0 if not fails else 1

def _run():
    with sync_playwright() as pw:
        b = pw.firefox.launch(headless=True)
        ctx = b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        p = ctx.new_page()
        w = Watcher(p)

        # logged-out login screenshot in an isolated context (shares nothing with main ctx)
        ctx0 = b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        p0 = ctx0.new_page()
        goto(p0, f"{BASE}/admin/login"); p0.wait_for_timeout(800)
        p0.screenshot(path=f"{SHOT}/m-login.png")
        check("m2-login: login renders content", p0.locator("#email").count() > 0)
        ctx0.close()

        login(p)
        check("m1 login works on mobile", "Mission control" in p.inner_text("body")[:4000], f"url={p.url}")

        routes = [
            ("admin", f"{BASE}/admin", "m-admin.png", "dashboard"),
            ("products", f"{BASE}/admin/products", "m-products.png", "products"),
            ("products/new", f"{BASE}/admin/products/new", "m-products-new.png", "product form"),
            ("orders", f"{BASE}/admin/orders", "m-orders.png", "orders"),
            ("customers", f"{BASE}/admin/customers", "m-customers.png", "customers"),
            ("coupons", f"{BASE}/admin/coupons", "m-coupons.png", "coupons"),
            ("reviews", f"{BASE}/admin/reviews", "m-reviews.png", "reviews"),
            ("settings", f"{BASE}/admin/settings", "m-settings.png", "settings"),
        ]
        for slug, url, shot, label in routes:
            w.clean()
            goto(p, url); p.wait_for_timeout(1000)
            p.screenshot(path=f"{SHOT}/{shot}")
            body = p.inner_text("body")
            check(f"m2-{slug}: {label} renders content", len(body) > 200 and "/admin/login" not in p.url,
                  f"chars={len(body)} url={p.url}")
            layout_checks(p, f"m3-{slug}")
            w.check(f"m4-{slug}: no console/page errors")

        # drawer navigation on mobile
        w.clean()
        goto(p, f"{BASE}/admin"); p.wait_for_timeout(1000)
        menu_btn = p.locator("button[aria-label='Open navigation']").first
        if menu_btn.count():
            menu_btn.click(); p.wait_for_timeout(800)
            p.screenshot(path=f"{SHOT}/m-drawer.png")
            drawer_visible = p.locator("aside.w-72:visible").count() > 0
            check("m6 mobile nav drawer opens", drawer_visible)
            link = p.locator("nav a[href='/admin/orders']:visible").first
            if link.count():
                link.click(); p.wait_for_timeout(2000)
                check("m7 drawer link navigates to orders", "/admin/orders" in p.url, f"url={p.url}")
            else:
                check("m7 drawer link navigates to orders", False, "no orders link in drawer")
        else:
            check("m6 mobile nav drawer opens", False, "no menu button found")
            p.screenshot(path=f"{SHOT}/m-drawer.png")
        w.check("m8 no errors during mobile nav")

        # one product edit page + one order detail page on mobile
        goto(p, f"{BASE}/admin/products"); p.wait_for_timeout(1000)
        pid = p.evaluate("()=>{const a=document.querySelector(\"a[aria-label^='Edit ']\");return a?a.href.split('/').pop():null}")
        if pid:
            w.clean(); goto(p, f"{BASE}/admin/products/{pid}"); p.wait_for_timeout(1000)
            p.screenshot(path=f"{SHOT}/m-products-edit.png")
            check("m9 product edit renders on mobile", p.locator("#pf-name").count() > 0)
            layout_checks(p, "m9-edit")
            w.check("m9b no errors on product edit")
        oid = p.evaluate("()=>{const o=(JSON.parse(localStorage.getItem('novamart_orders'))||[])[0];return o&&o.id}")
        if oid:
            w.clean(); goto(p, f"{BASE}/admin/orders/{oid}"); p.wait_for_timeout(1000)
            p.screenshot(path=f"{SHOT}/m-orders-detail.png")
            check("m10 order detail renders on mobile", p.locator("text=Timeline").count() > 0)
            layout_checks(p, "m10-detail")
            w.check("m10b no errors on order detail")
        b.close()

if __name__ == "__main__":
    sys.exit(main())
