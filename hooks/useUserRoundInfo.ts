"use client";

import { useReadContract } from "wagmi";
import type { Address } from "viem";

import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";
import { useRoundCounter } from "@/hooks/useRoundCounter";
import { historyRange } from "@/lib/contract-v74";
import { CHAIN_ID } from "@/contracts/addresses";
import type { UserRoundInfo } from "@/types/contract";

export function useUserRoundInfo(
  userAddr: Address | undefined,
  fromRoundsAgo: number,
  roundsAgo: number,
) {
  const counter = useRoundCounter();
  const { oldest, newest } = historyRange(fromRoundsAgo, roundsAgo, counter.data ?? 0n);
  const { address: windowAddress } = useLatestRoundWindow();

  const { data, isLoading, isError, refetch } = useReadContract({
    address: windowAddress,
    abi: roundWindowAbi,
    functionName: "getUserRoundInfo",
    args: userAddr ? [userAddr, oldest, newest] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: Boolean(userAddr && windowAddress) && counter.data !== undefined },
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

  return { info, firstRound: (counter.data ?? 0n) - oldest, isLoading: isLoading || counter.isLoading, isError: isError || counter.isError, refetch };
}
