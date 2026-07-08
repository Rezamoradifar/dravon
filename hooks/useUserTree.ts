"use client";

import { useReadContract } from "wagmi";
import type { Address } from "viem";

import { WINDOW_ADDRESS } from "@/contracts/addresses";
import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { parseContractError } from "@/lib/errors";

export function useUserTree(addr: Address | undefined, len: number) {
  const { data, isLoading, isFetching, isError, error, refetch } = useReadContract({
    address: WINDOW_ADDRESS,
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
