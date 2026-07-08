"use client";

import { useReadContract } from "wagmi";
import type { Address } from "viem";

import { WINDOW_ADDRESS } from "@/contracts/addresses";
import { roundWindowAbi } from "@/contracts/roundWindowAbi";

export function useBestReferral(direct: Address | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: WINDOW_ADDRESS,
    abi: roundWindowAbi,
    functionName: "getBestReferralForDirect",
    args: direct ? [direct] : undefined,
    query: { enabled: Boolean(direct) },
  });

  return { referral: data as Address | undefined, isLoading, refetch };
}
