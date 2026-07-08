"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useChainId, useChains } from "wagmi";

import { explorerTxLink } from "@/lib/format";
import { cn } from "@/lib/utils";

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

  if (!isSigning && !isConfirming && !isConfirmed && !estimatedGas) return null;

  return (
    <div className={cn("flex flex-col gap-1.5 rounded-lg border bg-muted/40 p-3 text-xs", className)}>
      {estimatedGas != null && !isSigning && !isConfirming && !isConfirmed && (
        <p className="text-muted-foreground">Estimated gas: {estimatedGas.toString()} units</p>
      )}
      {isSigning && (
        <p className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Waiting for wallet confirmation...
        </p>
      )}
      {isConfirming && (
        <p className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Confirming on-chain...
        </p>
      )}
      {isConfirmed && (
        <p className="flex items-center gap-2 text-success">
          <CheckCircle2 className="h-3.5 w-3.5" /> Confirmed
        </p>
      )}
      {link && (
        <a href={link} target="_blank" rel="noreferrer noopener" className="text-primary hover:underline">
          View transaction
        </a>
      )}
    </div>
  );
}
