"use client";

import * as React from "react";
import { useBlockNumber, usePublicClient } from "wagmi";
import { formatUnits } from "viem";

import { PRIMARY_CHAIN_ID } from "@/lib/wagmi";

/** If no block/gas read has ever succeeded within this long, stop showing
 * "Connecting..." forever and surface a real connection-failed state instead. */
const CONNECT_TIMEOUT_MS = 12_000;

export function useNetworkStatus() {
  const publicClient = usePublicClient({ chainId: PRIMARY_CHAIN_ID });
  const { data: blockNumber, isLoading: isBlockLoading, isError: isBlockError } = useBlockNumber({
    chainId: PRIMARY_CHAIN_ID,
    watch: true,
  });

  const [gasPrice, setGasPrice] = React.useState<bigint | null>(null);
  const [lastBlockTimestamp, setLastBlockTimestamp] = React.useState<number | null>(null);
  const [hasEverConnected, setHasEverConnected] = React.useState(false);
  const [hasTimedOut, setHasTimedOut] = React.useState(false);

  React.useEffect(() => {
    if (!publicClient) return;
    let cancelled = false;

    async function load() {
      try {
        const [price, block] = await Promise.all([
          publicClient!.getGasPrice(),
          publicClient!.getBlock(),
        ]);
        if (!cancelled) {
          setGasPrice(price);
          setLastBlockTimestamp(Number(block.timestamp));
          setHasEverConnected(true);
          setHasTimedOut(false);
        }
      } catch {
        // leave previous values in place; the UI shows a stale/offline hint via secondsSinceBlock
      }
    }

    load();
    const interval = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicClient, blockNumber]);

  React.useEffect(() => {
    if (hasEverConnected) return;
    const timeout = setTimeout(() => setHasTimedOut(true), CONNECT_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [hasEverConnected]);

  const secondsSinceBlock = lastBlockTimestamp
    ? Math.max(0, Math.floor(Date.now() / 1000 - lastBlockTimestamp))
    : null;

  const isHealthy = secondsSinceBlock !== null ? secondsSinceBlock < 60 : undefined;
  const hasConnectionError = (isBlockError || hasTimedOut) && !hasEverConnected;

  return {
    blockNumber,
    gasPriceGwei: gasPrice !== null ? Number(formatUnits(gasPrice, 9)) : undefined,
    secondsSinceBlock,
    isHealthy,
    hasConnectionError,
    isLoading: isBlockLoading && gasPrice === null && !hasConnectionError,
  };
}
