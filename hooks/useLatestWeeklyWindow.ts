"use client";

import { useReadContract, useWatchContractEvent } from "wagmi";
import { isAddress, zeroAddress } from "viem";
import { CHAIN_ID, FACTORY_ADDRESS, CONTRACTS_CONFIGURED } from "@/contracts/addresses";
import { factoryAbi } from "@/contracts/factoryAbi";

/** v7.4 windows are discovered live. Retired localStorage caches are never read. */
export function useLatestWeeklyWindow() {
  const { data, isLoading, isError, refetch } = useReadContract({
    chainId: CHAIN_ID,
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "weeklyWindow",
    query: { enabled: CONTRACTS_CONFIGURED, refetchInterval: 15_000 },
  });
  useWatchContractEvent({
    chainId: CHAIN_ID,
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    eventName: "WeeklyWindowCreated",
    enabled: CONTRACTS_CONFIGURED,
    onLogs: () => { void refetch(); },
  });
  const resolved = !isError && data && isAddress(data) && data !== zeroAddress ? data : undefined;
  return { address: resolved, isConfirmed: Boolean(resolved), isLoading, isError, refetch };
}
