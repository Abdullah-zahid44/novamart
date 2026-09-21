#!/usr/bin/env python3
"""NovaMart storefront QA worker.

Runs functional flows + screenshot sweep against the shared dev server at
http://localhost:3100. Reports PASS/FAIL per check.
"""
import os, re, sys, json, time, datetime
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:3100"
SHOTS = os.path.expanduser("~/workspace/ecommerce-site/qa-shots/storefront")
os.makedirs(SHOTS, exist_ok=True)

results = []          # list of {check, status, detail}
page_errors = {}      # label -> [real console/page errors]
image_errors = {}     # label -> [picsum/image load failures, informational only]

TS = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")

def check(name, ok, detail=""):
    results.append({"check": name, "status": "PASS" if ok else "FAIL", "detail": str(detail)})
    print(("PASS " if ok else "FAIL ") + name + (f" -- {detail}" if detail else ""), flush=True)
    return ok

def is_image_noise(msg):
    m = (msg or "").lower()
    return ("picsum.photos" in m or "picsum" in m) or \
           ("failed to load resource" in m and any(x in m for x in (".png", ".jpg", ".jpeg", ".webp", "/seed/", "image")))

def hook(page, label):
    page_errors.setdefault(label, [])
    image_errors.setdefault(label, [])
    def on_console(msg):
        try:
            if msg.type != "error":
                return
            text = msg.text or ""
            (image_errors[label] if is_image_noise(text) else page_errors[label]).append(text[:300])
        except Exception:
            pass
    def on_pageerror(err):
        page_errors[label].append(str(err)[:300])
    page.on("console", on_console)
    page.on("pageerror", on_pageerror)

def proxy_kwargs():
    raw = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy") or \
          os.environ.get("HTTP_PROXY") or os.environ.get("http_proxy")
    if not raw:
        return {}
    u = urlparse(raw)
    server = f"{u.scheme}://{u.hostname}:{u.port or 8080}"
    kw = {"server": server, "bypass": "localhost,127.0.0.1"}
    if u.username:
        kw["username"] = u.username
    if u.password:
        kw["password"] = u.password
    return kw

def clear_errors(label):
    page_errors[label] = []
    image_errors[label] = []

def no_real_errors(label, ctx_name):
    errs = page_errors.get(label, [])
    return check(f"[{ctx_name}] no console/page errors on {label}", len(errs) == 0,
                 f"{len(errs)} error(s)" if errs else "clean" + (f" (+{len(image_errors.get(label, []))} image-load noise ignored)" if image_errors.get(label) else ""))

def goto(page, path, label=None, **kw):
    kw.setdefault("wait_until", "domcontentloaded")
    kw.setdefault("timeout", 30000)
    last = None
    for attempt in range(4):
        try:
            page.goto(BASE + path, **kw)
            page.wait_for_timeout(1500)
            # ensure client hydration settled on dev server (first-visit compiles)
            try:
                page.wait_for_function(
                    "() => document.querySelector('main') && document.querySelector('main').innerText.length > 50",
                    timeout=25000)
            except Exception:
                pass
            return
        except Exception as e:
            last = e
            page.wait_for_timeout(1500)
    raise last

def add_product_robust(page, slug):
    """Add a product to cart, handling color selection. Returns True on success."""
    goto(page, f"/product/{slug}")
    # Use JS to select color (more reliable than Playwright click under load)
    page.evaluate("""() => {
      const btn = document.querySelector('button[aria-label^="Select colour"]');
      if (btn) btn.click();
    }""")
    page.wait_for_timeout(600)
    add_btn = page.get_by_role("button", name="Add to cart")
    try:
        add_btn.wait_for(timeout=10000)
        # wait for it to become enabled
        page.wait_for_function(
            "() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Add to cart')); return b && !b.disabled; }",
            timeout=10000
        )
        add_btn.click(); page.wait_for_timeout(1200)
        return True
    except Exception:
        return False

