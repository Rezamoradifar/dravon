"use client";

import { ExternalLink } from "lucide-react";
import { useChainId, useChains } from "wagmi";

import { shortenAddress, explorerAddressLink } from "@/lib/format";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

export function AddressPill({
  address,
  className,
  chars = 4,
}: {
  address?: string;
  className?: string;
  chars?: number;
}) {
  const chainId = useChainId();
  const chains = useChains();
  const chain = chains.find((c) => c.id === chainId);
  const href = address ? explorerAddressLink(chainId, chain?.blockExplorers?.default.url, address) : "";

  if (!address) {
    return <span className={cn("text-muted-foreground", className)}>-</span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-sm", className)}>
      {shortenAddress(address, chars)}
      <CopyButton value={address} />
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="View on explorer"
          className="text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </span>
  );
}
