"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRoundInfo } from "@/types/contract";

const AXIS_STYLE = { fontSize: 12 };
const TOOLTIP_STYLE = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

function buildRows(info: UserRoundInfo) {
  return info.points.map((point, i) => ({
    round: `R${i + 1}`,
    points: Number(point),
    directIncome: Number(info.dirEarn[i] ?? 0),
    binaryIncome: Number(info.binaryEarn[i] ?? 0),
    directFlash: Number(info.dirFlash[i] ?? 0),
    binaryFlash: Number(info.binaryFlash[i] ?? 0),
  }));
}

export function RoundHistoryCharts({ info }: { info: UserRoundInfo }) {
  const rows = React.useMemo(() => buildRows(info), [info]);

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No round data in this range.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-base">Points</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <defs>
                <linearGradient id="pointsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(244 75% 59%)" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(244 75% 59%)" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="round" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="points" fill="url(#pointsFill)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-base">Direct Income</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows}>
              <defs>
                <linearGradient id="directIncomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="round" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="directIncome"
                stroke="hsl(142 71% 45%)"
                fill="url(#directIncomeFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-base">Binary Income</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows}>
              <defs>
                <linearGradient id="binaryIncomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(38 92% 50%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="round" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="binaryIncome"
                stroke="hsl(38 92% 50%)"
                fill="url(#binaryIncomeFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-base">Flash Income</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows}>
              <defs>
                <linearGradient id="directFlashFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(244 75% 59%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(244 75% 59%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="binaryFlashFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(0 84% 60%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="round" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
              <Area
                type="monotone"
                dataKey="directFlash"
                name="Direct Flash"
                stroke="hsl(244 75% 59%)"
                fill="url(#directFlashFill)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="binaryFlash"
                name="Binary Flash"
                stroke="hsl(0 84% 60%)"
                fill="url(#binaryFlashFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
