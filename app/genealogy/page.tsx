"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { zeroAddress, type Address } from "viem";

import { PageHeader } from "@/components/shared/page-header";
import { WalletSearch } from "@/components/user/wallet-search";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReferralLinkCard } from "@/components/genealogy/referral-link-card";
import { ReferralGrowthChart } from "@/components/genealogy/referral-growth-chart";
import { ReferralStreakBadge } from "@/components/genealogy/referral-streak-badge";
import { NodeDetailPanel } from "@/components/genealogy/node-detail-panel";
import { useUserTree } from "@/hooks/useUserTree";
import { useWalletView } from "@/context/wallet-view-context";
import { countSubtreeMembers } from "@/lib/binary-tree";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/language-context";

const TreeGraph = dynamic(() => import("@/components/genealogy/tree-graph").then((m) => m.TreeGraph), {
  ssr: false,
  loading: () => <Skeleton className="h-[560px] w-full" />,
});

export default function GenealogyPage() {
  const { searchedAddress, setSearchedAddress, viewedAddress } = useWalletView();

  const [viewMode, setViewMode] = React.useState<"tree" | "list">("tree");
  const [sizeError, setSizeError] = React.useState(false);
  const [memberSearch, setMemberSearch] = React.useState("");
  const [lenInput, setLenInput] = React.useState("15");
  const [len, setLen] = React.useState(15);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const { addresses, isLoading, isFetching, isError, errorMessage, refetch } = useUserTree(viewedAddress, len);
  const { t } = useTranslation();

  React.useEffect(() => { setSelectedIndex(null); setMemberSearch(""); }, [viewedAddress, len]);

  function handleApply() {
    const parsed = Number(lenInput);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 255) { setLen(parsed); setSizeError(false); }
    else setSizeError(true);
  }

  function handleNodeClick(index: number, address: string) {
    if (!address || address.toLowerCase() === zeroAddress) return;
    setSelectedIndex(index);
  }

  const selectedAddress =
    selectedIndex !== null && addresses && addresses[selectedIndex]?.toLowerCase() !== zeroAddress ? (addresses[selectedIndex] as Address | undefined) : undefined;
  const selectedMemberCount =
    selectedIndex !== null && addresses ? countSubtreeMembers(addresses, selectedIndex) : 0;

  return (
    <div>
      <PageHeader
        title={t("genealogyPage.title")}
        description={t("genealogyPage.description")}
        actions={
          viewedAddress && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
              {t("genealogyPage.refresh")}
            </Button>
          )
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ReferralLinkCard />
        <ReferralGrowthChart address={viewedAddress} />
        <ReferralStreakBadge address={viewedAddress} />
      </div>

      <div className="mb-6 space-y-4 rounded-xl border bg-card p-4">
        <WalletSearch value={searchedAddress} onChange={setSearchedAddress} />
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="len">{t("genealogyPage.treeSize")}</Label>
            <Input
              id="len"
              className="w-32"
              inputMode="numeric"
              aria-invalid={sizeError}
              aria-describedby={sizeError ? "tree-size-error" : undefined}
              value={lenInput}
              onChange={(e) => setLenInput(e.target.value)}
            />
          </div>
          {[15, 31, 63].map((size) => <Button key={size} variant="outline" aria-pressed={len === size} onClick={() => { setLen(size); setLenInput(String(size)); setSizeError(false); }}>{size}</Button>)}
          <Button variant="outline" onClick={handleApply}>
            {t("genealogyPage.loadTree")}
          </Button>
        </div>
        {sizeError && <p id="tree-size-error" role="alert" className="text-sm text-destructive">{t("improvements.treeLimit")}</p>}
      </div>

      {!viewedAddress && <p className="text-sm text-muted-foreground">{t("genealogyPage.connectOrSearch")}</p>}
      {viewedAddress && isLoading && <Skeleton className="h-[560px] w-full" />}
      {viewedAddress && !isLoading && isError && (
        <p className="text-sm text-destructive">
          {errorMessage ?? t("genealogyPage.loadFailed")}
        </p>
      )}
      {viewedAddress && !isLoading && !isError && addresses && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variant={viewMode === "tree" ? "default" : "outline"} aria-pressed={viewMode === "tree"} onClick={() => setViewMode("tree")}>{t("improvements.tree")}</Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}>{t("improvements.list")}</Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("genealogyPage.nodeHint")}</p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
            {viewMode === "tree" ? <TreeGraph key={`${viewedAddress}-${len}`} addresses={addresses} onNodeClick={handleNodeClick} /> : (
              <div className="space-y-3 rounded-xl border p-4">
                <Label htmlFor="member-search">{t("improvements.members")}</Label>
                <Input id="member-search" dir="ltr" placeholder="0x…" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value.trim())} />
                <ul className="max-h-[480px] space-y-2 overflow-y-auto">
                  {addresses.map((member, index) => member.toLowerCase() !== zeroAddress && member.toLowerCase().includes(memberSearch.toLowerCase()) ? (
                    <li key={index}><button type="button" aria-pressed={selectedIndex === index} className="w-full rounded-lg border p-3 text-start hover:bg-muted" onClick={() => handleNodeClick(index, member)}>
                      <span className="text-xs text-muted-foreground">#{index + 1}</span><span dir="ltr" className="block break-all font-mono text-xs">{member}</span>
                    </button></li>
                  ) : null)}
                </ul>
              </div>
            )}
            <AnimatePresence mode="wait">
              {selectedAddress && (
                <NodeDetailPanel
                  address={selectedAddress}
                  memberCount={selectedMemberCount}
                  onClose={() => setSelectedIndex(null)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
