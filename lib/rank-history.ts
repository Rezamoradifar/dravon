export interface RankHistoryEntry {
  tierId: string;
  timestamp: number;
}

const EVENT_NAME = "round-dashboard:rank-history-updated";

function storageKey(address: string) {
  return `round-dashboard:rank-history:${address.toLowerCase()}:v1`;
}

export function readRankHistory(address: string): RankHistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(storageKey(address));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeRankHistory(address: string, entries: RankHistoryEntry[]) {
  try {
    window.localStorage.setItem(storageKey(address), JSON.stringify(entries.slice(0, 50)));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // ignore quota / private-mode errors
  }
}

/**
 * Appends a rank-upgrade entry only if the tier is actually new for this address
 * (the contract has no rank concept or events, so this local log is the only
 * record of "when did this wallet cross into a new tier" - it is derived from
 * real on-chain earnings each time it's checked, never fabricated).
 *
 * `wasUpgrade` is false on the very first record for an address (seeding the
 * log at whatever tier the wallet already sits at shouldn't fire a
 * celebration) and true on every subsequent genuine tier change.
 */
export function recordRankTransition(
  address: string,
  tierId: string,
): { changed: boolean; wasUpgrade: boolean } {
  const history = readRankHistory(address);
  if (history[0]?.tierId === tierId) return { changed: false, wasUpgrade: false };
  const wasUpgrade = history.length > 0;
  writeRankHistory(address, [{ tierId, timestamp: Date.now() }, ...history]);
  return { changed: true, wasUpgrade };
}

export { EVENT_NAME as RANK_HISTORY_EVENT };
