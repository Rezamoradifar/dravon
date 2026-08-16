"use client";

import { useAccount, useReadContract } from "wagmi";
import type { Address } from "viem";

import { FACTORY_ADDRESS } from "@/contracts/addresses";
import { factoryAbi } from "@/contracts/factoryAbi";
import { useUserRegistration } from "@/hooks/useUserRegistration";

// getWeekProgress reports in "leg-worth units" - the spec's own conversion
// (multiply by 10 for USD) matches WEEK_MATCH_UNIT=50 meaning $500.
const LEG_UNIT_TO_USD = 10;

export interface WeekProgress {
  leftUsd: number;
  rightUsd: number;
  matchedUsd: number;
  rawUsd: number;
  credited: bigint;
}

/**
 * A user's own left-leg vs. right-leg volume toward this week's $500/$500
 * matching bonus, straight from the factory's getWeekProgress(userId, week) -
 * the per-user breakdown behind the aggregate numbers on WeeklyWindowCard.
 */
export function useWeekProgress(address?: Address, week?: bigint) {
  const { address: connectedAddress } = useAccount();
  const userAddress = address ?? connectedAddress;
  const { userId } = useUserRegistration(userAddress);

  const enabled = Boolean(userId && userId > 0 && week !== undefined);

  const { data, isLoading, isError, refetch } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "getWeekProgress",
    args: enabled ? [userId as number, week as bigint] : undefined,
    query: { enabled, refetchInterval: 20_000 },
  });

  const progress: WeekProgress | undefined = data
    ? {
        leftUsd: Number(data[0]) * LEG_UNIT_TO_USD,
        rightUsd: Number(data[1]) * LEG_UNIT_TO_USD,
        matchedUsd: Number(data[2]) * LEG_UNIT_TO_USD,
        rawUsd: Number(data[3]) * LEG_UNIT_TO_USD,
        credited: data[4],
      }
    : undefined;

  return { progress, isLoading, isError, refetch };
}
