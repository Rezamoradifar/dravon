import { Sprout, Medal, Award, Trophy, Gem, Diamond, Crown, Star, type LucideIcon } from "lucide-react";

/**
 * Rank tiers, ordered ascending. `minBinaryEarned` is the only knob that
 * defines a tier's threshold - edit these numbers (USD, matching the
 * `binaryEarned` field from `getUserBulkInfo`) to retune the whole ladder.
 * Nothing about tier thresholds is duplicated or hardcoded elsewhere.
 */
export interface RankTier {
  id: "starter" | "bronze" | "silver" | "gold" | "platinum" | "diamond" | "elite" | "legend";
  labelKey: string;
  minBinaryEarned: number;
  icon: LucideIcon;
  colorToken: string;
}

export const RANK_TIERS: RankTier[] = [
  { id: "starter", labelKey: "ranks.starter", minBinaryEarned: 0, icon: Sprout, colorToken: "hsl(var(--muted-foreground))" },
  { id: "bronze", labelKey: "ranks.bronze", minBinaryEarned: 100, icon: Medal, colorToken: "#B87333" },
  { id: "silver", labelKey: "ranks.silver", minBinaryEarned: 500, icon: Award, colorToken: "#9CA3AF" },
  { id: "gold", labelKey: "ranks.gold", minBinaryEarned: 2_000, icon: Trophy, colorToken: "#EAB308" },
  { id: "platinum", labelKey: "ranks.platinum", minBinaryEarned: 5_000, icon: Gem, colorToken: "#38BDF8" },
  { id: "diamond", labelKey: "ranks.diamond", minBinaryEarned: 15_000, icon: Diamond, colorToken: "#60A5FA" },
  { id: "elite", labelKey: "ranks.elite", minBinaryEarned: 50_000, icon: Crown, colorToken: "#A78BFA" },
  { id: "legend", labelKey: "ranks.legend", minBinaryEarned: 150_000, icon: Star, colorToken: "#F472B6" },
];

export interface RankProgress {
  current: RankTier;
  next?: RankTier;
  progressPct: number;
  remainingToNext: number;
  score: number;
}

/** Pure function: real binary-earnings score in -> tier + progress out. No randomness, no invented data. */
export function rankForScore(score: number): RankProgress {
  const safeScore = Number.isFinite(score) && score > 0 ? score : 0;

  let current = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (safeScore >= tier.minBinaryEarned) current = tier;
    else break;
  }

  const currentIndex = RANK_TIERS.findIndex((t) => t.id === current.id);
  const next = RANK_TIERS[currentIndex + 1];

  if (!next) {
    return { current, next: undefined, progressPct: 100, remainingToNext: 0, score: safeScore };
  }

  const span = next.minBinaryEarned - current.minBinaryEarned;
  const progressInSpan = safeScore - current.minBinaryEarned;
  const progressPct = span > 0 ? Math.min(100, Math.max(0, (progressInSpan / span) * 100)) : 100;

  return {
    current,
    next,
    progressPct,
    remainingToNext: Math.max(0, next.minBinaryEarned - safeScore),
    score: safeScore,
  };
}
