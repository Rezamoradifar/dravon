"use client";

import * as React from "react";
import type { Address } from "viem";

import { useUserBulkInfo } from "@/hooks/useUserBulkInfo";
import { rankForScore, type RankProgress } from "@/lib/ranks";
import { readRankHistory, recordRankTransition, RANK_HISTORY_EVENT, type RankHistoryEntry } from "@/lib/rank-history";

/**
 * Rank is computed purely from the wallet's real `binaryEarned` (from
 * `getUserBulkInfo`) against the tier ladder in `lib/ranks.ts` - there is no
 * separate rank field on-chain. Upgrade history is tracked locally since the
 * contract emits no events to source it from.
 */
export function useRankProgress(address?: Address) {
  const { info, isLoading, isError } = useUserBulkInfo(address);
  const [history, setHistory] = React.useState<RankHistoryEntry[]>([]);
  const [justUpgraded, setJustUpgraded] = React.useState(false);

  const progress: RankProgress | undefined = info
    ? rankForScore(Number(info.binaryEarned) || 0)
    : undefined;

  React.useEffect(() => {
    if (!address) return;
    function refresh() {
      setHistory(readRankHistory(address as string));
    }
    refresh();
    window.addEventListener(RANK_HISTORY_EVENT, refresh);
    return () => window.removeEventListener(RANK_HISTORY_EVENT, refresh);
  }, [address]);

  React.useEffect(() => {
    if (!address || !progress) return;
    const { changed, wasUpgrade } = recordRankTransition(address, progress.current.id);
    if (changed) {
      setHistory(readRankHistory(address));
      if (wasUpgrade) setJustUpgraded(true);
    }
  }, [address, progress?.current.id]);

  const clearUpgradeFlag = React.useCallback(() => setJustUpgraded(false), []);

  return { progress, history, isLoading, isError, justUpgraded, clearUpgradeFlag };
}
