"use client";

import { useReadContract } from "wagmi";

import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";
import { useRoundCounter } from "@/hooks/useRoundCounter";
import type { MainBulkInfo } from "@/types/contract";

export function useMainBulkInfo(roundsAgo: bigint | number = 0) {
  const { address: windowAddress } = useLatestRoundWindow();
  const { roundCounter } = useRoundCounter();

  // getMainBulkInfo(0) is always safe; anything further back reverts once it
  // passes roundCounter, so clamp (and wait for the counter before going back).
  const requested = Number(roundsAgo);
  const safeRoundsAgo = requested === 0 ? 0 : roundCounter === undefined ? undefined : Math.min(requested, roundCounter);

  const { data, isLoading, isError, refetch } = useReadContract({
    address: windowAddress,
    abi: roundWindowAbi,
    functionName: "getMainBulkInfo",
    args: safeRoundsAgo === undefined ? undefined : [BigInt(safeRoundsAgo)],
    query: { enabled: safeRoundsAgo !== undefined, refetchInterval: 20_000 },
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

  return { info, isLoading, isError, refetch, roundsAgo: safeRoundsAgo };
}
