"use client";
import { CHAIN_ID } from "@/contracts/addresses";

import { useReadContract } from "wagmi";
import type { Address } from "viem";

import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";
import type { UserBulkInfo } from "@/types/contract";

export function useUserBulkInfo(userAddr?: Address) {
  const { address: windowAddress } = useLatestRoundWindow();

  const { data, isLoading, isError, refetch } = useReadContract({
    address: windowAddress, chainId: CHAIN_ID,
    abi: roundWindowAbi,
    functionName: "getUserBulkInfo",
    args: userAddr ? [userAddr] : undefined,
    query: { enabled: Boolean(userAddr && windowAddress), refetchInterval: 20_000 },
  });

  const info: UserBulkInfo | undefined = data
    ? {
        roundPoints: data[0],
        unmatchedVolume: data[1],
        worth: data[2],
        users: data[3],
        dirEarned: data[4],
        binaryEarned: data[5],
        earnable: data[6],
        insuranceStatus: data[7],
      }
    : undefined;

  return { info, isLoading, isError, refetch };
}
