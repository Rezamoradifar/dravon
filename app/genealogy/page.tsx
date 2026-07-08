"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import type { Address } from "viem";

import { PageHeader } from "@/components/shared/page-header";
import { WalletSearch } from "@/components/user/wallet-search";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TreeGraph } from "@/components/genealogy/tree-graph";
import { useUserTree } from "@/hooks/useUserTree";

export default function GenealogyPage() {
  const { address } = useAccount();
  const [searched, setSearched] = React.useState("");
  const target = (searched || address || "") as Address | "";

  const [lenInput, setLenInput] = React.useState("15");
  const [len, setLen] = React.useState(15);

  const { addresses, isLoading, isError } = useUserTree(target || undefined, len);

  function handleApply() {
    const parsed = Number(lenInput);
    if (Number.isInteger(parsed) && parsed > 0) setLen(parsed);
  }

  return (
    <div>
      <PageHeader title="Genealogy" description="Binary tree structure via getUserTree(addr, len)." />

      <div className="mb-6 space-y-4 rounded-xl border bg-card p-4">
        <WalletSearch value={searched} onChange={setSearched} />
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

      {!target && <p className="text-sm text-muted-foreground">Connect a wallet or search an address.</p>}
      {target && isLoading && <Skeleton className="h-[560px] w-full" />}
      {target && !isLoading && isError && (
        <p className="text-sm text-destructive">Could not load the tree for this wallet.</p>
      )}
      {target && !isLoading && !isError && addresses && <TreeGraph addresses={addresses} />}
    </div>
  );
}
