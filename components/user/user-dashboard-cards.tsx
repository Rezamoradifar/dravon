"use client";

import type { Address } from "viem";
import { Gem, Wallet2, Layers, Users, ArrowUpRight, GitMerge, Sparkles, ShieldCheck } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StatGridSkeleton } from "@/components/shared/stat-grid-skeleton";
import { useUserBulkInfo } from "@/hooks/useUserBulkInfo";
import { formatContractNumericString } from "@/lib/format";

export function UserDashboardCards({ address }: { address?: Address }) {
  const { info, isLoading, isError } = useUserBulkInfo(address);

  if (!address) {
    return <p className="text-sm text-muted-foreground">Connect a wallet or search an address to see its stats.</p>;
  }

  if (isLoading) return <StatGridSkeleton count={8} />;

  if (isError || !info) {
    return <p className="text-sm text-destructive">Could not load data for this wallet. It may not be registered.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard index={0} label="Round Points" icon={Gem} value={formatContractNumericString(info.roundPoints)} />
      <StatCard index={1} label="Total Enter" icon={Wallet2} value={formatContractNumericString(info.roundEnter)} />
      <StatCard index={2} label="Worth" icon={Layers} value={formatContractNumericString(info.worth)} />
      <StatCard index={3} label="Users" icon={Users} value={formatContractNumericString(info.users)} />
      <StatCard index={4} label="Direct Earned" icon={ArrowUpRight} value={formatContractNumericString(info.dirEarned)} />
      <StatCard index={5} label="Binary Earned" icon={GitMerge} value={formatContractNumericString(info.binaryEarned)} />
      <StatCard index={6} label="Earnable" icon={Sparkles} value={formatContractNumericString(info.earnable)} />
      <StatCard index={7} label="Insurance Status" icon={ShieldCheck} value={info.insuranceStatus} />
    </div>
  );
}
