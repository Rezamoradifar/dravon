"use client";

import * as React from "react";
import { Users, Gem, Coins, TrendingUp, Landmark, Zap } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { StatGridSkeleton } from "@/components/shared/stat-grid-skeleton";
import { AddressPill } from "@/components/shared/address-pill";
import { useMainBulkInfo } from "@/hooks/useMainBulkInfo";
import { formatContractNumericString } from "@/lib/format";

export function StatisticsPanel() {
  const [roundsAgoInput, setRoundsAgoInput] = React.useState("0");
  const [roundsAgo, setRoundsAgo] = React.useState(0);

  const { info, isLoading, isError } = useMainBulkInfo(roundsAgo);

  function handleApply() {
    const parsed = Number(roundsAgoInput);
    if (Number.isInteger(parsed) && parsed >= 0) setRoundsAgo(parsed);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="roundsAgo">Rounds ago</Label>
          <Input
            id="roundsAgo"
            className="w-32"
            inputMode="numeric"
            value={roundsAgoInput}
            onChange={(e) => setRoundsAgoInput(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={handleApply}>
          Load round
        </Button>
        {info?.roundWindow && (
          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            Window <AddressPill address={info.roundWindow} />
          </div>
        )}
      </div>

      {isLoading ? (
        <StatGridSkeleton count={6} />
      ) : isError || !info ? (
        <p className="text-sm text-destructive">Failed to load round statistics.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard index={0} label="Users" icon={Users} value={info.userCount.toLocaleString("en-US")} />
          <StatCard
            index={1}
            label="Total Points"
            icon={Gem}
            value={info.roundPoints.toLocaleString("en-US")}
          />
          <StatCard
            index={2}
            label="Point Value"
            icon={Coins}
            value={formatContractNumericString(info.pointValue)}
          />
          <StatCard
            index={3}
            label="Round Volume"
            icon={TrendingUp}
            value={formatContractNumericString(info.roundEnteredUSD)}
            hint="USD entered this round"
          />
          <StatCard
            index={4}
            label="Total Volume"
            icon={Landmark}
            value={formatContractNumericString(info.allEnteredUSD)}
            hint="USD entered all time"
          />
          <StatCard
            index={5}
            label="Next Binary Pay"
            icon={Zap}
            value={formatContractNumericString(info.nextBinaryPay)}
          />
        </div>
      )}
    </div>
  );
}
