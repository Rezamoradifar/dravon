"use client";

import { useAccount, useReadContract } from "wagmi";
import type { Address } from "viem";

import { weeklyWindowAbi } from "@/contracts/weeklyWindowAbi";
import { useLatestWeeklyWindow } from "@/hooks/useLatestWeeklyWindow";
import type { UserWeekInfo, WeekBulkInfo } from "@/types/contract";

/**
 * The current week's $500-to-$500 matching pool: how much it holds, how many
 * points/earners it has so far, and one participant's progress toward their next
 * matched-volume milestone. Defaults to the connected wallet; pass `userAddr` to
 * look up someone else (e.g. the User page's wallet-search view).
 */
export function useWeeklyWindowInfo(userAddr?: Address) {
  const { address: windowAddress } = useLatestWeeklyWindow();
  const { address: connectedAddress } = useAccount();
  const userAddress = userAddr ?? connectedAddress;

  const {
    data: bulkData,
    isLoading: isBulkLoading,
    isError: isBulkError,
    refetch: refetchBulk,
  } = useReadContract({
    address: windowAddress,
    abi: weeklyWindowAbi,
    functionName: "getWeekBulkInfo",
    query: { refetchInterval: 20_000 },
  });

  const {
    data: userData,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useReadContract({
    address: windowAddress,
    abi: weeklyWindowAbi,
    functionName: "getUserWeekInfo",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: Boolean(userAddress), refetchInterval: 20_000 },
  });

  const week: WeekBulkInfo | undefined = bulkData
    ? {
        week: bulkData[0],
        pool: bulkData[1],
        points: bulkData[2],
        earners: bulkData[3],
        paidSoFar: bulkData[4],
        ended: bulkData[5],
        finished: bulkData[6],
        pointValue: bulkData[7],
      }
    : undefined;

  const user: UserWeekInfo | undefined = userData
    ? {
        matched: userData[0],
        raw: userData[1],
        credited: userData[2],
        owed: userData[3],
      }
    : undefined;

  return {
    week,
    user,
    isLoading: isBulkLoading || isUserLoading,
    isError: isBulkError,
    refetch: () => {
      refetchBulk();
      refetchUser();
    },
  };
}
