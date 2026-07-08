"use client";

import { useReadContract } from "wagmi";
import type { Address } from "viem";

import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";

export function useBestReferral(direct: Address | undefined) {
  const { address: windowAddress } = useLatestRoundWindow();

  const { data, isLoading, refetch } = useReadContract({
    address: windowAddress,
    abi: roundWindowAbi,
    functionName: "getBestReferralForDirect",
    args: direct ? [direct] : undefined,
    query: { enabled: Boolean(direct) },
  });

  return { referral: data as Address | undefined, isLoading, refetch };
}
