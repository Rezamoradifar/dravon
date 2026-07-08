"use client";

import { Users, Gem, Coins, TrendingUp, Landmark, Zap, Layers } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StatGridSkeleton } from "@/components/shared/stat-grid-skeleton";
import { AddressPill } from "@/components/shared/address-pill";
import { useMainBulkInfo } from "@/hooks/useMainBulkInfo";
import { formatContractNumericString } from "@/lib/format";

export function RoundOverviewCards({ roundsAgo = 0 }: { roundsAgo?: number }) {
  const { info, isLoading, isError } = useMainBulkInfo(roundsAgo);

  if (isLoading) return <StatGridSkeleton count={7} />;
  if (isError || !info) return <p className="text-sm text-destructive">Failed to load round statistics.</p>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        index={0}
        label="Round Window"
        icon={Layers}
        value={<AddressPill address={info.roundWindow} />}
        hint="roundWindow from getMainBulkInfo"
      />
      <StatCard index={1} label="Users" icon={Users} value={info.userCount.toLocaleString("en-US")} />
      <StatCard index={2} label="Round Points" icon={Gem} value={info.roundPoints.toLocaleString("en-US")} />
      <StatCard
        index={3}
        label="Point Value"
        icon={Coins}
        value={formatContractNumericString(info.pointValue)}
      />
      <StatCard
        index={4}
        label="Round Entered USD"
        icon={TrendingUp}
        value={formatContractNumericString(info.roundEnteredUSD)}
      />
      <StatCard
        index={5}
        label="Total Entered USD"
        icon={Landmark}
        value={formatContractNumericString(info.allEnteredUSD)}
      />
      <StatCard
        index={6}
        label="Next Binary Pay"
        icon={Zap}
        value={formatContractNumericString(info.nextBinaryPay)}
      />
    </div>
  );
}
