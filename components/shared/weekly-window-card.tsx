"use client";

import { Users2, Coins, Target } from "lucide-react";
import { formatUnits, type Address } from "viem";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWeeklyWindowInfo } from "@/hooks/useWeeklyWindowInfo";
import { useTranslation } from "@/contexts/language-context";

const WEEK_MATCH_UNIT_USD = 500;

function fmtUsd(value: bigint | undefined, decimals = 0): string {
  if (value === undefined) return "-";
  return `$${Number(formatUnits(value, 18)).toLocaleString(undefined, {
    maximumFractionDigits: decimals,
  })}`;
}

export function WeeklyWindowCard({ address }: { address?: Address } = {}) {
  const { t } = useTranslation();
  const { week, user, isLoading } = useWeeklyWindowInfo(address);

  if (isLoading && !week) {
    return (
      <Card className="card-glow animate-pulse">
        <CardHeader>
          <div className="h-4 w-40 rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-20 rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!week) return null;

  // matched is in $10-units (leg-worth scale); *10 converts to real USD.
  const matchedUsd = user ? Number(user.matched) * 10 : 0;
  const progressPct = ((matchedUsd % WEEK_MATCH_UNIT_USD) / WEEK_MATCH_UNIT_USD) * 100;
  const milestonesHit = user ? Math.floor(matchedUsd / WEEK_MATCH_UNIT_USD) : 0;

  return (
    <Card className="card-glow relative overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <CardHeader className="relative flex flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">{t("weeklyWindow.title")}</CardTitle>
          <CardDescription>
            {t("weeklyWindow.weekLabel", { week: week.week.toString() })}
          </CardDescription>
        </div>
        <Badge variant={week.finished ? "secondary" : week.ended ? "success" : "default"}>
          {week.finished
            ? t("weeklyWindow.statusFinished")
            : week.ended
              ? t("weeklyWindow.statusSettling")
              : t("weeklyWindow.statusRunning")}
        </Badge>
      </CardHeader>
      <CardContent className="relative space-y-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <Coins className="mx-auto mb-1 h-4 w-4 text-primary" />
            <div className="text-lg font-bold">{fmtUsd(week.pool)}</div>
            <div className="text-[11px] text-muted-foreground">{t("weeklyWindow.pool")}</div>
          </div>
          <div>
            <Target className="mx-auto mb-1 h-4 w-4 text-primary" />
            <div className="text-lg font-bold">{week.points.toString()}</div>
            <div className="text-[11px] text-muted-foreground">{t("weeklyWindow.points")}</div>
          </div>
          <div>
            <Users2 className="mx-auto mb-1 h-4 w-4 text-primary" />
            <div className="text-lg font-bold">{week.earners.toString()}</div>
            <div className="text-[11px] text-muted-foreground">{t("weeklyWindow.earners")}</div>
          </div>
        </div>

        {user && (
          <div className="space-y-2 border-t border-border/60 pt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("weeklyWindow.yourProgress")}</span>
              <span className="font-medium text-foreground">
                {t("weeklyWindow.milestonesHit", { count: String(milestonesHit) })}
              </span>
            </div>
            <Progress value={progressPct} />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {t("weeklyWindow.credited", { credited: user.credited.toString() })}
              </span>
              <span className="font-semibold">{fmtUsd(user.owed, 2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
