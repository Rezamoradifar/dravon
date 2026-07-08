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

export function NetworkGrowthChart() {
  const { points, isLoading } = useRoundsHistory(8);

  const data = points.map((p) => ({
    name: p.roundsAgo === 0 ? "Current" : `-${p.roundsAgo}`,
    users: p.userCount,
    volume: p.roundEnteredUSD,
  }));

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>Network Growth</CardTitle>
        <CardDescription>Users and round volume across recent rounds via getMainBulkInfo.</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No round history available yet.</p>
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
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="users"
                name="Users"
                stroke="hsl(244 75% 59%)"
                fill="url(#usersFill)"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="volume"
                name="Round Volume (USD)"
                stroke="hsl(38 92% 50%)"
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
