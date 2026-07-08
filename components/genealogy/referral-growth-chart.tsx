"use client";

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { Address } from "viem";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRoundInfo } from "@/hooks/useUserRoundInfo";

export function ReferralGrowthChart({ address }: { address?: Address }) {
  const { info, isLoading } = useUserRoundInfo(address, 0, 7);

  const data = info?.points.map((p, i) => ({ round: `R${i + 1}`, points: Number(p) })) ?? [];

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-base">Points Across Recent Rounds</CardTitle>
        <CardDescription>From getUserRoundInfo - a proxy for this wallet&apos;s network activity.</CardDescription>
      </CardHeader>
      <CardContent className="h-56">
        {!address ? (
          <p className="text-sm text-muted-foreground">Connect a wallet or search an address.</p>
        ) : isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No round data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <defs>
                <linearGradient id="referralPointsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(244 75% 59%)" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(244 75% 59%)" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="round" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="points" fill="url(#referralPointsFill)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
