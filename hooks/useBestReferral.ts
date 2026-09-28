"use client";

import { useReadContract } from "wagmi";
import type { Address } from "viem";

import { CHAIN_ID } from "@/contracts/addresses";
import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";

export function useBestReferral(direct: Address | undefined) {
  const { address: windowAddress } = useLatestRoundWindow();

  const { data, isLoading, refetch } = useReadContract({
    address: windowAddress,
    chainId: CHAIN_ID,
    abi: roundWindowAbi,
    functionName: "getBestReferralForDirect",
    args: direct ? [direct] : undefined,
    query: { enabled: Boolean(direct && windowAddress) },
  });

  return { referral: data as Address | undefined, isLoading, refetch };
}
