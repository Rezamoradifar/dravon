"use client";

import * as React from "react";
import { decodeFunctionData } from "viem";
import { bsc } from "wagmi/chains";

import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { PRIMARY_CHAIN_ID } from "@/lib/wagmi";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";
import { tierByEntrance } from "@/lib/packages";

const BSCSCAN_API_KEY = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;
const POLL_INTERVAL_MS = 20_000;
const MAX_ENTRIES = 12;

export interface NetworkActivityEntry {
  hash: string;
  functionName: "begin" | "chargeAccount";
  from: string;
  entrance: number;
  packageName?: string;
  timestamp: number;
}

/**
 * The Window contract's ABI defines no events, so there is no on-chain log to
 * subscribe to for real-time registrations. Instead, when a BscScan API key is
 * configured (and the app's primary chain is BSC), this polls BscScan's public
 * txlist for the active window contract's own address - which returns every
 * incoming transaction from anyone, not just the connected wallet - and
 * decodes begin()/chargeAccount() calls with the real ABI. Without a key, this
 * simply returns nothing rather than fabricating activity.
 */
export function useNetworkActivityFeed() {
  const { address: windowAddress } = useLatestRoundWindow();
  const [entries, setEntries] = React.useState<NetworkActivityEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const enabled = Boolean(BSCSCAN_API_KEY && PRIMARY_CHAIN_ID === bsc.id);

  React.useEffect(() => {
    if (!enabled) {
      setEntries([]);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${windowAddress}&startblock=0&endblock=99999999&sort=desc&page=1&offset=50&apikey=${BSCSCAN_API_KEY}`;
        const res = await fetch(url);
        const json = await res.json();
        const results: Array<{ hash: string; from: string; input: string; timeStamp: string; isError: string }> =
          Array.isArray(json.result) ? json.result : [];

        const decoded: NetworkActivityEntry[] = results
          .filter((tx) => tx.isError !== "1" && tx.input !== "0x")
          .map((tx): NetworkActivityEntry | null => {
            try {
              const parsed = decodeFunctionData({ abi: roundWindowAbi, data: tx.input as `0x${string}` });
              if (parsed.functionName !== "begin" && parsed.functionName !== "chargeAccount") return null;
              const entrance = Number(parsed.functionName === "begin" ? parsed.args[0] : parsed.args[0]);
              return {
                hash: tx.hash,
                functionName: parsed.functionName,
                from: tx.from,
                entrance,
                packageName: tierByEntrance(entrance)?.name,
                timestamp: Number(tx.timeStamp) * 1000,
              };
            } catch {
              return null;
            }
          })
          .filter((e): e is NetworkActivityEntry => e !== null)
          .slice(0, MAX_ENTRIES);

        if (!cancelled) setEntries(decoded);
      } catch {
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled, windowAddress]);

  return { entries, isLoading, isConfigured: Boolean(BSCSCAN_API_KEY) };
}
