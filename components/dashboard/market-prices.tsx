"use client";

import { MARKET_URL, parseMarketQuotes } from "@/lib/market-feed";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "@/contexts/language-context";

type Quote = { id: string; symbol: string; price: number; change: number | null; updatedAt: number };
type Feed = { quotes: Quote[]; stale: boolean };
export function MarketPrices() {
  const { t, locale } = useTranslation();
  const { data, isPending, isError } = useQuery<Feed>({
    queryKey: ["market-prices"],
    queryFn: async ({ signal }) => {
      try {
        const response = await fetch("/api/market", { signal: AbortSignal.any([signal, AbortSignal.timeout(12_000)]) });
        if (!response.ok) throw new Error("Market feed unavailable");
        return await response.json();
      } catch (error) {
        if (signal.aborted) throw error;
        // Some hosts cannot reach the provider. Use the same validated public feed from the browser.
        const response = await fetch(MARKET_URL, { signal: AbortSignal.any([signal, AbortSignal.timeout(8_000)]) });
        if (!response.ok) throw new Error("Market feed unavailable");
        const quotes = parseMarketQuotes(await response.json());
        return { quotes, stale: quotes.some((quote) => Date.now() - quote.updatedAt > 300_000) };
      }
    },
    refetchInterval: 30_000,
    staleTime: 25_000,
    retry: 1,
  });
  const stale = data?.stale || isError || data?.quotes.some((quote) => Date.now() - quote.updatedAt > 300_000);
  return <Card className="card-glow mt-6">
    <CardHeader><CardTitle>{t("improvements.markets")}</CardTitle><CardDescription>{t("improvements.marketHint")}</CardDescription></CardHeader>
    <CardContent>
      {isPending ? <p role="status">{t("improvements.loading")}</p> : !data ? <p role="status" className="text-sm text-muted-foreground">{t("improvements.unavailable")}</p> : <>
        {stale && <p role="status" className="mb-3 text-sm text-amber-500">{t("improvements.stale")}</p>}
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {data.quotes.map((quote) => <div key={quote.id} className="min-w-0 rounded-lg border p-3">
            <dt className="font-semibold">{quote.symbol}</dt>
            <dd className="mt-1 break-all font-mono text-sm" dir="ltr">{quote.price.toLocaleString(locale, { style: "currency", currency: "USD", maximumFractionDigits: quote.price < 1 ? 5 : 2 })}</dd>
            <dd dir="ltr" className={`mt-1 text-xs ${quote.change !== null && quote.change < 0 ? "text-destructive" : "text-muted-foreground"}`}>{quote.change === null ? "—" : `${quote.change.toFixed(2)}%`}</dd>
            <dd className="mt-2 text-xs text-muted-foreground"><time dateTime={new Date(quote.updatedAt).toISOString()}>{new Date(quote.updatedAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</time></dd>
          </div>)}
        </dl>
      </>}
    </CardContent>
  </Card>;
}
