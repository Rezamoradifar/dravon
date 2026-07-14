"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/language-context";

const TreeGraph = dynamic(() => import("@/components/genealogy/tree-graph").then((m) => m.TreeGraph), {
  ssr: false,
  loading: () => <Skeleton className="h-[560px] w-full" />,
});

export default function GenealogyPage() {
  const { searchedAddress, setSearchedAddress, viewedAddress } = useWalletView();

  const [lenInput, setLenInput] = React.useState("15");
  const [len, setLen] = React.useState(15);

  const { addresses, isLoading, isFetching, isError, errorMessage, refetch } = useUserTree(viewedAddress, len);
  const { t } = useTranslation();

  function handleApply() {
    const parsed = Number(lenInput);
    if (Number.isInteger(parsed) && parsed > 0) setLen(parsed);
  }

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

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReferralLinkCard />
        <ReferralGrowthChart address={viewedAddress} />
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
              value={lenInput}
              onChange={(e) => setLenInput(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleApply}>
            {t("genealogyPage.loadTree")}
          </Button>
        </div>
      </div>

      {!viewedAddress && <p className="text-sm text-muted-foreground">{t("genealogyPage.connectOrSearch")}</p>}
      {viewedAddress && isLoading && <Skeleton className="h-[560px] w-full" />}
      {viewedAddress && !isLoading && isError && (
        <p className="text-sm text-destructive">
          {errorMessage ?? t("genealogyPage.loadFailed")}
        </p>
      )}
      {viewedAddress && !isLoading && !isError && addresses && <TreeGraph addresses={addresses} />}
    </div>
  );
}
