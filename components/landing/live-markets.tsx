"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { useTranslation } from "@/contexts/language-context";

type Feed = {
  quotes: {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change: number | null;
    updatedAt: number;
  }[];
  source: string;
  stale: boolean;
};
export function LiveMarkets() {
  const { locale } = useTranslation();
  const fa = locale === "fa";
  const [feed, setFeed] = useState<Feed>();
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    let busy = false;
    const controller = new AbortController();
    async function load() {
      if (busy || document.hidden) return;
      busy = true;
      try {
        let data: Feed;
        try {
          const response = await fetch("/api/market", {
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(12_000),
            ]),
            cache: "no-store",
          });
          if (!response.ok) throw new Error("Unavailable");
          data = await response.json();
        } catch {
          if (controller.signal.aborted) return;
          // Public browser feed is a fallback when the host cannot reach the provider.
          const coins = [
            ["bitcoin", "BTC", "Bitcoin"],
            ["ethereum", "ETH", "Ethereum"],
            ["binancecoin", "BNB", "BNB"],
            ["solana", "SOL", "Solana"],
            ["ripple", "XRP", "XRP"],
            ["dogecoin", "DOGE", "Dogecoin"],
          ];
          const params = new URLSearchParams({
            ids: coins.map((c) => c[0]).join(","),
            vs_currencies: "usd",
            include_24hr_change: "true",
            include_last_updated_at: "true",
          });
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?${params}`,
            {
              signal: AbortSignal.any([
                controller.signal,
                AbortSignal.timeout(8_000),
              ]),
            },
          );
          if (!response.ok) throw new Error("Unavailable");
          const raw = await response.json();
          const quotes = coins.map(([id, symbol, name]) => {
            const q = raw[id];
            if (
              !q ||
              typeof q.usd !== "number" ||
              !Number.isFinite(q.usd) ||
              q.usd <= 0 ||
              !Number.isFinite(q.last_updated_at) ||
              q.last_updated_at <= 0
            )
              throw new Error("Invalid quote");
            return {
              id,
              symbol,
              name,
              price: q.usd,
              change:
                typeof q.usd_24h_change === "number" &&
                Number.isFinite(q.usd_24h_change)
                  ? q.usd_24h_change
                  : null,
              updatedAt: q.last_updated_at * 1000,
            };
          });
          data = {
            quotes,
            source: "CoinGecko",
            stale: quotes.some((q) => Date.now() - q.updatedAt > 300_000),
          };
        }
        if (active) {
          setFeed(data);
          setFailed(false);
          setNow(Date.now());
        }
      } catch {
        if (active) setFailed(true);
      } finally {
        busy = false;
        if (active) setLoading(false);
      }
    }
    void load();
    const timer = setInterval(() => {
      setNow(Date.now());
      void load();
    }, 30_000);
    const visible = () => {
      if (!document.hidden) void load();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      active = false;
      controller.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [retry]);
  const stale =
    failed ||
    feed?.stale ||
    feed?.quotes.some((q) => now - q.updatedAt > 300_000);
  return (
    <section
      id="markets"
      className="dv-section dv-markets"
      aria-labelledby="markets-title"
    >
      <div className="dv-section-heading">
        <div>
          <span className="dv-eyebrow">MARKET OBSERVATORY / 01</span>
          <h2 id="markets-title">
            {fa ? "نبض بازار. در یک نگاه." : "The market. In focus."}
          </h2>
        </div>
        <span
          className={`dv-feed-status ${stale ? "is-stale" : ""}`}
          role="status"
        >
          <i />
          {loading
            ? fa
              ? "در حال اتصال"
              : "Connecting"
            : stale
              ? fa
                ? "داده زنده در دسترس نیست"
                : "Live feed unavailable"
              : fa
                ? "به‌روزرسانی هر ۳۰ ثانیه"
                : "Refreshes every 30s"}
        </span>
      </div>
      <div className="dv-market-grid" dir="ltr">
        {feed ? (
          feed.quotes.map((q, i) => (
            <article key={q.id} className="dv-quote">
              <div className="dv-quote-head">
                <span className={`dv-coin dv-coin-${i}`}>
                  {q.symbol.slice(0, 1)}
                </span>
                <div>
                  <strong>{q.symbol}</strong>
                  <small>{q.name}</small>
                </div>
                <span className="dv-quote-pair">USD</span>
              </div>
              <p className="dv-quote-price">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: q.price < 1 ? 5 : 2,
                }).format(q.price)}
              </p>
              <div
                className={`dv-quote-change ${q.change !== null && q.change < 0 ? "negative" : ""}`}
              >
                {q.change === null ? (
                  "—"
                ) : (
                  <>
                    {q.change >= 0 ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}
                    {q.change > 0 ? "+" : ""}
                    {q.change.toFixed(2)}%
                  </>
                )}
                <span>24H</span>
              </div>
              <small className="dv-quote-time">
                {new Date(q.updatedAt).toLocaleTimeString(
                  locale === "fa" ? "fa-IR" : "en-GB",
                  { hour: "2-digit", minute: "2-digit" },
                )}
              </small>
            </article>
          ))
        ) : (
          <div className="dv-market-empty">
            {loading ? (
              fa ? (
                "دریافت قیمت‌ها از بازار…"
              ) : (
                "Connecting to the market feed…"
              )
            ) : (
              <>
                <p>
                  {fa
                    ? "دریافت قیمت‌ها فعلاً ممکن نیست."
                    : "Prices are temporarily unavailable."}
                </p>
                <button
                  onClick={() => {
                    setLoading(true);
                    setRetry((n) => n + 1);
                  }}
                >
                  <RefreshCw size={14} />
                  {fa ? "تلاش دوباره" : "Try again"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <p className="dv-market-note">
        {fa
          ? "منبع: CoinGecko · قیمت مرجع به دلار · تغییرات ۲۴ ساعته"
          : "Source: CoinGecko · Reference prices in USD · 24-hour changes"}
        {stale && feed
          ? fa
            ? " · آخرین داده دریافتی؛ ممکن است قدیمی باشد"
            : " · Last available quotes; may be outdated"
          : ""}
      </p>
    </section>
  );
}
