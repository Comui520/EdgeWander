from playwright.sync_api import sync_playwright
import sys

OUT = "D:/EdgeWander/.claude-tmp"
import os
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 800})
    page = ctx.new_page()

    # ---- Home ----
    page.goto("http://localhost:3000/", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(1000)
    page.screenshot(path=f"{OUT}/home.png", full_page=False)

    # Inspect key elements
    nav_chips = page.locator(".nav-chip").all()
    print("nav chip count:", len(nav_chips))
    for c in nav_chips:
        print("  chip text:", c.inner_text())

    dip = page.locator(".dip-switch").first
    print("dip-switch present:", dip.count() > 0)
    if dip.count() > 0:
        print("dip-switch data-pos:", dip.get_attribute("data-pos"))

    cursor = page.locator(".pixel-cursor").first
    print("pixel-cursor element present:", cursor.count() > 0)

    burnin = page.locator(".crt-overlay--burnin").first
    print("burnin layer present:", burnin.count() > 0)

    # ---- Toggle language ----
    if dip.count() > 0:
        dip.click()
        page.wait_for_timeout(400)
        page.screenshot(path=f"{OUT}/home_en.png", full_page=False)
        print("after toggle dip pos:", dip.get_attribute("data-pos"))
        # flip back
        dip.click()
        page.wait_for_timeout(200)

    # ---- Hall ----
    page.goto("http://localhost:3000/hall", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2500)
    page.screenshot(path=f"{OUT}/hall.png", full_page=False)

    browser.close()

print("screenshots ok")