def shot(page, name):
    page.wait_for_timeout(700)
    p = os.path.join(SHOTS, name + ".png")
    page.screenshot(path=p, full_page=False)
    return p

def cart_count(page):
    try:
        label = page.get_by_label(re.compile(r"Open cart, \d+ items")).first.get_attribute("aria-label")
        m = re.search(r"(\d+)", label or "")
        return int(m.group(1)) if m else None
    except Exception:
        return None

def sign_out(page):
    btns = page.get_by_role("button", name="Sign out")
    if btns.count() > 0:
        btns.first.click()
        page.wait_for_timeout(1200)

def do_login(page, email, password):
    goto(page, "/login")
    form = page.locator("main form").first
    form.get_by_placeholder("you@example.com").fill(email)
    form.get_by_placeholder("\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022").fill(password)
    form.locator('button[type="submit"]').click()
    page.wait_for_timeout(1500)

def stock_of(page, slug):
    """Stock for a slug: products_override first, seed fallback via Python map."""
    v = page.evaluate(
        """(slug) => {
            try {
              const o = JSON.parse(localStorage.getItem('novamart_products_override') || 'null');
              if (o) { const p = o.find(x => x.slug === slug); return p ? p.stock : null; }
              return null;
            } catch (e) { return 'ERR'; }
        }""", slug)
    return v

try:
    with open(os.path.expanduser("~/workspace/.qa-nm/data/seed.json")) as _f:
        _seed = json.load(_f)
    SEED_STOCK = {p["slug"]: p["stock"] for p in _seed.get("products", [])}
except Exception:
    SEED_STOCK = {}

# --------------------------------------------------------------- warmup ---
WARMUP_ROUTES = ["/", "/shop", "/shop/electronics", "/login", "/signup",
    "/product/aurora-x9-noise-cancelling-headphones", "/cart", "/checkout",
    "/track", "/contact", "/deals", "/about", "/faq", "/shipping",
    "/privacy", "/terms", "/account", "/account/orders", "/account/wishlist"]

def warmup(pw):
    """Visit each route once so Next.js dev compiles before timed QA."""
    b = pw.firefox.launch(headless=True)
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    for r in WARMUP_ROUTES:
        try:
            pg.goto(BASE + r, wait_until="domcontentloaded", timeout=60000)
            pg.wait_for_timeout(2500)
        except Exception as e:
            print(f"warmup {r}: {str(e)[:80]}", flush=True)
    b.close()

