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
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="round" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="points" fill="hsl(244 75% 59%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
