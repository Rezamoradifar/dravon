"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useChainId, useChains } from "wagmi";

import { explorerTxLink } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/language-context";

export function TxProgress({
  isSigning,
  isConfirming,
  isConfirmed,
  hash,
  estimatedGas,
  className,
}: {
  isSigning: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  hash?: string;
  estimatedGas?: bigint | null;
  className?: string;
}) {
  const chainId = useChainId();
  const chains = useChains();
  const chain = chains.find((c) => c.id === chainId);
  const link = hash ? explorerTxLink(chainId, chain?.blockExplorers?.default.url, hash) : "";
  const { t } = useTranslation();

  if (!isSigning && !isConfirming && !isConfirmed && !estimatedGas) return null;

  return (
    <div className={cn("flex flex-col gap-1.5 rounded-lg border bg-muted/40 p-3 text-xs", className)}>
      {estimatedGas != null && !isSigning && !isConfirming && !isConfirmed && (
        <p className="text-muted-foreground">{t("txProgress.estimatedGas", { amount: estimatedGas.toString() })}</p>
      )}
      {isSigning && (
        <p className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("txProgress.waitingForWallet")}
        </p>
      )}
      {isConfirming && (
        <p className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("txProgress.confirmingOnChain")}
        </p>
      )}
      {isConfirmed && (
        <p className="flex items-center gap-2 text-success">
          <CheckCircle2 className="h-3.5 w-3.5" /> {t("txProgress.confirmed")}
        </p>
      )}
      {link && (
        <a href={link} target="_blank" rel="noreferrer noopener" className="text-primary hover:underline">
          {t("txProgress.viewTransaction")}
        </a>
      )}
    </div>
  );
}
