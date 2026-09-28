"use client";

import { useReadContract } from "wagmi";
import type { Address } from "viem";

import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";
import { useRoundCounter } from "@/hooks/useRoundCounter";
import type { UserRoundInfo } from "@/types/contract";

/**
 * Per-round history for a wallet between two "rounds ago" bounds (either order).
 *
 * The contract's signature is getUserRoundInfo(user, fromRoundsAgo, RoundsAgo)
 * where fromRoundsAgo is the OLDER bound: it returns fromRoundsAgo - RoundsAgo + 1
 * entries, oldest first, reading round `roundCounter - fromRoundsAgo + i`. So the
 * older bound must be >= the newer one and <= roundCounter, or the call reverts
 * with an arithmetic underflow. Both are enforced here.
 */
export function useUserRoundInfo(userAddr: Address | undefined, boundA: number, boundB: number) {
  const { address: windowAddress } = useLatestRoundWindow();
  const { roundCounter } = useRoundCounter();

  const newer = Math.max(0, Math.min(boundA, boundB));
  const older = roundCounter === undefined ? undefined : Math.min(Math.max(boundA, boundB), roundCounter);
  const ready = Boolean(userAddr) && older !== undefined && older >= newer;

  const { data, isLoading, isError, refetch } = useReadContract({
    address: windowAddress,
    abi: roundWindowAbi,
    functionName: "getUserRoundInfo",
    args: ready ? [userAddr as Address, BigInt(older as number), BigInt(newer)] : undefined,
    query: { enabled: ready },
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
