"use client";

import { CheckCircle2, XCircle, Loader2, Fuel, Hash as HashIcon } from "lucide-react";
import { useChainId, useChains } from "wagmi";

import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import { explorerTxLink, shortenAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/language-context";

export function ActionResultPanel({
  functionSignature,
  estimatedGas,
  isEstimating,
  isSigning,
  isConfirming,
  isConfirmed,
  isFailed,
  hash,
}: {
  functionSignature: string;
  estimatedGas?: bigint | null;
  isEstimating?: boolean;
  isSigning: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  isFailed?: boolean;
  hash?: string;
}) {
  const chainId = useChainId();
  const chains = useChains();
  const chain = chains.find((c) => c.id === chainId);
  const link = hash ? explorerTxLink(chainId, chain?.blockExplorers?.default.url, hash) : "";
  const { t } = useTranslation();

  const status = isFailed
    ? t("actionResult.statusFailed")
    : isConfirmed
      ? t("actionResult.statusSuccess")
      : isConfirming
        ? t("actionResult.statusPending")
        : isSigning
          ? t("actionResult.statusAwaitingSignature")
          : t("actionResult.statusIdle");

  const statusVariant =
    status === t("actionResult.statusSuccess")
      ? "success"
      : status === t("actionResult.statusFailed")
        ? "destructive"
        : status === t("actionResult.statusIdle")
          ? "outline"
          : "secondary";

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3 font-mono text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground">{t("actionResult.function")}</span>
        <span className="truncate">{functionSignature}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground">{t("actionResult.estimatedGas")}</span>
        <span className="flex items-center gap-1">
          <Fuel className="h-3 w-3" />
          {isEstimating ? t("common2.estimating") : estimatedGas != null ? `${estimatedGas.toString()} units` : "-"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground">{t("actionResult.status")}</span>
        <Badge variant={statusVariant} className="gap-1 font-sans">
          {(isSigning || isConfirming) && <Loader2 className="h-3 w-3 animate-spin" />}
          {isConfirmed && <CheckCircle2 className="h-3 w-3" />}
          {isFailed && <XCircle className="h-3 w-3" />}
          {status}
        </Badge>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground">{t("actionResult.txHash")}</span>
        {hash ? (
          <span className="flex items-center gap-1">
            <HashIcon className="h-3 w-3" />
            {shortenAddress(hash, 6)}
            <CopyButton value={hash} />
          </span>
        ) : (
          <span>-</span>
        )}
      </div>
      {link && (
        <div className="pt-1">
          <a
            href={link}
            target="_blank"
            rel="noreferrer noopener"
            className={cn("text-primary hover:underline")}
          >
            {t("actionResult.viewOnExplorer")}
          </a>
        </div>
      )}
    </div>
  );
}
