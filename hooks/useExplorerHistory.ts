"use client";

import * as React from "react";
import { decodeFunctionData } from "viem";
import { bsc } from "wagmi/chains";

import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { PRIMARY_CHAIN_ID } from "@/lib/wagmi";
import type { ActivityEntry } from "@/hooks/useActivityLog";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";

const BSCSCAN_API_KEY = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;

/**
 * The contract ABI defines no events, so there is no on-chain log to read a
 * real history from directly. When a BscScan API key is configured (and the
 * app's primary chain is BSC), this pulls the wallet's real transaction
 * history from BscScan's public API and decodes calls made to the window
 * contract using our own ABI. Without a key, this simply returns nothing and
 * the dashboard falls back to this browser's local activity log.
 */
export function useExplorerHistory(address?: string) {
  const [entries, setEntries] = React.useState<ActivityEntry[]>([]);
  const [isError, setIsError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { address: windowAddress } = useLatestRoundWindow();
  const enabled = Boolean(BSCSCAN_API_KEY && address && PRIMARY_CHAIN_ID === bsc.id);

  React.useEffect(() => {
    if (!enabled || !address) {
      setEntries([]);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    setEntries([]);
    let cancelled = false;
    const controller = new AbortController();
    const walletAddress = address;

    async function load() {
      setIsLoading(true);
      setIsError(false);
      try {
        // BscScan's old api.bscscan.com/api (v1) is deprecated - all chains,
        // including BSC, now go through Etherscan's unified v2 gateway with
        // an explicit chainid. Same API key, same response shape.
        const url = `https://api.etherscan.io/v2/api?chainid=${PRIMARY_CHAIN_ID}&module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${BSCSCAN_API_KEY}`;
        const res = await fetch(url, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12_000)]) });
        if (!res.ok) throw new Error("Explorer unavailable");
        const json = await res.json();
        if (!Array.isArray(json.result) && json.message !== "No transactions found") throw new Error("Explorer unavailable");
        const results: Array<{ hash: string; to: string; input: string; timeStamp: string; isError: string }> =
          Array.isArray(json.result) ? json.result : [];

        const decoded: ActivityEntry[] = results
          .filter((tx) => tx.to?.toLowerCase() === windowAddress.toLowerCase() && tx.input !== "0x")
          .map((tx) => {
            let functionName = "unknown";
            try {
              const parsed = decodeFunctionData({ abi: roundWindowAbi, data: tx.input as `0x${string}` });
              functionName = parsed.functionName;
            } catch {
              // leave as "unknown" if it doesn't match our ABI
            }
            return {
              chainId: PRIMARY_CHAIN_ID,
              hash: tx.hash,
              functionName,
              from: walletAddress,
              timestamp: Number(tx.timeStamp) * 1000,
              status: tx.isError === "1" ? "failed" : ("confirmed" as const),
            };
          });

        if (!cancelled) setEntries(decoded);
      } catch {
        if (!cancelled) setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [enabled, address, windowAddress]);

  return { entries: entries.filter((entry) => entry.from.toLowerCase() === address?.toLowerCase()), isLoading, isError, isConfigured: enabled };
}
