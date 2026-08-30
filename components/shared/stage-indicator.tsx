"use client";

import { ShieldCheck, ShieldAlert, ShieldHalf, ShieldX } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStageInfo } from "@/hooks/useStageInfo";
import { useTranslation } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

const STAGE_META = {
  1: { icon: ShieldCheck, color: "text-success", bar: "bg-success", ring: "ring-success/30", glow: "shadow-[0_0_24px_-6px_hsl(var(--success)/0.5)]" },
  2: { icon: ShieldHalf, color: "text-sky-500", bar: "bg-sky-500", ring: "ring-sky-500/30", glow: "shadow-[0_0_24px_-6px_rgba(14,165,233,0.5)]" },
  3: { icon: ShieldAlert, color: "text-amber-500", bar: "bg-amber-500", ring: "ring-amber-500/30", glow: "shadow-[0_0_24px_-6px_rgba(245,158,11,0.5)]" },
  4: { icon: ShieldX, color: "text-destructive", bar: "bg-destructive", ring: "ring-destructive/30", glow: "shadow-[0_0_24px_-6px_hsl(var(--destructive)/0.5)]" },
} as const;

/** coverage is in hundredths of a round; each round is 12h. */
function coverageToDays(coverage: bigint): number {
  return (Number(coverage) / 100) * 0.5;
}

/** How many of every 4 top-up renewals mint upline points at this stage. */
function scoredRenewals(mask: number): number {
  let count = 0;
  for (let bit = 0; bit < 4; bit++) {
    if ((mask >> bit) & 1) count++;
  }
  return count;
}

export function StageIndicator() {
  const { t } = useTranslation();
  const { info, isLoading } = useStageInfo();

  if (isLoading && !info) {
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

  if (!info) return null;

  const stage = (info.stage >= 1 && info.stage <= 4 ? info.stage : 4) as 1 | 2 | 3 | 4;
  const meta = STAGE_META[stage];
  const Icon = meta.icon;
  const days = coverageToDays(info.lastCoverage);
  // Visual runway cap at ~7 days (stage 1's threshold is 5d) so the bar never
  // reads as "full" in a way that implies more headroom than the ladder grants.
  const barPct = Math.min(100, (days / 7) * 100);

  return (
    <Card className={cn("card-glow relative overflow-hidden ring-1", meta.ring)}>
      <div className={cn("pointer-events-none absolute inset-0 opacity-40", meta.glow)} />
      <CardHeader className="relative flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className={cn("h-5 w-5", meta.color)} />
            {t("stageIndicator.title")}
          </CardTitle>
          <CardDescription>{t(`stageIndicator.stage${stage}.label`)}</CardDescription>
        </div>
        <div className={cn("rounded-full px-3 py-1 text-sm font-bold", meta.color, "bg-current/10")}>
          {t("stageIndicator.stageBadge", { stage: String(stage) })}
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <p className="text-sm text-muted-foreground">{t(`stageIndicator.stage${stage}.description`)}</p>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("stageIndicator.runway")}</span>
            <span className="font-medium text-foreground">
              {t("stageIndicator.runwayDays", { days: days.toFixed(1) })}
            </span>
          </div>
          <Progress value={barPct} indicatorClassName={meta.bar} />
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-border/60 pt-4 text-center">
          <div>
            <div className="text-lg font-bold">{info.weeklyPct}%</div>
            <div className="text-[11px] text-muted-foreground">{t("stageIndicator.weeklyPct")}</div>
          </div>
          <div>
            <div className="text-lg font-bold">{info.pointCeiling}</div>
            <div className="text-[11px] text-muted-foreground">{t("stageIndicator.pointCeiling")}</div>
          </div>
          <div>
            <div className="text-lg font-bold">{scoredRenewals(info.renewalScoreMask)}/4</div>
            <div className="text-[11px] text-muted-foreground">{t("stageIndicator.renewalScore")}</div>
          </div>
        </div>

        {stage > 1 && (
          <p className="text-[11px] text-muted-foreground">
            {t("stageIndicator.goodStreak", { streak: String(info.goodStreak), needed: "2" })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
