/** Explorer receipts take precedence over a browser's potentially stale pending record. */
export function mergeActivity<T extends { hash: string; chainId?: number; timestamp: number }>(local: T[], explorer: T[]): T[] {
  const entries = new Map<string, T>();
  for (const entry of [...local, ...explorer]) entries.set(`${entry.chainId ?? "unknown"}:${entry.hash.toLowerCase()}`, entry);
  // A legacy browser record has no known chain. Replace it only when the explorer verified this hash.
  for (const entry of explorer) entries.delete(`unknown:${entry.hash.toLowerCase()}`);
  return Array.from(entries.values()).sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
}
