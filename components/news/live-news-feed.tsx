"use client";

import Image from "next/image";
import { Newspaper, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCryptoNews } from "@/hooks/useCryptoNews";
import { useTranslation } from "@/contexts/language-context";

function timeAgo(pubDate: string, t: (path: string, params?: Record<string, string | number>) => string): string {
  const ms = Date.now() - new Date(pubDate).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return t("newsPage.justNow");
  if (minutes < 60) return t("newsPage.minutesAgo", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("newsPage.hoursAgo", { n: hours });
  const days = Math.floor(hours / 24);
  return t("newsPage.daysAgo", { n: days });
}

export function LiveNewsFeed() {
  const { items, isLoading, error } = useCryptoNews();
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2.5">
        <h2 className="text-lg font-semibold">{t("newsPage.liveNewsTitle")}</h2>
        {isLoading ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3 animate-spin" />
            {t("newsPage.loading")}
          </span>
        ) : !error && items.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {t("newsPage.live")}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="card-glow h-72 animate-pulse" />
          ))}
        </div>
      ) : error || items.length === 0 ? (
        <Card className="card-glow border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Newspaper className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">{t("newsPage.liveUnavailable")}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{t("newsPage.liveUnavailableBody")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <a key={item.link} href={item.link} target="_blank" rel="noopener noreferrer" className="group">
              <Card className="card-glow flex h-full flex-col overflow-hidden">
                <div className="relative h-36 w-full overflow-hidden bg-muted">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Newspaper className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                  {item.category && (
                    <Badge variant="secondary" className="absolute start-2 top-2 backdrop-blur-sm">
                      {item.category}
                    </Badge>
                  )}
                </div>
                <CardContent className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="line-clamp-2 flex-1 text-xs text-muted-foreground">{item.excerpt}</p>
                  <span className="text-[11px] text-muted-foreground/70">{timeAgo(item.pubDate, t)}</span>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
