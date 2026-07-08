"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { WalletMinimal } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function ConnectWalletGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();

  if (isConnected) return <>{children}</>;

  return (
    <Card className="card-glow">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <WalletMinimal className="h-7 w-7" />
        </div>
        <div>
          <p className="font-medium">Connect your wallet to continue</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This action requires a connected wallet on the supported network.
          </p>
        </div>
        <ConnectButton />
      </CardContent>
    </Card>
  );
}
