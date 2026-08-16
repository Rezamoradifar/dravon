"use client";

import { Coins, Target, Users2, Wallet2, ArrowLeftRight, Award } from "lucide-react";
import { formatUnits } from "viem";

import { PageHeader } from "@/components/shared/page-header";
import { WalletSearch } from "@/components/user/wallet-search";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeeklyWindowInfo } from "@/hooks/useWeeklyWindowInfo";
import { useWeekProgress } from "@/hooks/useWeekProgress";
import { useWalletView } from "@/context/wallet-view-context";
import { useTranslation } from "@/contexts/language-context";

const WEEK_MATCH_UNIT_USD = 500;

function fmtUsd(value: bigint | undefined, decimals = 0): string {
  if (value === undefined) return "-";
  return `$${Number(formatUnits(value, 18)).toLocaleString(undefined, { maximumFractionDigits: decimals })}`;
}

export default function WeeklyFundPage() {
  const { t } = useTranslation();
  const { searchedAddress, setSearchedAddress, viewedAddress } = useWalletView();
  const { week, user, isLoading } = useWeeklyWindowInfo(viewedAddress);
  const { progress } = useWeekProgress(viewedAddress, week?.week);

  const matchedUsd = user ? Number(user.matched) * 10 : 0;
  const progressPct = ((matchedUsd % WEEK_MATCH_UNIT_USD) / WEEK_MATCH_UNIT_USD) * 100;
  const milestonesHit = user ? Math.floor(matchedUsd / WEEK_MATCH_UNIT_USD) : 0;

  return (
    <div>
      <PageHeader title={t("weeklyFundPage.title")} description={t("weeklyFundPage.description")} />

      {/* ---------- General / public section ---------- */}
      <div className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Coins className="h-4 w-4" />
          {t("weeklyFundPage.generalTitle")}
        </h2>
        {isLoading && !week ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : !week ? (
          <p className="text-sm text-muted-foreground">{t("weeklyFundPage.loadError")}</p>
        ) : (
          <Card className="card-glow">
            <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-base">{t("weeklyWindow.title")}</CardTitle>
                <CardDescription>{t("weeklyWindow.weekLabel", { week: week.week.toString() })}</CardDescription>
              </div>
              <Badge variant={week.finished ? "secondary" : week.ended ? "success" : "default"}>
                {week.finished
                  ? t("weeklyWindow.statusFinished")
                  : week.ended
                    ? t("weeklyWindow.statusSettling")
                    : t("weeklyWindow.statusRunning")}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <Coins className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <div className="text-2xl font-bold">{fmtUsd(week.pool)}</div>
                  <div className="text-xs text-muted-foreground">{t("weeklyWindow.pool")}</div>
                </div>
                <div>
                  <Target className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <div className="text-2xl font-bold">{week.points.toString()}</div>
                  <div className="text-xs text-muted-foreground">{t("weeklyWindow.points")}</div>
                </div>
                <div>
                  <Users2 className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <div className="text-2xl font-bold">{week.earners.toString()}</div>
                  <div className="text-xs text-muted-foreground">{t("weeklyWindow.earners")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ---------- Personal section ---------- */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Wallet2 className="h-4 w-4" />
          {t("weeklyFundPage.personalTitle")}
        </h2>

        <div className="mb-4 rounded-xl border bg-card p-4">
          <WalletSearch value={searchedAddress} onChange={setSearchedAddress} />
        </div>

        {!viewedAddress ? (
          <p className="text-sm text-muted-foreground">{t("weeklyFundPage.connectOrSearch")}</p>
        ) : isLoading && !user ? (
          <Skeleton className="h-40" />
        ) : !user ? (
          <p className="text-sm text-muted-foreground">{t("weeklyFundPage.loadError")}</p>
        ) : (
          <Card className="card-glow relative overflow-hidden">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <CardContent className="relative space-y-5 pt-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="text-center">
                  <ArrowLeftRight className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <div className="text-lg font-bold">
                    {progress ? `$${Math.round(progress.leftUsd).toLocaleString("en-US")}` : "-"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{t("weeklyFundPage.leftLeg")}</div>
                </div>
                <div className="text-center">
                  <ArrowLeftRight className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <div className="text-lg font-bold">
                    {progress ? `$${Math.round(progress.rightUsd).toLocaleString("en-US")}` : "-"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{t("weeklyFundPage.rightLeg")}</div>
                </div>
                <div className="text-center">
                  <Target className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <div className="text-lg font-bold">{user.credited.toString()}</div>
                  <div className="text-[11px] text-muted-foreground">{t("weeklyFundPage.creditedPoints")}</div>
                </div>
                <div className="text-center">
                  <Award className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <div className="text-lg font-bold">{fmtUsd(user.owed, 2)}</div>
                  <div className="text-[11px] text-muted-foreground">{t("weeklyFundPage.owed")}</div>
                </div>
              </div>

              <div className="space-y-2 border-t border-border/60 pt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("weeklyWindow.yourProgress")}</span>
                  <span className="font-medium text-foreground">
                    {t("weeklyWindow.milestonesHit", { count: String(milestonesHit) })}
                  </span>
                </div>
                <Progress value={progressPct} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
