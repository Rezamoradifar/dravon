"use client";

import { Users, Gem, Coins, TrendingUp, Landmark, Zap, Layers } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StatGridSkeleton } from "@/components/shared/stat-grid-skeleton";
import { AddressPill } from "@/components/shared/address-pill";
import { useMainBulkInfo } from "@/hooks/useMainBulkInfo";
import { formatContractNumericString } from "@/lib/format";
import { useTranslation } from "@/contexts/language-context";

export function RoundOverviewCards({ roundsAgo = 0 }: { roundsAgo?: number }) {
  const { info, isLoading, isError } = useMainBulkInfo(roundsAgo);
  const { t } = useTranslation();

  if (isLoading) return <StatGridSkeleton count={7} />;
  if (isError || !info) return <p className="text-sm text-destructive">{t("roundOverview.loadError")}</p>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        index={0}
        label={t("roundOverview.roundWindow")}
        icon={Layers}
        value={<AddressPill address={info.roundWindow} />}
        hint={t("roundOverview.roundWindowHint")}
      />
      <StatCard index={1} label={t("roundOverview.users")} icon={Users} value={info.userCount.toLocaleString("en-US")} />
      <StatCard index={2} label={t("roundOverview.roundPoints")} icon={Gem} value={info.roundPoints.toLocaleString("en-US")} />
      <StatCard
        index={3}
        label={t("roundOverview.pointValue")}
        icon={Coins}
        value={formatContractNumericString(info.pointValue)}
      />
      <StatCard
        index={4}
        label={t("roundOverview.roundEnteredUSD")}
        icon={TrendingUp}
        value={formatContractNumericString(info.roundEnteredUSD)}
      />
      <StatCard
        index={5}
        label={t("roundOverview.totalEnteredUSD")}
        icon={Landmark}
        value={formatContractNumericString(info.allEnteredUSD)}
      />
      <StatCard
        index={6}
        label={t("roundOverview.nextBinaryPay")}
        icon={Zap}
        value={formatContractNumericString(info.nextBinaryPay)}
      />
    </div>
  );
}
