"use client";

import type { Address } from "viem";

import { useUserRoundInfo } from "@/hooks/useUserRoundInfo";

// How far back to look for a streak. Each round is ~12h, so 30 rounds is 15
// days of history - generous enough to show a real streak without an
// unbounded (expensive) on-chain read.
const STREAK_LOOKBACK_ROUNDS = 30;

export interface ReferralStreakInfo {
  /** Consecutive most-recent rounds with a nonzero direct bonus. */
  currentStreak: number;
  /** Total rounds (within the lookback window) with a nonzero direct bonus. */
  activeRounds: number;
  /** True if the streak reaches the edge of the lookback window - it may be longer. */
  streakMaxedOut: boolean;
}

/**
 * Derives a "referral streak" purely from real on-chain history: dirEarn is
 * nonzero for a round only when someone registered or upgraded naming this
 * wallet as their direct sponsor and the bonus was actually paid. Counting
 * consecutive nonzero rounds from the most recent one gives an accurate,
 * verifiable streak with zero contract changes and no off-chain indexer.
 */
export function useReferralStreak(address: Address | undefined) {
  const { info, isLoading, isError, refetch } = useUserRoundInfo(address, 0, STREAK_LOOKBACK_ROUNDS);

  let streak: ReferralStreakInfo | undefined;
  if (info) {
    let currentStreak = 0;
    let activeRounds = 0;
    let stillCounting = true;
    for (const raw of info.dirEarn) {
      const earned = parseFloat(raw) > 0;
      if (earned) activeRounds += 1;
      if (stillCounting) {
        if (earned) currentStreak += 1;
        else stillCounting = false;
      }
    }
    streak = {
      currentStreak,
      activeRounds,
      streakMaxedOut: currentStreak === info.dirEarn.length && info.dirEarn.length > 0,
    };
  }

  return { streak, isLoading, isError, refetch };
}
