"use client";

import { useReadContracts, useReadContract } from "wagmi";
import type { Address } from "viem";

import { registrationStatus } from "@/lib/payment-validation";
import { PRIMARY_CHAIN_ID } from "@/lib/wagmi";
import { FACTORY_ADDRESS } from "@/contracts/addresses";
import { factoryAbi } from "@/contracts/factoryAbi";

/**
 * Reads real registration state for a wallet directly from the factory contract:
 * whether it's registered (userAddrExists), its internal userId (addrToId), current
 * entrance tier (getUserData), remaining period-earnable cap (getUserPeriodEarnable)
 * and outstanding installment debt (userDebt).
 * Nothing here is inferred or hardcoded - every field is a live contract read.
 */
export function useUserRegistration(address?: Address) {
  const { data, isError: isStatusError, isLoading: isStatusLoading, refetch: refetchStatus } = useReadContracts({
    contracts: address
      ? [
          { chainId: PRIMARY_CHAIN_ID, address: FACTORY_ADDRESS, abi: factoryAbi, functionName: "userAddrExists", args: [address] },
          { chainId: PRIMARY_CHAIN_ID, address: FACTORY_ADDRESS, abi: factoryAbi, functionName: "addrToId", args: [address] },
        ]
      : [],
    query: { enabled: Boolean(address), refetchInterval: 20_000 },
  });

  const isRegistered = registrationStatus(data?.[0]?.result);
  const statusFailed = isStatusError || data?.some((item) => item.status === "failure");
  const userId = data?.[1]?.result as number | undefined;
  const hasUserId = userId !== undefined && userId > 0;

  const { data: userData, isLoading: isUserDataLoading, isError: isUserDataError, refetch: refetchUserData } = useReadContract({
    chainId: PRIMARY_CHAIN_ID,
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "getUserData",
    args: hasUserId ? [userId as number] : undefined,
    query: { enabled: hasUserId, refetchInterval: 20_000 },
  });

  const { data: periodEarnable, isLoading: isEarnableLoading, isError: isEarnableError, refetch: refetchEarnable } = useReadContract({
    chainId: PRIMARY_CHAIN_ID,
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "getUserPeriodEarnable",
    args: hasUserId ? [userId as number] : undefined,
    query: { enabled: hasUserId, refetchInterval: 20_000 },
  });

  const { data: debt, isLoading: isDebtLoading, isError: isDebtError, refetch: refetchDebt } = useReadContract({
    chainId: PRIMARY_CHAIN_ID,
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "userDebt",
    args: hasUserId ? [userId as number] : undefined,
    query: { enabled: hasUserId, refetchInterval: 20_000 },
  });

  const currentEntrance = userData ? Number(userData[8]) : undefined;
  // v7.4: an $11 installment account (booked as entrance 50) still in debt can
  // clear it with chargeAccount(50) for $55. Any other chargeAccount(50) reverts
  // with InvalidTopupTarget(), so only offer it when both conditions hold.
  const canPayOffDebt = currentEntrance === 50 && debt !== undefined && debt > 0n;

  return {
    isRegistered,
    userId,
    currentEntrance,
    periodEarnable,
    debt,
    canPayOffDebt,
    isLoading: isStatusLoading || (hasUserId && (isUserDataLoading || isEarnableLoading || isDebtLoading)),
    isError: Boolean(statusFailed || (hasUserId && (isUserDataError || isEarnableError || isDebtError))),
    refetch: () => Promise.all([refetchStatus(), ...(hasUserId ? [refetchUserData(), refetchEarnable(), refetchDebt()] : [])]),
  };
}
