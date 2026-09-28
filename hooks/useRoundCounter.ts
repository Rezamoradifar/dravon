"use client";
import { useReadContract } from "wagmi";
import { CHAIN_ID, CONTRACTS_CONFIGURED, FACTORY_ADDRESS } from "@/contracts/addresses";
import { factoryAbi } from "@/contracts/factoryAbi";
export function useRoundCounter() {
  return useReadContract({ chainId: CHAIN_ID, address: FACTORY_ADDRESS, abi: factoryAbi,
    functionName: "roundCounter", query: { enabled: CONTRACTS_CONFIGURED, refetchInterval: 15_000 } });
}
