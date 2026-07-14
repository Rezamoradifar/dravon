"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PRIMARY_CHAIN_ID } from "@/lib/wagmi";
import { useTranslation } from "@/contexts/language-context";

export function NetworkBanner() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const { t } = useTranslation();

  if (!isConnected || chainId === PRIMARY_CHAIN_ID) return null;

  return (
    <Alert variant="warning" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{t("networkBanner.title")}</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        <span>{t("networkBanner.description")}</span>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => switchChain({ chainId: PRIMARY_CHAIN_ID })}
        >
          {isPending ? t("networkBanner.switching") : t("networkBanner.switchNetwork")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
