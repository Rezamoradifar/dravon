/* Browser regression for the first-install (no Reown ID) wallet picker.
   Run after 'npm run build' and 'npm install --no-save playwright'. */
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { setTimeout: delay } = require("node:timers/promises");
const { chromium } = require("playwright");

async function main() {
  const port = 3399;
  const origin = "http://127.0.0.1:" + port;
  const server = spawn("node", ["node_modules/next/dist/bin/next", "start", "-p", String(port), "-H", "127.0.0.1"], {
    stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, NODE_ENV: "production" },
  });
  let output = "";
  server.stdout.on("data", (chunk) => { output += String(chunk).slice(-400); });
  server.stderr.on("data", (chunk) => { output += String(chunk).slice(-400); });
  let browser;
  try {
    let ok = false;
    for (let i = 0; i < 45; i++) {
      if (server.exitCode !== null) break;
      try {
        const response = await fetch(origin + "/api/health", { signal: AbortSignal.timeout(1000) });
        if (response.ok) { ok = true; break; }
      } catch {}
      await delay(1000);
    }
    assert(ok, "Next.js did not become healthy: " + output);
    browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await page.goto(origin + "/dashboard", { waitUntil: "domcontentloaded", timeout: 30000 });
    const trigger = page.getByTestId("wallet-connect-open").first();
    await trigger.waitFor({ state: "visible", timeout: 30000 });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible", timeout: 10000 });
    const missingId = dialog.getByTestId("wallet-connect-missing-id");
    await missingId.waitFor({ state: "visible", timeout: 10000 });
    assert((await missingId.innerText()).includes("Project ID"), "Missing Project ID warning was not displayed");
    console.log("PASS: Android-sized Chrome opens wallet picker with actionable no-ID state");
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
