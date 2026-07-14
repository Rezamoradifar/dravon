"use client";

import { AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SwapCard } from "@/components/swap/swap-card";
import { useChainId } from "wagmi";
import { SWAP_SUPPORTED_CHAIN_ID } from "@/lib/pancakeswap";
import { useTranslation } from "@/contexts/language-context";

export default function SwapPage() {
  const chainId = useChainId();
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("swapPage.title")}
        description={t("swapPage.description")}
      />
      <NetworkBanner />

      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t("swapPage.disclaimerTitle")}</AlertTitle>
        <AlertDescription>{t("swapPage.disclaimerBody")}</AlertDescription>
      </Alert>

      <ConnectWalletGuard>
        {chainId !== SWAP_SUPPORTED_CHAIN_ID ? (
          <p className="text-center text-sm text-muted-foreground">{t("swapPage.switchToBsc")}</p>
        ) : (
          <SwapCard />
        )}
      </ConnectWalletGuard>
    </div>
  );
}
