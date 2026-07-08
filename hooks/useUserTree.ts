"use client";

import { useReadContract } from "wagmi";
import type { Address } from "viem";

import { WINDOW_ADDRESS } from "@/contracts/addresses";
import { roundWindowAbi } from "@/contracts/roundWindowAbi";

export function useUserTree(addr: Address | undefined, len: number) {
  const { data, isLoading, isError, refetch } = useReadContract({
    address: WINDOW_ADDRESS,
    abi: roundWindowAbi,
    functionName: "getUserTree",
    args: addr ? [addr, BigInt(len)] : undefined,
    query: { enabled: Boolean(addr) },
  });

  return {
    addresses: data ? [...data] : undefined,
    isLoading,
    isError,
    refetch,
  };
}
