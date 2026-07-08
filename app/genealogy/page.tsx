"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { PageHeader } from "@/components/shared/page-header";
import { WalletSearch } from "@/components/user/wallet-search";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReferralLinkCard } from "@/components/genealogy/referral-link-card";
import { ReferralGrowthChart } from "@/components/genealogy/referral-growth-chart";
import { useUserTree } from "@/hooks/useUserTree";
import { useWalletView } from "@/context/wallet-view-context";

const TreeGraph = dynamic(() => import("@/components/genealogy/tree-graph").then((m) => m.TreeGraph), {
  ssr: false,
  loading: () => <Skeleton className="h-[560px] w-full" />,
});

export default function GenealogyPage() {
  const { searchedAddress, setSearchedAddress, viewedAddress } = useWalletView();

  const [lenInput, setLenInput] = React.useState("15");
  const [len, setLen] = React.useState(15);

  const { addresses, isLoading, isError } = useUserTree(viewedAddress, len);

  function handleApply() {
    const parsed = Number(lenInput);
    if (Number.isInteger(parsed) && parsed > 0) setLen(parsed);
  }

  return (
    <div>
      <PageHeader title="Genealogy" description="Binary tree structure via getUserTree(addr, len)." />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReferralLinkCard />
        <ReferralGrowthChart address={viewedAddress} />
      </div>

      <div className="mb-6 space-y-4 rounded-xl border bg-card p-4">
        <WalletSearch value={searchedAddress} onChange={setSearchedAddress} />
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="len">Tree size (nodes)</Label>
            <Input
              id="len"
              className="w-32"
              inputMode="numeric"
              value={lenInput}
              onChange={(e) => setLenInput(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleApply}>
            Load tree
          </Button>
        </div>
      </div>

      {!viewedAddress && <p className="text-sm text-muted-foreground">Connect a wallet or search an address.</p>}
      {viewedAddress && isLoading && <Skeleton className="h-[560px] w-full" />}
      {viewedAddress && !isLoading && isError && (
        <p className="text-sm text-destructive">Could not load the tree for this wallet.</p>
      )}
      {viewedAddress && !isLoading && !isError && addresses && <TreeGraph addresses={addresses} />}
    </div>
  );
}
