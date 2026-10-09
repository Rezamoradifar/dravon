export const MARKET_COINS = [
  ["bitcoin", "BTC", "Bitcoin"],
  ["ethereum", "ETH", "Ethereum"],
  ["binancecoin", "BNB", "BNB"],
  ["solana", "SOL", "Solana"],
  ["ripple", "XRP", "XRP"],
  ["dogecoin", "DOGE", "Dogecoin"],
] as const;

export const MARKET_URL = `https://api.coingecko.com/api/v3/simple/price?${new URLSearchParams({
  ids: MARKET_COINS.map(([id]) => id).join(","),
  vs_currencies: "usd",
  include_24hr_change: "true",
  include_last_updated_at: "true",
})}`;

export function parseMarketQuotes(data: unknown) {
  if (!data || typeof data !== "object") throw new Error("Invalid market response");
  return MARKET_COINS.map(([id, symbol, name]) => {
    const value = (data as Record<string, Record<string, unknown>>)[id];
    if (!value || typeof value.usd !== "number" || !Number.isFinite(value.usd) || value.usd <= 0 || typeof value.last_updated_at !== "number" || !Number.isFinite(value.last_updated_at) || value.last_updated_at <= 0) throw new Error("Invalid market response");
    return {
      id, symbol, name, price: value.usd,
      change: typeof value.usd_24h_change === "number" && Number.isFinite(value.usd_24h_change) ? value.usd_24h_change : null,
      updatedAt: value.last_updated_at * 1000,
    };
  });
}
