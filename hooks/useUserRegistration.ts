"use client";

import { useReadContracts, useReadContract } from "wagmi";
import type { Address } from "viem";

import { CHAIN_ID, CONTRACTS_CONFIGURED, FACTORY_ADDRESS } from "@/contracts/addresses";
import { factoryAbi } from "@/contracts/factoryAbi";

/**
 * Reads real registration state for a wallet directly from the factory contract:
 * whether it's registered (userAddrExists), its internal userId (addrToId), current
 * entrance tier (getUserData) and remaining period-earnable cap (getUserPeriodEarnable).
 * Nothing here is inferred or hardcoded - every field is a live contract read.
 */
export function useUserRegistration(address?: Address) {
  const { data, isLoading: isStatusLoading, refetch: refetchStatus } = useReadContracts({
    contracts: address
      ? [
          { address: FACTORY_ADDRESS, chainId: CHAIN_ID, abi: factoryAbi, functionName: "userAddrExists", args: [address] },
          { address: FACTORY_ADDRESS, chainId: CHAIN_ID, abi: factoryAbi, functionName: "addrToId", args: [address] },
        ]
      : [],
    query: { enabled: CONTRACTS_CONFIGURED && Boolean(address), refetchInterval: 20_000 },
  });

  const isRegistered = Boolean(data?.[0]?.result);
  const userId = data?.[1]?.result as number | undefined;
  const hasUserId = userId !== undefined && userId > 0;

  const { data: userData, isLoading: isUserDataLoading } = useReadContract({
    address: FACTORY_ADDRESS, chainId: CHAIN_ID,
    abi: factoryAbi,
    functionName: "getUserData",
    args: hasUserId ? [userId as number] : undefined,
    query: { enabled: CONTRACTS_CONFIGURED && hasUserId, refetchInterval: 20_000 },
  });

  const { data: periodEarnable, isLoading: isEarnableLoading } = useReadContract({
    address: FACTORY_ADDRESS, chainId: CHAIN_ID,
    abi: factoryAbi,
    functionName: "getUserPeriodEarnable",
    args: hasUserId ? [userId as number] : undefined,
    query: { enabled: CONTRACTS_CONFIGURED && hasUserId, refetchInterval: 20_000 },
  });

  const { data: topupState, isLoading: isTopupLoading, refetch: refetchTopup } = useReadContracts({
    contracts: hasUserId ? [
      { address: FACTORY_ADDRESS, chainId: CHAIN_ID, abi: factoryAbi, functionName: "userDebt", args: [userId as number] },
      { address: FACTORY_ADDRESS, chainId: CHAIN_ID, abi: factoryAbi, functionName: "_userTopupsSinceFlash", args: [userId as number] },
    ] : [],
    query: { enabled: CONTRACTS_CONFIGURED && hasUserId, refetchInterval: 15_000 },
  });
  const debt = topupState?.[0]?.result as bigint | undefined;
  const topupsSinceFlash = topupState?.[1]?.result as bigint | undefined;

  const currentEntrance = userData ? Number(userData[8]) : undefined;

  return {
    isRegistered,
    userId,
    currentEntrance,
    periodEarnable,
    debt,
    topupsSinceFlash,
    isLoading: isStatusLoading || (hasUserId && (isUserDataLoading || isEarnableLoading || isTopupLoading)),
    refetch: () => { void refetchStatus(); void refetchTopup(); },
  };
}
