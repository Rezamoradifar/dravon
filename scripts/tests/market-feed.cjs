const ts = require("typescript");
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const source = ts.transpileModule(
  fs.readFileSync("app/api/market/route.ts", "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
let now = Date.now();
class Clock extends Date {
  static now() {
    return now;
  }
}
function route(fetch) {
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require: () => ({
      NextResponse: {
        json: (body, options) => ({ body, status: options?.status ?? 200 }),
      },
    }),
    fetch,
    AbortSignal,
    URLSearchParams,
    Date: Clock,
    Number,
    Error,
  });
  return exports.GET;
}
const valid = Object.fromEntries(
  ["bitcoin", "ethereum", "binancecoin", "solana", "ripple", "dogecoin"].map(
    (id) => [
      id,
      {
        usd: 100,
        usd_24h_change: -2,
        last_updated_at: Math.floor(now / 1000),
      },
    ],
  ),
);
(async () => {
  let calls = 0;
  let fail = false;
  const get = route(async () => {
    calls++;
    if (fail) throw Error("offline");
    return { ok: true, json: async () => valid };
  });
  const results = await Promise.all([get(), get(), get()]);
  assert.equal(calls, 1, "concurrent requests share one upstream call");
  assert.equal(results[0].body.quotes.length, 6);
  assert.equal(results[0].body.stale, false);
  await get();
  assert.equal(calls, 1, "fresh cache prevents repeated upstream calls");
  fail = true;
  now += 31_000;
  const fallback = await get();
  assert.equal(fallback.status, 200);
  assert.equal(
    fallback.body.stale,
    true,
    "upstream failure marks cached quotes stale",
  );
  const offline = route(async () => {
    throw Error("offline");
  });
  assert.equal((await offline()).status, 503);
  const invalid = route(async () => ({ ok: true, json: async () => ({}) }));
  assert.equal((await invalid()).status, 503);
  const stale = route(async () => ({
    ok: true,
    json: async () =>
      Object.fromEntries(
        Object.keys(valid).map((id) => [
          id,
          { ...valid[id], last_updated_at: 1 },
        ]),
      ),
  }));
  assert.equal(
    (await stale()).body.stale,
    true,
    "provider timestamps control freshness",
  );
  console.log(
    "PASS: quotes, concurrent deduplication, cache reuse, stale fallback, unavailable feed, malformed response, old provider timestamps",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
