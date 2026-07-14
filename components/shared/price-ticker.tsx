"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight, Fuel, Activity } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { useNativePrice } from "@/hooks/useNativePrice";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/language-context";

export function PriceTicker() {
  const { symbol, price, change24h, sparkline, source, isLoading } = useNativePrice();
  const { gasPriceGwei, isHealthy, blockNumber } = useNetworkStatus();
  const { t } = useTranslation();

  const isUp = (change24h ?? 0) >= 0;
  const sparklineData = sparkline?.map((p, i) => ({ i, p })) ?? [];

  return (
    <Card className="card-glow overflow-hidden">
      <CardContent className="flex flex-wrap items-center gap-6 p-5">
        <div className="min-w-[140px]">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {symbol} {t("priceTicker.priceSuffix")}
          </p>
          {isLoading || price === undefined ? (
            <Skeleton className="mt-2 h-7 w-24" />
          ) : (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xl font-semibold">
                <AnimatedNumber value={price} decimals={2} prefix="$" />
              </span>
              {change24h !== undefined && (
                <Badge variant={isUp ? "success" : "destructive"} className="gap-1">
                  {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(change24h).toFixed(2)}%
                </Badge>
              )}
            </div>
          )}
          {source && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {source === "coingecko" ? t("priceTicker.viaCoinGecko") : t("priceTicker.viaOracle")}
            </p>
          )}
        </div>

        {sparklineData.length > 2 && (
          <div className="h-12 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={isUp ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor={isUp ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="p"
                  stroke={isUp ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
                  fill="url(#sparklineFill)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Fuel className="h-4 w-4" />
          {gasPriceGwei !== undefined ? `${gasPriceGwei.toFixed(1)} Gwei` : <Skeleton className="h-4 w-16" />}
        </div>

        <div className="ml-auto flex items-center gap-1.5 text-sm">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isHealthy === undefined ? "bg-muted-foreground" : isHealthy ? "bg-success" : "bg-destructive",
            )}
          />
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {blockNumber !== undefined ? `Block #${blockNumber.toString()}` : t("common.connecting")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
