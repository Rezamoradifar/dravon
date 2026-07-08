"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserRoundInfo } from "@/types/contract";

const AXIS_STYLE = { fontSize: 12 };

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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Points</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="round" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip />
              <Bar dataKey="points" fill="hsl(244 75% 59%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Direct Income</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="round" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip />
              <Line type="monotone" dataKey="directIncome" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Binary Income</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="round" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip />
              <Line type="monotone" dataKey="binaryIncome" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Flash Income</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="round" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="directFlash" name="Direct Flash" stroke="hsl(244 75% 59%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="binaryFlash" name="Binary Flash" stroke="hsl(0 84% 60%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
