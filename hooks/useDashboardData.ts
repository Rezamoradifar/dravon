"use client";

import { useReadContracts } from "wagmi";

import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";

export function useDashboardData() {
  const { address: windowAddress } = useLatestRoundWindow();
  const contract = { address: windowAddress, abi: roundWindowAbi } as const;

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
    windowAddress,
    roundId: roundId?.result as bigint | undefined,
    latestWindow: latestWindow?.result as `0x${string}` | undefined,
    stabilizedPointValue: stabilizedPointValue?.result as bigint | undefined,
    stableToken: stableToken?.result as `0x${string}` | undefined,
    wrappedToken: wrappedToken?.result as `0x${string}` | undefined,
    isClosed: isClosed?.result as boolean | undefined,
  };
}
