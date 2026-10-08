import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const coins = [
  ["bitcoin", "BTC", "Bitcoin"],
  ["ethereum", "ETH", "Ethereum"],
  ["binancecoin", "BNB", "BNB"],
  ["solana", "SOL", "Solana"],
  ["ripple", "XRP", "XRP"],
  ["dogecoin", "DOGE", "Dogecoin"],
] as const;
type Quote = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number | null;
  updatedAt: number;
};
let cache: { quotes: Quote[]; fetchedAt: number } | undefined;
let pending: Promise<void> | undefined;
async function refresh() {
  const params = new URLSearchParams({
    ids: coins.map((c) => c[0]).join(","),
    vs_currencies: "usd",
    include_24hr_change: "true",
    include_last_updated_at: "true",
  });
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?${params}`,
    { cache: "no-store", signal: AbortSignal.timeout(8000) },
  );
  if (!response.ok) throw new Error("Market feed unavailable");
  const data = await response.json();
  const quotes = coins.map(([id, symbol, name]) => {
    const value = data[id];
    if (
      !value ||
      typeof value.usd !== "number" ||
      !Number.isFinite(value.usd) ||
      value.usd <= 0 ||
      !Number.isFinite(value.last_updated_at) ||
      value.last_updated_at <= 0
    )
      throw new Error("Invalid market response");
    return {
      id,
      symbol,
      name,
      price: value.usd,
      change:
        typeof value.usd_24h_change === "number" &&
        Number.isFinite(value.usd_24h_change)
          ? value.usd_24h_change
          : null,
      updatedAt: value.last_updated_at * 1000,
    };
  });
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
