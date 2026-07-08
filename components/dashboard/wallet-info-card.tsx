"use client";

import { useAccount, useBalance, useChainId, useChains } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AddressPill } from "@/components/shared/address-pill";
import { Skeleton } from "@/components/ui/skeleton";

export function WalletInfoCard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const chains = useChains();
  const chain = chains.find((c) => c.id === chainId);
  const { data: balance, isLoading } = useBalance({ address });

  return (
    <Card className="card-glow">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <Wallet2 className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-base">Your Wallet</CardTitle>
        <CardDescription className="ml-auto">{chain?.name ?? "Not connected"}</CardDescription>
      </CardHeader>
      <CardContent>
        {!isConnected || !address ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Connect a wallet to see your balance.</p>
            <ConnectButton />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <AddressPill address={address} chars={6} />
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <span className="font-mono text-lg font-semibold">
                {balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : "-"}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