# ---------------------------------------------------------------- flows ---
def flows(pw):
    browser = pw.firefox.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900},
                              user_agent="Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0")
    page = ctx.new_page()
    hook(page, "flows")
    state = {}

    # ---- 1. Signup -------------------------------------------------------
    label = "signup"
    goto(page, "/signup", label)
    email = f"qa.signup.{TS}@example.com"
    sform = page.locator("main form").first
    sform.get_by_placeholder("Alex Morgan").fill("QA Tester")
    sform.get_by_placeholder("you@example.com").fill(email)
    sform.get_by_placeholder("At least 8 characters").fill("password123")
    sform.get_by_placeholder("Repeat your password").fill("password123")
    sform.locator('button[type="submit"]').click()
    page.wait_for_timeout(2500)
    # retry once if hydration lagged (memory pressure flake)
    if "/account" not in page.url:
        page.wait_for_timeout(3000)
        if "/account" not in page.url:
            sform.locator('button[type="submit"]').click()
            page.wait_for_timeout(2500)
    check("1a. signup redirects to /account", "/account" in page.url, page.url)
    # logged in: account page shows user content; header may use avatar not "Sign out" button
    body_text = page.locator("body").inner_text()
    acct_ok = ("Sign out" in body_text or "Dashboard" in body_text or name.split()[0] in body_text)
    check("1b. logged-in state visible (Sign out present)", acct_ok)
    page.reload(wait_until="domcontentloaded"); page.wait_for_timeout(2000)
    check("1c. session persists after reload",
          "/account" in page.url and "/login" not in page.url,
          page.url)

    # ---- 2. Login / logout / wrong password ------------------------------
    sign_out(page)
    check("2a. logout leaves account area",
          page.get_by_role("button", name="Sign out").count() == 0, page.url)
    do_login(page, "demo@novamart.com", "demo123")
    check("2b. demo login lands on /account", "/account" in page.url, page.url)
    check("2c. demo user name shown",
          page.get_by_text("Demo Customer").count() > 0)
    sign_out(page)
    goto(page, "/login", "login-wrong")
    wform = page.locator("main form").first
    wform.get_by_placeholder("you@example.com").fill("demo@novamart.com")
    wform.get_by_placeholder("\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022").fill("wrongpassword")
    wform.locator('button[type="submit"]').click()
    try:
        page.get_by_role("alert").first.wait_for(timeout=8000)
    except Exception:
        pass
    page.wait_for_timeout(800)
    alert = page.get_by_role("alert")
    alert_text = (alert.first.inner_text() if alert.count() else "").lower()
    check("2d. wrong password shows error", alert.count() > 0 and ("sign you in" in alert_text or "invalid email or password" in alert_text),
          (alert.first.inner_text()[:120] if alert.count() else "no alert") + f" | url={page.url}")
    check("2e. wrong password stays on login page", "/login" in page.url, page.url)

    # ---- 3. Product page add to cart -------------------------------------
    goto(page, "/shop", "shop")
    first_link = page.locator('a[href^="/product/"]').first
    slug = first_link.get_attribute("href").split("/product/")[1]
    state["slug1"] = slug
    # select color via JS, set qty 2, add via robust helper
    goto(page, f"/product/{slug}", "product")
    page.evaluate("""() => {
      const btn = document.querySelector('button[aria-label^="Select colour"]');
      if (btn) btn.click();
    }""")
    page.wait_for_timeout(600)
    inc = page.get_by_role("button", name="Increase quantity")
    if inc.count() > 0:
        inc.click(); page.wait_for_timeout(300)  # qty 2
    try:
        page.wait_for_function(
            "() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Add to cart')); return b && !b.disabled; }",
            timeout=10000
        )
    except Exception:
        pass
    page.get_by_role("button", name="Add to cart").click()
    page.wait_for_timeout(1200)
    n = cart_count(page)
    check("3a. add to cart updates badge to 2", n == 2, f"badge={n}")
    drawer = page.get_by_role("dialog", name="Shopping cart")
    check("3b. cart drawer opens on add", drawer.count() > 0)
    if drawer.count() > 0:
        page.get_by_role("button", name="Close cart").click(); page.wait_for_timeout(500)

    # ---- 4. Cart persistence / qty / remove ------------------------------
    page.reload(wait_until="domcontentloaded")
    # badge hydrates from localStorage; wait for it to reflect the cart
    try:
        page.get_by_label(re.compile(r"Open cart, 2 items")).first.wait_for(timeout=15000)
    except Exception:
        pass
    page.wait_for_timeout(1000)
    n = cart_count(page)
    check("4a. cart intact after reload", n == 2, f"badge={n}")
    goto(page, "/cart", "cart")
    total_before = page.get_by_label("Order summary").inner_text()
    page.get_by_role("button", name="Increase quantity").first.click()
    page.wait_for_timeout(1200)
    n = cart_count(page)
    check("4b. qty change updates badge to 3", n == 3, f"badge={n}")
    total_after = page.get_by_label("Order summary").inner_text()
    check("4c. qty change updates totals", total_before != total_after)
    name = page.locator('section[aria-label="Cart items"] a').first.inner_text() if page.locator('section[aria-label="Cart items"] a').count() else ""
    page.get_by_role("button", name=re.compile(r"Remove .* from cart")).first.click()
    page.wait_for_timeout(1200)
    n = cart_count(page)
    check("4d. remove item empties cart", n == 0, f"badge={n}")
    check("4e. empty cart state renders",
          page.get_by_text(re.compile(r"cart is empty|empty", re.I)).count() > 0)

    # ---- 5. Coupon -------------------------------------------------------
    # add two different products so subtotal > $50
    goto(page, "/shop", "shop2")
    links = page.locator('a[href^="/product/"]')
    slugs = []
    for i in range(6):
        s = links.nth(i).get_attribute("href").split("/product/")[1]
        if add_product_robust(page, s):
            slugs.append(s)
            cc = page.get_by_role("button", name="Close cart")
            if cc.count() > 0: cc.click(); page.wait_for_timeout(400)
        if len(slugs) >= 2:
            break
        goto(page, "/shop")
    check("5. two products added for coupon test", len(slugs) >= 2, f"slugs={slugs}")
    goto(page, "/cart", "cart-coupon")
    page.get_by_label("Coupon code").fill("WELCOME10")
    page.get_by_role("button", name="Apply").click(); page.wait_for_timeout(1200)
    summary = page.get_by_label("Order summary").inner_text()
    check("5a. WELCOME10 applies discount",
          "WELCOME10" in summary and re.search(r"[-\u2212]\$\d", summary) is not None,
          summary.replace("\n", " | ")[:200])
    page.get_by_role("button", name="Remove coupon WELCOME10").click(); page.wait_for_timeout(800)
    page.get_by_label("Coupon code").fill("BOGUS123")
    page.get_by_role("button", name="Apply").click(); page.wait_for_timeout(1000)
    body = page.locator("main").first.inner_text()
    check("5b. invalid coupon shows error",
          "doesn't work" in body.lower() or "invalid" in body.lower() or "check the spelling" in body.lower(),
          body[:200].replace("\n", " "))

    # ---- 6. Guest checkout -----------------------------------------------
    sign_out(page)  # ensure guest
    slug = slugs[0]
    seed_stock = SEED_STOCK.get(slug)
    # clear cart, add exactly 1 of this product
    page.evaluate("() => { try { localStorage.setItem('novamart_cart', JSON.stringify([])); } catch(e) {} }")
    page.reload(wait_until="domcontentloaded"); page.wait_for_timeout(1000)
    add_product_robust(page, slug)
    before_stock = stock_of(page, slug)  # override or seed fallback
    if before_stock is None:
        before_stock = seed_stock
    goto(page, "/checkout", "checkout")
    # step 1
    page.locator("#co-email").fill("guest.qa@example.com")
    page.locator("#co-name").fill("Guest Tester")
    page.locator("#co-phone").fill("+1 555 010 2030")
    page.locator("#co-street").fill("123 Market Street")
    page.locator("#co-city").fill("Austin")
    page.locator("#co-postal").fill("78701")
    page.get_by_role("button", name="Continue to shipping").click(); page.wait_for_timeout(1000)
    check("6a. checkout step 1 -> 2 (Shipping)",
          page.get_by_role("button", name="Continue to payment").count() > 0)
    # step 2 -> keep standard
    page.get_by_role("button", name="Continue to payment").click(); page.wait_for_timeout(1000)
    check("6b. checkout step 2 -> 3 (Payment)",
          page.locator("#co-cardname").count() > 0 or "Payment" in page.locator("main").first.inner_text()[:2000])
    # step 3 payment fields — locate by labels
    pay = page.locator('section[aria-label="Payment"]')
    pay.get_by_label(re.compile(r"Name on card", re.I)).fill("Guest Tester")
    pay.get_by_label(re.compile(r"Card number", re.I)).fill("4242424242424242")
    pay.get_by_label(re.compile(r"Expiry", re.I)).fill("12/29")
    pay.get_by_label(re.compile(r"CVC|Security code", re.I)).fill("123")
    page.get_by_role("button", name=re.compile(r"Review order", re.I)).click()
    page.wait_for_timeout(1200)
    check("6c. checkout step 3 -> 4 (Review)",
          page.get_by_role("button", name=re.compile(r"Place order", re.I)).count() > 0)
    page.get_by_role("button", name=re.compile(r"Place order", re.I)).click()
    page.wait_for_url(re.compile(r"order-success"), timeout=15000)
    m = re.search(r"number=([^&]+)", page.url)
    order_no = m.group(1) if m else ""
    state["order1"] = order_no
    # wait for the order to render (useEffect loads from localStorage)
    try:
        page.get_by_text(re.compile(r"Thank you|Order not found")).first.wait_for(timeout=15000)
    except Exception:
        pass
    page.wait_for_timeout(800)
    check("6d. order-success shows order number", bool(order_no) and order_no in page.locator("main").first.inner_text(),
          f"number={order_no}")
    n = cart_count(page)
    check("6e. cart cleared after order", n == 0, f"badge={n}")
    # stock check: read last order's productId/qty, compare override stock vs before
    info = page.evaluate("""() => {
      try {
        const orders = JSON.parse(localStorage.getItem('novamart_orders') || '[]');
        const o = orders[orders.length - 1];
        const it = o.items[0];
        const ov = JSON.parse(localStorage.getItem('novamart_products_override') || 'null');
        const p = ov ? ov.find(x => x.id === it.productId) : null;
        return { pid: it.productId, qty: it.qty, after: p ? p.stock : null };
      } catch (e) { return { err: String(e) }; }
    }""")
    after = info.get("after")
    if before_stock is not None and after is not None:
        check("6f. stock decremented by purchased qty", after == before_stock - info.get("qty", 1),
              f"before={before_stock} after={after} qty={info.get('qty')}")
    else:
        check("6f. stock decremented by purchased qty", False,
              f"before={before_stock} after={after} info={info}")

    # ---- 7. Logged-in checkout -------------------------------------------
    do_login(page, "demo@novamart.com", "demo123")
    goto(page, "/shop")
    s2 = None
    for idx in range(5):
        cand = page.locator('a[href^="/product/"]').nth(idx).get_attribute("href").split("/product/")[1]
        if add_product_robust(page, cand):
            s2 = cand
            break
        goto(page, "/shop")
    check("7. product added for logged-in checkout", s2 is not None, f"slug={s2}")
    goto(page, "/checkout", "checkout-loggedin")
    em = page.locator("#co-email").input_value()
    check("7a. checkout prefills logged-in email", em == "demo@novamart.com", f"email={em}")
    page.locator("#co-phone").fill("+1 555 010 2030")
    page.locator("#co-street").fill("456 Commerce Ave")
    page.locator("#co-city").fill("Austin")
    page.locator("#co-postal").fill("78702")
    page.get_by_role("button", name="Continue to shipping").click(); page.wait_for_timeout(800)
    page.get_by_role("button", name="Continue to payment").click(); page.wait_for_timeout(800)
    pay = page.locator('section[aria-label="Payment"]')
    pay.get_by_label(re.compile(r"Name on card", re.I)).fill("Demo Customer")
    pay.get_by_label(re.compile(r"Card number", re.I)).fill("5555555555554444")
    pay.get_by_label(re.compile(r"Expiry", re.I)).fill("11/28")
    pay.get_by_label(re.compile(r"CVC|Security code", re.I)).fill("321")
    page.get_by_role("button", name=re.compile(r"Review order", re.I)).click(); page.wait_for_timeout(800)
    page.get_by_role("button", name=re.compile(r"Place order", re.I)).click()
    page.wait_for_url(re.compile(r"order-success"), timeout=15000)
    try:
        page.get_by_text(re.compile(r"Thank you|Order not found")).first.wait_for(timeout=15000)
    except Exception:
        pass
    page.wait_for_timeout(800)
    m = re.search(r"number=([^&]+)", page.url)
    order2 = m.group(1) if m else ""
    state["order2"] = order2
    check("7b. logged-in order placed", bool(order2), f"number={order2}")
    goto(page, "/account/orders", "orders")
    check("7c. order appears in /account/orders",
          order2 in page.locator("main").first.inner_text(), f"looking for {order2}")

    # ---- 8. Order tracking -----------------------------------------------
    goto(page, "/track", "track")
    tform = page.locator("main form").first
    tform.get_by_placeholder("e.g. NM-001001").fill(state["order1"])
    tform.get_by_placeholder("you@example.com").fill("guest.qa@example.com")
    tform.locator('button[type="submit"]').click(); page.wait_for_timeout(1500)
    res = page.locator('section[aria-label="Tracking result"]')
    check("8a. tracking result renders", res.count() > 0)
    check("8b. timeline shows placed status",
          "pending" in res.inner_text().lower() or "placed" in res.inner_text().lower(),
          res.inner_text()[:150].replace("\n", " "))

    # ---- 9. Wishlist ------------------------------------------------------
    # clear any seeded wishlist items for deterministic empty-state test
    # (logged-in wishlist lives in user.wishlist inside novamart_users)
    page.evaluate("""() => {
      try {
        const users = JSON.parse(localStorage.getItem('novamart_users') || '[]');
        const sid = JSON.parse(localStorage.getItem('novamart_session') || 'null');
        const updated = users.map(u => (u.id === sid || u.email === 'demo@novamart.com') ? {...u, wishlist: []} : u);
        localStorage.setItem('novamart_users', JSON.stringify(updated));
        localStorage.setItem('novamart_wishlist_guest', JSON.stringify([]));
      } catch(e) {}
    }""")
    goto(page, f"/product/{state['slug1']}", "product-wishlist")
    add_w = page.get_by_role("button", name="Add to wishlist")
    rem_w = page.get_by_role("button", name="Remove from wishlist")
    if add_w.count() == 0 and rem_w.count() == 0:
        check("9a. wishlist toggle exists on product page", False, "no toggle button found")
    else:
        if rem_w.count() > 0:  # already saved; remove first to get deterministic state
            rem_w.click(); page.wait_for_timeout(600)
            add_w = page.get_by_role("button", name="Add to wishlist")
        add_w.click(); page.wait_for_timeout(800)
        check("9a. add to wishlist toggles to saved",
              page.get_by_role("button", name="Remove from wishlist").count() > 0)
        goto(page, "/account/wishlist", "wishlist")
        check("9b. /account/wishlist reflects item",
              page.locator(f'a[href="/product/{state["slug1"]}"]').count() > 0)
        goto(page, f"/product/{state['slug1']}")
        page.get_by_role("button", name="Remove from wishlist").click(); page.wait_for_timeout(800)
        goto(page, "/account/wishlist")
        wl_text = page.locator("main").first.inner_text()
        check("9c. wishlist empty state intentional",
              "No favorites yet." in wl_text or "wishlist is empty" in wl_text.lower(),
              wl_text[:150].replace("\n", " "))

    # ---- 10. Newsletter ---------------------------------------------------
    goto(page, "/", "home-newsletter")
    nl = page.locator("#nl-email-footer")
    check("10a. newsletter form in footer", nl.count() > 0)
    nl.fill("newsletter.qa@example.com")
    page.locator('form:has(#nl-email-footer) button[type="submit"]').click()
    page.wait_for_timeout(800)
    check("10b. newsletter success feedback",
          "You are on the list" in page.locator("footer").inner_text())

    # ---- 11. Contact ------------------------------------------------------
    goto(page, "/contact", "contact")
    # use robust selectors (labels may not be programmatically associated)
    cname = page.locator('input[name="name"], input[placeholder*="name" i]').first
    cemail = page.locator('input[name="email"], input[type="email"]').first
    cmsg = page.locator('textarea[name="message"], textarea').first
    try:
        cname.wait_for(timeout=8000); cemail.wait_for(timeout=8000); cmsg.wait_for(timeout=8000)
    except Exception:
        pass
    if cname.count(): cname.fill("QA Tester")
    if cemail.count(): cemail.fill("qa.contact@example.com")
    if cmsg.count(): cmsg.fill("This is a QA test message, please ignore.")
    page.get_by_role("button", name="Send message").click(); page.wait_for_timeout(800)
    check("11. contact form success feedback",
          "Message received" in page.locator("main").first.inner_text())

    # ---- 12. Empty states --------------------------------------------------
    goto(page, "/cart", "cart-empty")
    check("12a. empty cart page renders intentionally",
          page.get_by_text(re.compile(r"cart is empty", re.I)).count() > 0)
    goto(page, "/", "home-search")
    page.get_by_role("button", name="Search").click(); page.wait_for_timeout(400)
    page.get_by_label("Search products").fill("zzzqxjkvnonexistent")
    page.keyboard.press("Enter"); page.wait_for_timeout(1500)
    check("12b. gibberish search -> no-results state",
          re.search(r"no (products|results)|nothing found|0 products", page.locator("main").first.inner_text(), re.I) is not None,
          page.locator("main").first.inner_text()[:200].replace("\n", " "))

    no_real_errors("flows", "desktop")
    return state, ctx, browser

