"use client";

import { useReadContract } from "wagmi";

import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";
import type { MainBulkInfo } from "@/types/contract";

export function useMainBulkInfo(roundsAgo: bigint | number = 0) {
  const { address: windowAddress } = useLatestRoundWindow();

  const { data, isLoading, isError, refetch } = useReadContract({
    address: windowAddress,
    abi: roundWindowAbi,
    functionName: "getMainBulkInfo",
    args: [BigInt(roundsAgo)],
    query: { refetchInterval: 20_000 },
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
      }
    : undefined;

  return { info, isLoading, isError, refetch };
}
