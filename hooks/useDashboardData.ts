"use client";

import { useReadContracts } from "wagmi";

import { WINDOW_ADDRESS } from "@/contracts/addresses";
import { roundWindowAbi } from "@/contracts/roundWindowAbi";

const contract = { address: WINDOW_ADDRESS, abi: roundWindowAbi } as const;

export function useDashboardData() {
  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: [
      { ...contract, functionName: "roundId" },
      { ...contract, functionName: "LatestWindow" },
      { ...contract, functionName: "stabilizedPointValue" },
      { ...contract, functionName: "stableToken" },
      { ...contract, functionName: "wrappedToken" },
      { ...contract, functionName: "isClosed" },
    ],
    query: { refetchInterval: 20_000 },
  });

  const [roundId, latestWindow, stabilizedPointValue, stableToken, wrappedToken, isClosed] =
    data ?? [];

  return {
    isLoading,
    isError,
    refetch,
    roundId: roundId?.result as bigint | undefined,
    latestWindow: latestWindow?.result as `0x${string}` | undefined,
    stabilizedPointValue: stabilizedPointValue?.result as bigint | undefined,
    stableToken: stableToken?.result as `0x${string}` | undefined,
    wrappedToken: wrappedToken?.result as `0x${string}` | undefined,
    isClosed: isClosed?.result as boolean | undefined,
  };
}
