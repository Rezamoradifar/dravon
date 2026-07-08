"use client";

import { useReadContracts } from "wagmi";
import type { Address } from "viem";

import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";

export interface RoundHistoryPoint {
  roundsAgo: number;
  userCount: number;
  pointValue: number;
  roundPoints: number;
  roundEnteredUSD: number;
  allEnteredUSD: number;
}

export function useRoundsHistory(maxRounds = 8) {
  const { roundId, isLoading: isRoundIdLoading } = useDashboardData();
  const { address: windowAddress } = useLatestRoundWindow();

  const available = roundId !== undefined ? Math.min(Number(roundId) + 1, maxRounds) : 0;
  const roundsAgoList = Array.from({ length: available }, (_, i) => i);

  const { data, isLoading } = useReadContracts({
    contracts: roundsAgoList.map((roundsAgo) => ({
      address: windowAddress,
      abi: roundWindowAbi,
      functionName: "getMainBulkInfo",
      args: [BigInt(roundsAgo)],
    })),
    query: { enabled: available > 0, refetchInterval: 30_000 },
  });

  const points: RoundHistoryPoint[] = (data ?? [])
    .map((entry, i) => {
      if (!entry.result) return null;
      const [, userCount, pointValue, roundPoints, roundEnteredUSD, allEnteredUSD] = entry.result as unknown as readonly [
        Address,
        bigint,
        string,
        bigint,
        string,
        string,
        string,
      ];
      return {
        roundsAgo: roundsAgoList[i],
        userCount: Number(userCount),
        pointValue: Number(pointValue) || 0,
        roundPoints: Number(roundPoints),
        roundEnteredUSD: Number(roundEnteredUSD) || 0,
        allEnteredUSD: Number(allEnteredUSD) || 0,
      };
    })
    .filter((p): p is RoundHistoryPoint => p !== null)
    .reverse();

  return { points, isLoading: isLoading || isRoundIdLoading };
}
