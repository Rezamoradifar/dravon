"use client";

import * as React from "react";

/**
 * Best-effort live BNB/USD price, purely for converting the lobby's preset
 * dollar-amount buttons ($1/$10/...) into an equivalent BNB stake - never
 * used on-chain (the contract only ever sees the resulting BNB wei amount
 * the player confirms), so a stale or unavailable price only affects the
 * UI's suggested amounts, never fund safety.
 */
export function useBnbUsdPrice() {
  const [price, setPrice] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const parsed = Number(data?.price);
        if (Number.isFinite(parsed) && parsed > 0) setPrice(parsed);
      })
      .catch(() => {
        // Leave price null - callers fall back to raw BNB presets.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return price;
}
