"use client";

import { AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { ConnectWalletGuard } from "@/components/shared/connect-wallet-guard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SwapCard } from "@/components/swap/swap-card";
import { useChainId } from "wagmi";
import { SWAP_SUPPORTED_CHAIN_ID } from "@/lib/pancakeswap";

export default function SwapPage() {
  const chainId = useChainId();

  return (
    <div>
      <PageHeader
        title="Swap"
        description="Swap BNB and BEP20 tokens directly through PancakeSwap's Router V2 contract."
      />
      <NetworkBanner />

      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Real swaps, real funds</AlertTitle>
        <AlertDescription>
          This executes real trades on PancakeSwap V2 using your connected wallet. Always verify the
          quote, price impact and minimum received before confirming.
        </AlertDescription>
      </Alert>

      <ConnectWalletGuard>
        {chainId !== SWAP_SUPPORTED_CHAIN_ID ? (
          <p className="text-center text-sm text-muted-foreground">
            Switch to BNB Smart Chain to use the swap.
          </p>
        ) : (
          <SwapCard />
        )}
      </ConnectWalletGuard>
    </div>
  );
}
