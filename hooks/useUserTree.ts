"use client";

import { useReadContract } from "wagmi";
import type { Address } from "viem";

import { PRIMARY_CHAIN_ID } from "@/lib/wagmi";
import { FACTORY_ADDRESS } from "@/contracts/addresses";
import { factoryAbi } from "@/contracts/factoryAbi";
import { parseContractError } from "@/lib/errors";

// getUserTree moved from the Window to the Factory in SmartContract v2 - it
// no longer needs an open round window, so this reads the factory directly.
export function useUserTree(addr: Address | undefined, len: number) {
  const { data, isLoading, isFetching, isError, error, refetch } = useReadContract({
    chainId: PRIMARY_CHAIN_ID,
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "getUserTree",
    args: addr && Number.isInteger(len) && len >= 1 && len <= 255 ? [addr, BigInt(len)] : undefined,
    query: {
      enabled: Boolean(addr) && Number.isInteger(len) && len >= 1 && len <= 255,
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