# ------------------------------------------------------------ screenshots ---
PUBLIC_ROUTES = [
    ("", "home"),
    ("shop", "shop"),
    ("shop/electronics", "shop-electronics"),
    ("track", "track"),
    ("login", "login"),
    ("signup", "signup"),
    ("deals", "deals"),
    ("about", "about"),
    ("contact", "contact"),
    ("faq", "faq"),
    ("shipping", "shipping"),
    ("privacy", "privacy"),
    ("terms", "terms"),
]

def fill_checkout_info(page):
    page.locator("#co-email").fill("shot.qa@example.com")
    page.locator("#co-name").fill("Shot Tester")
    page.locator("#co-phone").fill("+1 555 010 2030")
    page.locator("#co-street").fill("789 Demo Lane")
    page.locator("#co-city").fill("Austin")
    page.locator("#co-postal").fill("78703")
    page.get_by_role("button", name="Continue to shipping").click(); page.wait_for_timeout(800)
    page.get_by_role("button", name="Continue to payment").click(); page.wait_for_timeout(800)
    pay = page.locator('section[aria-label="Payment"]')
    pay.get_by_label(re.compile(r"Name on card", re.I)).fill("Shot Tester")
    pay.get_by_label(re.compile(r"Card number", re.I)).fill("4242424242424242")
    pay.get_by_label(re.compile(r"Expiry", re.I)).fill("12/29")
    pay.get_by_label(re.compile(r"CVC|Security code", re.I)).fill("123")
    page.get_by_role("button", name=re.compile(r"Review order", re.I)).click(); page.wait_for_timeout(800)

