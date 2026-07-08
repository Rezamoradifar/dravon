"use client";

import { useReadContracts } from "wagmi";
import type { Address } from "viem";

import { erc20Abi } from "@/contracts/erc20Abi";

export function useTokenMeta(token?: Address) {
  const { data, isLoading } = useReadContracts({
    contracts: token
      ? [
          { address: token, abi: erc20Abi, functionName: "symbol" },
          { address: token, abi: erc20Abi, functionName: "decimals" },
        ]
      : [],
    query: { enabled: Boolean(token) },
  });

  return {
    symbol: data?.[0]?.result as string | undefined,
    decimals: data?.[1]?.result as number | undefined,
    isLoading,
  };
}
