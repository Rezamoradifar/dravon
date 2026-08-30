"use client";

import { useReadContracts } from "wagmi";

import { FACTORY_ADDRESS } from "@/contracts/addresses";
import { factoryAbi } from "@/contracts/factoryAbi";
import type { StageInfo } from "@/types/contract";

/**
 * Reads the pool's live stage-controller state: the current stage (1 healthiest -
 * 4 floor), how many rounds of full-price runway the free reserve covers, and the
 * per-stage lever settings (weeklyPct, pointCeiling, renewalScoreMask) currently in
 * force. See DataStorage.sol's stage/stageParams/_updateStage for the source of truth.
 */
export function useStageInfo() {
  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: [
      { address: FACTORY_ADDRESS, abi: factoryAbi, functionName: "stage" },
      { address: FACTORY_ADDRESS, abi: factoryAbi, functionName: "lastCoverage" },
      { address: FACTORY_ADDRESS, abi: factoryAbi, functionName: "goodStreak" },
      { address: FACTORY_ADDRESS, abi: factoryAbi, functionName: "currentStageParams" },
    ],
    query: { refetchInterval: 30_000 },
  });

  const stage = data?.[0]?.result as number | undefined;
  const lastCoverage = data?.[1]?.result as bigint | undefined;
  const goodStreak = data?.[2]?.result as number | undefined;
  const stageParams = data?.[3]?.result as
    | readonly [number, number, number]
    | undefined;

  const info: StageInfo | undefined =
    stage !== undefined && lastCoverage !== undefined && stageParams
      ? {
          stage,
          lastCoverage,
          weeklyPct: stageParams[0],
          pointCeiling: stageParams[1],
          renewalScoreMask: stageParams[2],
          goodStreak: goodStreak ?? 0,
        }
      : undefined;

  return { info, isLoading, isError, refetch };
}
