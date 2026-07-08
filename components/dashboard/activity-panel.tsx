"use client";

import * as React from "react";
import { useAccount, useChainId, useChains } from "wagmi";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useExplorerHistory } from "@/hooks/useExplorerHistory";
import { explorerTxLink } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_ICON = {
  pending: Clock,
  confirmed: CheckCircle2,
  failed: XCircle,
} as const;

const STATUS_VARIANT = {
  pending: "secondary",
  confirmed: "success",
  failed: "destructive",
} as const;

export function ActivityPanel() {
  const { address } = useAccount();
  const chainId = useChainId();
  const chains = useChains();
  const chain = chains.find((c) => c.id === chainId);

  const localEntries = useActivityLog(address);
  const { entries: explorerEntries, isConfigured } = useExplorerHistory(address);

  const merged = React.useMemo(() => {
    const map = new Map<string, (typeof localEntries)[number]>();
    for (const entry of [...explorerEntries, ...localEntries]) {
      map.set(entry.hash, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }, [localEntries, explorerEntries]);

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          {isConfigured
            ? "Your on-chain history with this contract, via BscScan."
            : "Transactions submitted from this browser. Add NEXT_PUBLIC_BSCSCAN_API_KEY for full wallet history."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!address ? (
          <p className="text-sm text-muted-foreground">Connect a wallet to see your activity.</p>
        ) : merged.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {merged.map((entry) => {
              const Icon = STATUS_ICON[entry.status];
              const link = explorerTxLink(chainId, chain?.blockExplorers?.default.url, entry.hash);
              return (
                <li key={entry.hash} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        entry.status === "confirmed" && "text-success",
                        entry.status === "failed" && "text-destructive",
                        entry.status === "pending" && "text-muted-foreground",
                      )}
                    />
                    <div>
                      <p className="font-medium">{entry.functionName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[entry.status]}>{entry.status}</Badge>
                    {link && (
                      <a href={link} target="_blank" rel="noreferrer noopener" className="text-xs text-primary hover:underline">
                        View
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
