"use client";

import * as React from "react";

import { PageHeader } from "@/components/shared/page-header";
import { WalletSearch } from "@/components/user/wallet-search";
import { RoundHistoryCharts } from "@/components/charts/round-history-charts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRoundInfo } from "@/hooks/useUserRoundInfo";
import { useWalletView } from "@/context/wallet-view-context";

export default function RoundHistoryPage() {
  const { searchedAddress, setSearchedAddress, viewedAddress } = useWalletView();

  const [fromRoundsAgo, setFromRoundsAgo] = React.useState("0");
  const [roundsAgo, setRoundsAgo] = React.useState("9");
  const [range, setRange] = React.useState({ from: 0, to: 9 });

  const { info, isLoading, isError } = useUserRoundInfo(viewedAddress, range.from, range.to);

  function handleApply() {
    const from = Number(fromRoundsAgo);
    const to = Number(roundsAgo);
    if (Number.isInteger(from) && Number.isInteger(to) && from >= 0 && to >= from) {
      setRange({ from, to });
    }
  }

  return (
    <div>
      <PageHeader title="Round History" description="Points, direct, binary and flash income via getUserRoundInfo()." />

      <div className="mb-6 space-y-4 rounded-xl border bg-card p-4">
        <WalletSearch value={searchedAddress} onChange={setSearchedAddress} />
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="fromRoundsAgo">From rounds ago</Label>
            <Input
              id="fromRoundsAgo"
              className="w-32"
              inputMode="numeric"
              value={fromRoundsAgo}
              onChange={(e) => setFromRoundsAgo(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="roundsAgo">To rounds ago</Label>
            <Input
              id="roundsAgo"
              className="w-32"
              inputMode="numeric"
              value={roundsAgo}
              onChange={(e) => setRoundsAgo(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleApply}>
            Load history
          </Button>
        </div>
      </div>

      {!viewedAddress && <p className="text-sm text-muted-foreground">Connect a wallet or search an address.</p>}

      {viewedAddress && isLoading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      )}

      {viewedAddress && !isLoading && isError && (
        <p className="text-sm text-destructive">Could not load round history for this wallet.</p>
      )}

      {viewedAddress && !isLoading && !isError && info && <RoundHistoryCharts info={info} />}
    </div>
  );
}
