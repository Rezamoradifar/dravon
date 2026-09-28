"use client";

import { useReadContract } from "wagmi";

import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";
import { useRoundCounter } from "@/hooks/useRoundCounter";
import { clampRoundsAgo } from "@/lib/contract-v74";
import { CHAIN_ID } from "@/contracts/addresses";
import type { MainBulkInfo } from "@/types/contract";

export function useMainBulkInfo(roundsAgo: bigint | number = 0) {
  const counter = useRoundCounter();
  const effectiveRoundsAgo = clampRoundsAgo(roundsAgo, counter.data ?? 0n);
  const { address: windowAddress } = useLatestRoundWindow();

  const { data, isLoading, isError, refetch } = useReadContract({
    address: windowAddress,
    abi: roundWindowAbi,
    functionName: "getMainBulkInfo",
    args: [effectiveRoundsAgo],
    chainId: CHAIN_ID,
    query: { enabled: Boolean(windowAddress) && counter.data !== undefined, refetchInterval: 20_000 },
  });

  const info: MainBulkInfo | undefined = data
    ? {
        roundWindow: data[0],
        userCount: data[1],
        pointValue: data[2],
        roundPoints: data[3],
        roundEnteredUSD: data[4],
        allEnteredUSD: data[5],
        nextBinaryPay: data[6],
        stage: data[7],
      }
    : undefined;

  return { info, effectiveRoundsAgo, isClamped: effectiveRoundsAgo !== BigInt(roundsAgo), isLoading: isLoading || counter.isLoading, isError: isError || counter.isError, refetch };
}
