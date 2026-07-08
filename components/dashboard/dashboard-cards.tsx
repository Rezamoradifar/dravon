"use client";

import { Hash, Layers, Gem, Coins, Banknote, ShieldCheck, ShieldX } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { AddressPill } from "@/components/shared/address-pill";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTokenMeta } from "@/hooks/useTokenMeta";

export function DashboardCards() {
  const { roundId, latestWindow, stabilizedPointValue, stableToken, wrappedToken, isClosed, isLoading } =
    useDashboardData();

  const stableMeta = useTokenMeta(stableToken);
  const wrappedMeta = useTokenMeta(wrappedToken);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        index={0}
        label="Round ID"
        icon={Hash}
        loading={isLoading}
        value={roundId !== undefined ? `#${roundId.toString()}` : "-"}
      />
      <StatCard
        index={1}
        label="Latest Window"
        icon={Layers}
        loading={isLoading}
        value={latestWindow ? <AddressPill address={latestWindow} /> : "-"}
      />
      <StatCard
        index={2}
        label="Point Value"
        icon={Gem}
        loading={isLoading}
        value={stabilizedPointValue !== undefined ? stabilizedPointValue.toString() : "-"}
        hint="Raw on-chain uint256, no decimal scaling assumed"
      />
      <StatCard
        index={3}
        label="Stable Token"
        icon={Coins}
        loading={isLoading}
        value={stableToken ? <AddressPill address={stableToken} /> : "-"}
        hint={stableMeta.symbol}
      />
      <StatCard
        index={4}
        label="Wrapped Token"
        icon={Banknote}
        loading={isLoading}
        value={wrappedToken ? <AddressPill address={wrappedToken} /> : "-"}
        hint={wrappedMeta.symbol}
      />
      <StatCard
        index={5}
        label="Contract Status"
        icon={isClosed ? ShieldX : ShieldCheck}
        loading={isLoading}
        value={
          <Badge variant={isClosed ? "destructive" : "success"}>
            {isClosed ? "Closed" : "Open"}
          </Badge>
        }
      />
    </div>
  );
}
