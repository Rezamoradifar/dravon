"use client";

import * as React from "react";
import { useReadContract } from "wagmi";

import { chainlinkAggregatorAbi } from "@/contracts/chainlinkAggregatorAbi";
import { NATIVE_PRICE_FEEDS } from "@/lib/nativePriceFeeds";
import { PRIMARY_CHAIN_ID } from "@/lib/wagmi";

interface CoingeckoState {
  price?: number;
  change24h?: number;
  sparkline?: number[];
  isLoading: boolean;
  isError: boolean;
}

const feed = NATIVE_PRICE_FEEDS[PRIMARY_CHAIN_ID];

function useCoingeckoPrice(coingeckoId: string | undefined): CoingeckoState {
  const [state, setState] = React.useState<CoingeckoState>({ isLoading: true, isError: false });

  React.useEffect(() => {
    if (!coingeckoId) {
      setState({ isLoading: false, isError: true });
      return;
    }

    let cancelled = false;

    async function load() {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=1`,
        );
        if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`);
        const json = await res.json();
        const prices: [number, number][] = json.prices ?? [];
        if (prices.length < 2) throw new Error("Not enough price history");

        const latest = prices[prices.length - 1][1];
        const dayAgo = prices[0][1];
        const change24h = ((latest - dayAgo) / dayAgo) * 100;
        const sparkline = prices
          .filter((_, i) => i % Math.max(1, Math.floor(prices.length / 48)) === 0)
          .map(([, p]) => p);

        if (!cancelled) {
          setState({ price: latest, change24h, sparkline, isLoading: false, isError: false });
        }
      } catch {
        if (!cancelled) setState({ isLoading: false, isError: true });
      }
    }

    load();
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [coingeckoId]);

  return state;
}

export function useNativePrice() {
  const coingecko = useCoingeckoPrice(feed?.coingeckoId);

  const { data: chainlinkData, isLoading: chainlinkLoading } = useReadContract({
    address: feed?.chainlinkFeed,
    abi: chainlinkAggregatorAbi,
    functionName: "latestRoundData",
    chainId: PRIMARY_CHAIN_ID,
    query: { enabled: Boolean(feed), refetchInterval: 30_000 },
  });

  const { data: decimals } = useReadContract({
    address: feed?.chainlinkFeed,
    abi: chainlinkAggregatorAbi,
    functionName: "decimals",
    chainId: PRIMARY_CHAIN_ID,
    query: { enabled: Boolean(feed) },
  });

  const onchainPrice =
    chainlinkData && decimals !== undefined
      ? Number(chainlinkData[1]) / 10 ** decimals
      : undefined;

  const price = coingecko.price ?? onchainPrice;
  const source: "coingecko" | "chainlink" | undefined = coingecko.price
    ? "coingecko"
    : onchainPrice
      ? "chainlink"
      : undefined;

  return {
    symbol: feed?.symbol ?? "Native",
    price,
    change24h: coingecko.change24h,
    sparkline: coingecko.sparkline,
    onchainPrice,
    source,
    isLoading: coingecko.isLoading && chainlinkLoading,
  };
}