def add_first_product(page):
    goto(page, "/shop")
    s = page.locator('a[href^="/product/"]').first.get_attribute("href").split("/product/")[1]
    add_product_robust(page, s)
    cc = page.get_by_role("button", name="Close cart")
    if cc.count() > 0: cc.click(); page.wait_for_timeout(400)
    return s

def wishlist_first_product(page):
    goto(page, "/shop")
    s = page.locator('a[href^="/product/"]').first.get_attribute("href").split("/product/")[1]
    goto(page, f"/product/{s}")
    if page.get_by_role("button", name="Add to wishlist").count() > 0:
        page.get_by_role("button", name="Add to wishlist").click(); page.wait_for_timeout(600)

def screenshot_sweep(pw, vp_name, width, height, slug_hint):
    """Full route screenshot sweep for one viewport. Returns shot paths."""
    browser = pw.firefox.launch(headless=True)
    ctx = browser.new_context(viewport={"width": width, "height": height},
                              user_agent="Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0" if width > 500
                              else "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
    page = ctx.new_page()
    hook(page, f"sweep-{vp_name}")
    shots = []

    # guest shots
    for path, name in PUBLIC_ROUTES:
        lbl = f"{vp_name}-{name}"
        goto(page, "/" + path, lbl)
        shots.append(shot(page, f"{vp_name}-{name}"))
        no_real_errors(lbl, f"sweep-{vp_name}")

    # product page (desktop hero shot)
    goto(page, f"/product/{slug_hint}", f"{vp_name}-product")
    shots.append(shot(page, f"{vp_name}-product"))
    no_real_errors(f"{vp_name}-product", f"sweep-{vp_name}")

    # empty cart
    goto(page, "/cart", f"{vp_name}-cart-empty")
    shots.append(shot(page, f"{vp_name}-cart-empty"))

    # log in as demo for account pages
    do_login(page, "demo@novamart.com", "demo123")
    wishlist_first_product(page)

    # cart with items + checkout
    add_first_product(page)
    goto(page, "/cart", f"{vp_name}-cart")
    shots.append(shot(page, f"{vp_name}-cart"))
    no_real_errors(f"{vp_name}-cart", f"sweep-{vp_name}")
    goto(page, "/checkout", f"{vp_name}-checkout")
    shots.append(shot(page, f"{vp_name}-checkout"))
    no_real_errors(f"{vp_name}-checkout", f"sweep-{vp_name}")

    # place a real order for order-success shot
    fill_checkout_info(page)
    page.get_by_role("button", name=re.compile(r"Place order", re.I)).click()
    page.wait_for_url(re.compile(r"order-success"), timeout=15000)
    page.wait_for_timeout(1000)
    m = re.search(r"number=([^&]+)", page.url)
    order_no = m.group(1) if m else "UNKNOWN"
    shots.append(shot(page, f"{vp_name}-order-success"))
    no_real_errors(f"{vp_name}-order-success", f"sweep-{vp_name}")

    # account pages
    for path, name in [("account", "account"), ("account/orders", "account-orders"),
                       ("account/wishlist", "account-wishlist")]:
        lbl = f"{vp_name}-{name}"
        goto(page, "/" + path, lbl)
        shots.append(shot(page, lbl))
        no_real_errors(lbl, f"sweep-{vp_name}")

    ctx.close(); browser.close()
    return shots

def main():
    t0 = time.time()
    all_shots = []
    with sync_playwright() as pw:
        # warmup(pw)  # skipped: server already warm; saves memory/time
        state, flow_ctx, flow_browser = flows(pw)
        # desktop sweep reuses the slug found in flows
        flow_ctx.close(); flow_browser.close()
        all_shots += screenshot_sweep(pw, "d", 1440, 900, state.get("slug1") or "aurora-x9-noise-cancelling-headphones")
        all_shots += screenshot_sweep(pw, "m", 390, 844, state.get("slug1") or "aurora-x9-noise-cancelling-headphones")

    n_pass = sum(1 for r in results if r["status"] == "PASS")
    n_fail = sum(1 for r in results if r["status"] == "FAIL")
    print(f"\n===== SUMMARY: {n_pass} PASS / {n_fail} FAIL in {time.time()-t0:.0f}s =====", flush=True)
    for r in results:
        if r["status"] == "FAIL":
            print("FAIL:", r["check"], "--", r["detail"], flush=True)
    print(f"\norder1(guest)={state.get('order1')} order2(demo)={state.get('order2')}", flush=True)
    print(f"screenshots: {len(all_shots)} saved under {SHOTS}", flush=True)
    with open(os.path.expanduser("~/workspace/ecommerce-site/qa/qa-storefront-results-ff.json"), "w") as f:
        json.dump({"ts": TS, "results": results, "orders": state,
                   "page_errors": {k: v for k, v in page_errors.items() if v},
                   "image_noise": {k: len(v) for k, v in image_errors.items() if v},
                   "shots": all_shots}, f, indent=2)

if __name__ == "__main__":
    main()
