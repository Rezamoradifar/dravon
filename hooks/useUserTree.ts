"use client";

import { useReadContract } from "wagmi";
import type { Address } from "viem";

import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";
import { parseContractError } from "@/lib/errors";

export function useUserTree(addr: Address | undefined, len: number) {
  const { address: windowAddress } = useLatestRoundWindow();

  const { data, isLoading, isFetching, isError, error, refetch } = useReadContract({
    address: windowAddress,
    abi: roundWindowAbi,
    functionName: "getUserTree",
    args: addr ? [addr, BigInt(len)] : undefined,
    query: {
      enabled: Boolean(addr),
      refetchInterval: 20_000,
      retry: 2,
    },
  });

  return {
    addresses: data ? [...data] : undefined,
    isLoading,
    isFetching,
    isError,
    errorMessage: error ? parseContractError(error) : undefined,
    refetch,
  };
}
