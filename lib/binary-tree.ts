import { zeroAddress } from "viem";

/**
 * getUserTree returns a flat address[] in breadth-first (heap) order: the
 * children of node i live at 2i+1 and 2i+2. Counts non-empty addresses in the
 * subtree rooted at rootIndex - purely derived from data already fetched for
 * the genealogy tree, no extra reads.
 */
export function countSubtreeMembers(addresses: string[], rootIndex: number): number {
  if (rootIndex >= addresses.length) return 0;
  const address = addresses[rootIndex];
  const isEmpty = !address || address.toLowerCase() === zeroAddress;
  const self = isEmpty ? 0 : 1;
  return (
    self +
    countSubtreeMembers(addresses, 2 * rootIndex + 1) +
    countSubtreeMembers(addresses, 2 * rootIndex + 2)
  );
}

export function isLeftChildIndex(index: number): boolean {
  return index > 0 && index % 2 === 1;
}
