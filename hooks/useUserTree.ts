"use client";

import { useReadContract } from "wagmi";
import type { Address } from "viem";

import { FACTORY_ADDRESS } from "@/contracts/addresses";
import { factoryAbi } from "@/contracts/factoryAbi";
import { parseContractError } from "@/lib/errors";

// getUserTree moved from the Window to the Factory in SmartContract v2 - it
// no longer needs an open round window, so this reads the factory directly.
export function useUserTree(addr: Address | undefined, len: number) {
  const { data, isLoading, isFetching, isError, error, refetch } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
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
