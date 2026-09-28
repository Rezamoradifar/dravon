"use client";

import { useReadContract } from "wagmi";

import { FACTORY_ADDRESS } from "@/contracts/addresses";
import { factoryAbi } from "@/contracts/factoryAbi";

/**
 * factory.roundCounter() - how many rounds of history the current contract has.
 * The window's history views compute `roundCounter - roundsAgo` and revert on
 * underflow, so every roundsAgo we send must be clamped to this value. v7.4
 * restarted at round 0 on 28 Sep 2026; older rounds live only on v7.1.
 */
export function useRoundCounter() {
  const { data, isLoading } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "roundCounter",
    query: { refetchInterval: 60_000 },
  });
  return { roundCounter: data === undefined ? undefined : Number(data), isLoading };
}
