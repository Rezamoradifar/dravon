"use client";

import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RankBadge } from "@/components/rank/rank-badge";
import { RankHistoryList } from "@/components/rank/rank-history-list";
import { useRankProgress } from "@/hooks/useRankProgress";
import { formatContractNumericString } from "@/lib/format";
import { useTranslation } from "@/contexts/language-context";
import type { Address } from "viem";

export function RankProgressCard({ address }: { address?: Address }) {
  const { progress, history, isLoading, isError } = useRankProgress(address);
  const { t } = useTranslation();

  if (!address) return null;

  if (isLoading) {
    return (
      <Card className="card-glow">
        <CardContent className="p-5">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="mt-4 h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !progress) {
    return (
      <Card className="card-glow">
        <CardContent className="p-5">
          <p className="text-sm text-destructive">{t("rank.loadFailed")}</p>
        </CardContent>
      </Card>
    );
  }

  const { current, next, progressPct, remainingToNext, score } = progress;

  return (
    <Card className="card-glow">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <RankBadge tier={current} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("rank.currentRank")}
            </p>
            <p className="truncate text-lg font-semibold">{t(current.labelKey)}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {t("rank.binaryEarnedLabel")}: {formatContractNumericString(String(score))}
            </p>
          </div>
        </div>

        {next ? (
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t("rank.nextRank")}: {t(next.labelKey)}
              </span>
              <span className="tabular-nums">{progressPct.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: next.colorToken }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
              {t("rank.remaining")}: {formatContractNumericString(String(remainingToNext))}
            </p>
          </div>
        ) : (
          <p className="mt-5 text-xs text-muted-foreground">{t("rank.maxRankReached")}</p>
        )}

        {history.length > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <RankHistoryList history={history} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
