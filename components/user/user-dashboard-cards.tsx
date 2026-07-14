"use client";

import type { Address } from "viem";
import { Gem, Wallet2, Layers, Users, ArrowUpRight, GitMerge, Sparkles, ShieldCheck } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StatGridSkeleton } from "@/components/shared/stat-grid-skeleton";
import { useUserBulkInfo } from "@/hooks/useUserBulkInfo";
import { formatContractNumericString } from "@/lib/format";
import { useTranslation } from "@/contexts/language-context";

export function UserDashboardCards({ address }: { address?: Address }) {
  const { info, isLoading, isError } = useUserBulkInfo(address);
  const { t } = useTranslation();

  if (!address) {
    return <p className="text-sm text-muted-foreground">{t("userPage.connectOrSearch")}</p>;
  }

  if (isLoading) return <StatGridSkeleton count={8} />;

  if (isError || !info) {
    return <p className="text-sm text-destructive">{t("userPage.loadFailed")}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard index={0} label={t("userPage.roundPoints")} icon={Gem} value={formatContractNumericString(info.roundPoints)} />
      <StatCard index={1} label={t("userPage.totalEnter")} icon={Wallet2} value={formatContractNumericString(info.roundEnter)} />
      <StatCard index={2} label={t("userPage.worth")} icon={Layers} value={formatContractNumericString(info.worth)} />
      <StatCard index={3} label={t("userPage.users")} icon={Users} value={formatContractNumericString(info.users)} />
      <StatCard index={4} label={t("userPage.directEarned")} icon={ArrowUpRight} value={formatContractNumericString(info.dirEarned)} />
      <StatCard index={5} label={t("userPage.binaryEarned")} icon={GitMerge} value={formatContractNumericString(info.binaryEarned)} />
      <StatCard index={6} label={t("userPage.earnable")} icon={Sparkles} value={formatContractNumericString(info.earnable)} />
      <StatCard index={7} label={t("userPage.insuranceStatus")} icon={ShieldCheck} value={info.insuranceStatus} />
    </div>
  );
}
