"use client";

import { useReadContract } from "wagmi";
import type { Address } from "viem";

import { WINDOW_ADDRESS } from "@/contracts/addresses";
import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import type { UserRoundInfo } from "@/types/contract";

export function useUserRoundInfo(
  userAddr: Address | undefined,
  fromRoundsAgo: number,
  roundsAgo: number,
) {
  const { data, isLoading, isError, refetch } = useReadContract({
    address: WINDOW_ADDRESS,
    abi: roundWindowAbi,
    functionName: "getUserRoundInfo",
    args: userAddr ? [userAddr, BigInt(fromRoundsAgo), BigInt(roundsAgo)] : undefined,
    query: { enabled: Boolean(userAddr) },
  });

  const info: UserRoundInfo | undefined = data
    ? {
        points: [...data[0]],
        dirEarn: [...data[1]],
        binaryEarn: [...data[2]],
        dirFlash: [...data[3]],
        binaryFlash: [...data[4]],
      }
    : undefined;

  return { info, isLoading, isError, refetch };
}
