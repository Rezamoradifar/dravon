"use client";

import * as React from "react";
import { useReadContract, useWatchContractEvent } from "wagmi";
import type { Address } from "viem";

import { FACTORY_ADDRESS, WINDOW_ADDRESS } from "@/contracts/addresses";
import { factoryAbi } from "@/contracts/factoryAbi";

const STORAGE_KEY = "round-dashboard:latest-window:v1";

function readCachedWindow(): Address | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value && value.startsWith("0x") ? (value as Address) : undefined;
  } catch {
    return undefined;
  }
}

function writeCachedWindow(address: Address) {
  try {
    window.localStorage.setItem(STORAGE_KEY, address);
  } catch {
    // ignore quota / private-mode errors
  }
}

/**
 * Resolves the round window the app should actually use, live from the permanent
 * factory contract - never a static, hand-configured address.
 *
 * Once a round rolls over, the previous window's `isClosed` flips to true and every
 * write call on it (begin, chargeAccount, distributeMatchingBonuses,
 * resetWalletAddress, voteShutdown) reverts with WindowClosed - it never becomes
 * usable again. Relying on a fixed NEXT_PUBLIC_WINDOW_ADDRESS would silently break
 * the whole app at every rollover, so every page reads the active window through
 * this hook instead.
 *
 * Freshness is kept three ways:
 *  1. A live `LatestWindowChanged` event subscription (near-instant; wagmi falls
 *     back to log polling automatically when no WebSocket transport is configured).
 *  2. A 15s poll of `factory.latestWindow()` as a redundant safety net.
 *  3. The last resolved address is cached in localStorage so a page refresh keeps
 *     using the newest known contract instead of flashing back to a stale default.
 */
export function useLatestRoundWindow() {
  const [cached, setCached] = React.useState<Address | undefined>(() => readCachedWindow());

  const { data, isLoading, isError, refetch } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "latestWindow",
    query: { refetchInterval: 15_000 },
  });

  useWatchContractEvent({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    eventName: "LatestWindowChanged",
    onLogs: () => {
      refetch();
    },
  });

  const resolved = data as Address | undefined;

  React.useEffect(() => {
    if (resolved) {
      setCached(resolved);
      writeCachedWindow(resolved);
    }
  }, [resolved]);

  const address = resolved ?? cached ?? WINDOW_ADDRESS;

  return {
    address,
    /** True once we've confirmed this address directly from the factory (not a cached/fallback guess). */
    isConfirmed: Boolean(resolved),
    isLoading: isLoading && !cached,
    isError,
    refetch,
  };
}
