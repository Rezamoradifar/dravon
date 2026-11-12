/* Browser checks for the Global-inspired bilingual Aurora homepage.
   Requires production build and Playwright Chromium in CI. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const { setTimeout: delay } = require("node:timers/promises");
const { chromium } = require("playwright");

async function main() {
  const port = 3498;
  const origin = "http://127.0.0.1:" + port;
  const server = spawn("node", ["node_modules/next/dist/bin/next", "start", "-p", String(port), "-H", "127.0.0.1"], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production" },
  });
  let output = "";
  for (const stream of [server.stdout, server.stderr]) {
    stream.on("data", chunk => { output += String(chunk).slice(-500); });
  }
  let browser;
  try {
    let healthy = false;
    for (let i = 0; i < 45; i++) {
      if (server.exitCode !== null) break;
      try {
        const r = await fetch(origin + "/api/health", { signal: AbortSignal.timeout(1000) });
        if (r.ok) { healthy = true; break; }
      } catch {}
      await delay(1000);
    }
    assert(healthy, "App did not become healthy: " + output);
    browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
    const outputDir = "/tmp/scn-aurora-preview";
    fs.mkdirSync(outputDir, { recursive: true });

    const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await desktop.goto(origin + "/", { waitUntil: "domcontentloaded", timeout: 30000 });
    await desktop.locator(".scn-hero h1").waitFor({ state: "visible", timeout: 30000 });
    assert((await desktop.locator(".scn-hero h1").innerText()).includes("Smart contracts."), "Landing hero not visible");
    await desktop.screenshot({ path: outputDir + "/desktop.png", fullPage: true, animations: "disabled" });
    console.log("PASS desktop hero and whole landing screenshot");

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await mobile.goto(origin + "/", { waitUntil: "domcontentloaded", timeout: 30000 });
    const menu = mobile.locator(".scn-menu-toggle");
    await menu.waitFor({ state: "visible", timeout: 20000 });
    await menu.click();
    assert.equal(await menu.getAttribute("aria-expanded"), "true", "Mobile menu did not open");
    await mobile.locator("#scn-navigation a[href='#in-action']").click();
    assert.equal(await menu.getAttribute("aria-expanded"), "false", "Mobile nav did not close on navigation");

    await mobile.getByRole("tab", { name: /Explore your team/i }).click();
    assert.equal(await mobile.getByRole("tab", { name: /Explore your team/i }).getAttribute("aria-selected"), "true");
    assert((await mobile.getByRole("tabpanel").innerText()).includes("Explore your team"), "Interactive step panel did not switch");

    await mobile.locator(".scn-language").click();
    await mobile.locator(".scn-hero h1").waitFor({ state: "visible" });
    assert((await mobile.locator(".scn-hero h1").innerText()).includes("قرارداد هوشمند"), "Persian switch failed");

    const widths = await mobile.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    assert(widths.scroll <= widths.viewport + 2, "Mobile horizontal overflow: " + JSON.stringify(widths));
    await mobile.screenshot({ path: outputDir + "/mobile-fa.png", fullPage: true, animations: "disabled" });
    console.log("PASS mobile navigation, interactive walkthrough, Persian toggle and no horizontal overflow");
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
