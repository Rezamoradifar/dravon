"use client";

import { Flame } from "lucide-react";
import type { Address } from "viem";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useReferralStreak } from "@/hooks/useReferralStreak";
import { useTranslation } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

const TIERS = [
  { min: 14, key: "legendary", color: "text-amber-400", ring: "ring-amber-400/30", glow: "shadow-[0_0_24px_-6px_rgba(251,191,36,0.55)]" },
  { min: 7, key: "strong", color: "text-primary", ring: "ring-primary/30", glow: "shadow-[0_0_24px_-6px_hsl(var(--primary)/0.5)]" },
  { min: 3, key: "rising", color: "text-sky-500", ring: "ring-sky-500/30", glow: "shadow-[0_0_24px_-6px_rgba(14,165,233,0.5)]" },
  { min: 1, key: "spark", color: "text-orange-400", ring: "ring-orange-400/30", glow: "shadow-[0_0_24px_-6px_rgba(251,146,60,0.5)]" },
] as const;

function tierFor(streak: number) {
  return TIERS.find((t) => streak >= t.min);
}

/** Rounds are ~12h each. */
function roundsToDays(rounds: number): number {
  return rounds * 0.5;
}

export function ReferralStreakBadge({ address }: { address?: Address }) {
  const { streak, isLoading, isError } = useReferralStreak(address);
  const { t } = useTranslation();

  if (!address) {
    return (
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-base">{t("referralStreak.title")}</CardTitle>
          <CardDescription>{t("referralStreak.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("referralStreak.connectOrSearch")}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && !streak) {
    return (
      <Card className="card-glow animate-pulse">
        <CardHeader>
          <div className="h-4 w-32 rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-16 rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!streak) {
    // getUserRoundInfo can revert on-chain for a real, registered wallet when
    // the contract's own round arithmetic has too little history to work
    // with yet (observed directly against the live window) - show that as a
    // clear "not yet available" state instead of silently rendering nothing.
    return (
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-base">{t("referralStreak.title")}</CardTitle>
          <CardDescription>{t("referralStreak.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isError ? t("referralStreak.unavailable") : t("referralStreak.noStreak")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const tier = tierFor(streak.currentStreak);

  return (
    <Card className={cn("card-glow relative overflow-hidden", tier && `ring-1 ${tier.ring}`)}>
      {tier && <div className={cn("pointer-events-none absolute inset-0 opacity-40", tier.glow)} />}
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className={cn("h-5 w-5", tier?.color ?? "text-muted-foreground")} />
          {t("referralStreak.title")}
        </CardTitle>
        <CardDescription>{t("referralStreak.description")}</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-3">
        {streak.currentStreak === 0 ? (
          <p className="text-sm text-muted-foreground">{t("referralStreak.noStreak")}</p>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-3xl font-bold", tier?.color)}>
                {streak.currentStreak}
                {streak.streakMaxedOut ? "+" : ""}
              </span>
              <span className="text-sm text-muted-foreground">
                {t("referralStreak.rounds", { days: roundsToDays(streak.currentStreak).toFixed(1) })}
              </span>
            </div>
            {tier && <p className="text-sm font-medium">{t(`referralStreak.tier.${tier.key}`)}</p>}
          </>
        )}
        <p className="border-t border-border/60 pt-3 text-xs text-muted-foreground">
          {t("referralStreak.activeRounds", { count: String(streak.activeRounds) })}
        </p>
      </CardContent>
    </Card>
  );
}
