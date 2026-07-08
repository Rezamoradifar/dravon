"use client";

import { useAccount } from "wagmi";
import { ADMIN_ADDRESS } from "@/contracts/addresses";

export function useIsAdmin() {
  const { address } = useAccount();
  if (!ADMIN_ADDRESS || !address) return false;
  return address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
}
