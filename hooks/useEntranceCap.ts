"use client";

import { useReadContract } from "wagmi";

import { CHAIN_ID, CONTRACTS_CONFIGURED, FACTORY_ADDRESS } from "@/contracts/addresses";
import { factoryAbi } from "@/contracts/factoryAbi";

/** Reads the real earnable cap for a given entrance tier via factory.entranceCap(). */
export function useEntranceCap(entrance: number) {
  const { data, isLoading } = useReadContract({
    address: FACTORY_ADDRESS, chainId: CHAIN_ID,
    abi: factoryAbi,
    functionName: "entranceCap",
    args: [entrance],
    query: { enabled: CONTRACTS_CONFIGURED && entrance > 0 },
  });

  return { cap: data as bigint | undefined, isLoading };
}
