"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExperienceCopy } from "@/lib/experience-copy";
export function WalletButton({ compact = false }: { compact?: boolean }) {
  const c = useExperienceCopy();
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected = ready && account && chain;
        const label = connected
          ? chain.unsupported
            ? c.changeNetwork
            : account.displayName
          : c.connect;
        return (
          <Button
            disabled={!ready}
            onClick={
              connected
                ? chain.unsupported
                  ? openChainModal
                  : openAccountModal
                : openConnectModal
            }
            className="gap-2"
            size={compact ? "sm" : "default"}
            aria-label={label}
          >
            <Wallet className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className={compact ? "hidden sm:inline" : ""}>{label}</span>
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
}
