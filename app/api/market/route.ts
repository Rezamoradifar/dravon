import { NextResponse } from "next/server";
import { MARKET_URL, parseMarketQuotes } from "@/lib/market-feed";

export const dynamic = "force-dynamic";
type Quote = ReturnType<typeof parseMarketQuotes>[number];
let cache: { quotes: Quote[]; fetchedAt: number } | undefined;
let pending: Promise<void> | undefined;
async function refresh() {
  const response = await fetch(MARKET_URL, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("Market feed unavailable");
  const data = await response.json();
  const quotes = parseMarketQuotes(data);
  cache = { quotes, fetchedAt: Date.now() };
}
export async function GET() {
  try {
    if (!cache || Date.now() - cache.fetchedAt > 30_000) {
      if (!pending)
        pending = refresh().finally(() => {
          pending = undefined;
        });
      await pending;
    }
    return NextResponse.json({
      ...cache,
      source: "CoinGecko",
      stale: cache!.quotes.some((q) => Date.now() - q.updatedAt > 300_000),
    });
  } catch {
    if (cache)
      return NextResponse.json({ ...cache, source: "CoinGecko", stale: true });
    return NextResponse.json(
      { error: "Market feed temporarily unavailable" },
      { status: 503 },
    );
  }
}
