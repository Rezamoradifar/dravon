"use client";

import { AnimatePresence, motion } from "framer-motion";
import { UserPlus, TrendingUp } from "lucide-react";
import { useChainId, useChains } from "wagmi";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AddressPill } from "@/components/shared/address-pill";
import { useNetworkActivityFeed } from "@/hooks/useNetworkActivityFeed";
import { explorerTxLink, shortenAddress } from "@/lib/format";
import { useTranslation } from "@/contexts/language-context";

function relativeTime(timestamp: number, locale: "en" | "fa") {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  const rtf = new Intl.RelativeTimeFormat(locale === "fa" ? "fa" : "en", { numeric: "auto" });
  if (seconds < 60) return rtf.format(-seconds, "second");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  return rtf.format(-Math.floor(hours / 24), "day");
}

export function NetworkActivityFeed() {
  const { entries, isConfigured } = useNetworkActivityFeed();
  const { t, locale } = useTranslation();
  const chainId = useChainId();
  const chains = useChains();
  const chain = chains.find((c) => c.id === chainId);

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>{t("networkActivityFeed.title")}</CardTitle>
        <CardDescription>{t("networkActivityFeed.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {!isConfigured ? (
          <p className="text-sm text-muted-foreground">{t("networkActivityFeed.notConfigured")}</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("networkActivityFeed.empty")}</p>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {entries.map((entry) => {
                const isBegin = entry.functionName === "begin";
                const link = explorerTxLink(chainId, chain?.blockExplorers?.default.url, entry.hash);
                const label = entry.packageName
                  ? t(isBegin ? "networkActivityFeed.joined" : "networkActivityFeed.toppedUp", {
                      package: entry.packageName,
                    })
                  : t(isBegin ? "networkActivityFeed.joinedRaw" : "networkActivityFeed.toppedUpRaw", {
                      entrance: entry.entrance,
                    });

                return (
                  <motion.li
                    key={entry.hash}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 p-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full " +
                          (isBegin ? "bg-primary/10 text-primary" : "bg-success/10 text-success")
                        }
                      >
                        {isBegin ? <UserPlus className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">
                          {link ? (
                            <a href={link} target="_blank" rel="noreferrer noopener" className="hover:underline">
                              {shortenAddress(entry.from, 5)}
                            </a>
                          ) : (
                            <AddressPill address={entry.from} chars={5} />
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {relativeTime(entry.timestamp, locale)}
                    </span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
