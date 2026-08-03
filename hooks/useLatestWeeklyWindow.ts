"use client";

import * as React from "react";
import { useReadContract, useWatchContractEvent } from "wagmi";
import type { Address } from "viem";

import { FACTORY_ADDRESS, WEEKLY_WINDOW_ADDRESS } from "@/contracts/addresses";
import { factoryAbi } from "@/contracts/factoryAbi";

const STORAGE_KEY = "round-dashboard:latest-weekly-window:v1";

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
 * Resolves the weekly $500-matching window currently collecting, live from the
 * factory - mirrors {useLatestRoundWindow} for the same reason: a week that has
 * ended is superseded by a new clone (see WeeklyWindowCreated), and a stale
 * hand-configured address would silently start reading the wrong week's pool.
 */
export function useLatestWeeklyWindow() {
  const [cached, setCached] = React.useState<Address | undefined>(() => readCachedWindow());

  const { data, isLoading, isError, refetch } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "weeklyWindow",
    query: { refetchInterval: 30_000 },
  });

  useWatchContractEvent({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    eventName: "WeeklyWindowCreated",
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

  const address = resolved ?? cached ?? WEEKLY_WINDOW_ADDRESS;

  return {
    address,
    isConfirmed: Boolean(resolved),
    isLoading: isLoading && !cached,
    isError,
    refetch,
  };
}
