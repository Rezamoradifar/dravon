"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { WalletMinimal } from "lucide-react";

import { PRIMARY_CHAIN_ID } from "@/lib/wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/contexts/language-context";

export function ConnectWalletGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const { t } = useTranslation();

  const chainId = useChainId();
  const { switchChain, isPending, error } = useSwitchChain();
  if (isConnected && chainId !== PRIMARY_CHAIN_ID) return (
    <Card><CardContent className="space-y-4 py-8 text-center">
      <p>{t("improvements.wrongNetwork")}</p>
      <Button disabled={isPending} onClick={() => switchChain({ chainId: PRIMARY_CHAIN_ID })}>
        {isPending ? t("improvements.loading") : t("improvements.switchNetwork")}
      </Button>
      {error && <p role="alert" className="text-sm text-destructive">{error.message}</p>}
    </CardContent></Card>
  );
  if (isConnected) return <>{children}</>;

  return (
    <Card className="card-glow">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <WalletMinimal className="h-7 w-7" />
        </div>
        <div>
          <p className="font-medium">{t("connectWalletGuard.title")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("connectWalletGuard.body")}</p>
        </div>
        <ConnectButton />
      </CardContent>
    </Card>
  );
}
