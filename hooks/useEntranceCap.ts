"use client";

import { useReadContract } from "wagmi";

import { FACTORY_ADDRESS } from "@/contracts/addresses";
import { factoryAbi } from "@/contracts/factoryAbi";

/** Reads the real earnable cap for a given entrance tier via factory.entranceCap(). */
export function useEntranceCap(entrance: number) {
  const { data, isLoading } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "entranceCap",
    args: [entrance],
    query: { enabled: entrance > 0 },
  });

  return { cap: data as bigint | undefined, isLoading };
}
