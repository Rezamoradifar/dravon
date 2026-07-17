"use client";

import type { Address } from "viem";

import { useUserTree } from "@/hooks/useUserTree";
import { countSubtreeMembers } from "@/lib/binary-tree";

/**
 * 63 nodes = 6 levels (1+2+4+8+16+32) of the binary tree from the connected/viewed
 * wallet - deep enough for a meaningful team snapshot from a single getUserTree read.
 */
const TEAM_TREE_LEN = 63;

export function useTeamBreakdown(address?: Address) {
  const { addresses, isLoading, isError, refetch } = useUserTree(address, TEAM_TREE_LEN);

  return {
    leftCount: addresses ? countSubtreeMembers(addresses, 1) : 0,
    rightCount: addresses ? countSubtreeMembers(addresses, 2) : 0,
    isLoading,
    isError,
    refetch,
  };
}
