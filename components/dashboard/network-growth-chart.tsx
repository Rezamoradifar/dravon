"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoundsHistory } from "@/hooks/useRoundsHistory";
import { useTranslation } from "@/contexts/language-context";

export function NetworkGrowthChart() {
  const { points, isLoading } = useRoundsHistory(8);
  const { t } = useTranslation();

  const data = points.map((p) => ({
    name: p.roundsAgo === 0 ? "Current" : `-${p.roundsAgo}`,
    users: p.userCount,
    volume: p.roundEnteredUSD,
    pointValue: p.pointValue,
  }));

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>{t("networkGrowth.title")}</CardTitle>
        <CardDescription>{t("networkGrowth.description")}</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("networkGrowth.noHistory")}</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(244 75% 59%)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(244 75% 59%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="pointValue" hide />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="users"
                name={t("networkGrowth.usersLegend")}
                stroke="hsl(244 75% 59%)"
                fill="url(#usersFill)"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="volume"
                name={t("networkGrowth.volumeLegend")}
                stroke="hsl(38 92% 50%)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="pointValue"
                type="monotone"
                dataKey="pointValue"
                name={t("networkGrowth.pointValueLegend")}
                stroke="hsl(142 71% 45%)"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
