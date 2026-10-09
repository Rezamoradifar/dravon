"use client";

import * as React from "react";
import { useAccount, useChains } from "wagmi";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useExplorerHistory } from "@/hooks/useExplorerHistory";
import { mergeActivity } from "@/lib/activity-history";
import { explorerTxLink } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/language-context";

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
  const chains = useChains();

  const localEntries = useActivityLog(address);
  const { entries: explorerEntries, isConfigured, isLoading, isError } = useExplorerHistory(address);
  const { t, locale } = useTranslation();

  const merged = React.useMemo(() => {
    return mergeActivity(localEntries, explorerEntries);
  }, [localEntries, explorerEntries]);

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>{t("activityPanel.title")}</CardTitle>
        <CardDescription>
          {isConfigured ? t("activityPanel.descriptionConfigured") : t("activityPanel.descriptionUnconfigured")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {address && isError && <p role="status" className="mb-3 text-xs text-muted-foreground">{t("improvements.historyError")}</p>}
        {!address ? (
          <p className="text-sm text-muted-foreground">{t("activityPanel.connectPrompt")}</p>
        ) : merged.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t(isLoading ? "improvements.loading" : "activityPanel.noTransactions")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {merged.map((entry) => {
              const Icon = STATUS_ICON[entry.status];
              const chain = chains.find((c) => c.id === entry.chainId);
              const link = entry.chainId ? explorerTxLink(entry.chainId, chain?.blockExplorers?.default.url, entry.hash) : undefined;
              return (
                <li key={`${entry.chainId ?? "unknown"}:${entry.hash}`} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
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
                        {new Date(entry.timestamp).toLocaleString(locale)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[entry.status]}>{t(`improvements.${entry.status}`)}</Badge>
                    {link && (
                      <a href={link} target="_blank" rel="noreferrer noopener" className="text-xs text-primary hover:underline">
                        {t("common.view")}
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
