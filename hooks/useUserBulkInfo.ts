"use client";

import { useReadContract } from "wagmi";
import type { Address } from "viem";

import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";
import type { UserBulkInfo } from "@/types/contract";

export function useUserBulkInfo(userAddr?: Address) {
  const { address: windowAddress } = useLatestRoundWindow();

  const { data, isLoading, isError, refetch } = useReadContract({
    address: windowAddress,
    abi: roundWindowAbi,
    functionName: "getUserBulkInfo",
    args: userAddr ? [userAddr] : undefined,
    query: { enabled: Boolean(userAddr), refetchInterval: 20_000 },
  });

  const info: UserBulkInfo | undefined = data
    ? {
        roundPoints: data[0],
        roundEnter: data[1],
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
