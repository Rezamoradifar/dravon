"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowDown, CheckCircle2, XCircle } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function useSimulation(inputs: {
  borrowUsd: number;
  priceA: number;
  priceB: number;
  flashFeePct: number;
  dexFeePct: number;
  gasUsd: number;
}) {
  return React.useMemo(() => {
    const { borrowUsd, priceA, priceB, flashFeePct, dexFeePct, gasUsd } = inputs;
    if (priceA <= 0 || priceB <= 0) return null;

    const assetBought = (borrowUsd * (1 - dexFeePct / 100)) / priceA;
    const proceedsUsd = assetBought * priceB * (1 - dexFeePct / 100);
    const repaymentUsd = borrowUsd * (1 + flashFeePct / 100);
    const grossProfit = proceedsUsd - repaymentUsd;
    const netProfit = grossProfit - gasUsd;

    return { assetBought, proceedsUsd, repaymentUsd, grossProfit, netProfit };
  }, [inputs]);
}

export default function ArbitrageSimulatorPage() {
  const [borrowUsd, setBorrowUsd] = React.useState(10_000);
  const [priceA, setPriceA] = React.useState(600);
  const [priceB, setPriceB] = React.useState(603);
  const [flashFeePct, setFlashFeePct] = React.useState(0.09);
  const [dexFeePct, setDexFeePct] = React.useState(0.25);
  const [gasUsd, setGasUsd] = React.useState(2);

  const result = useSimulation({ borrowUsd, priceA, priceB, flashFeePct, dexFeePct, gasUsd });

  const chartData = React.useMemo(() => {
    const points = [];
    for (let gapPct = -2; gapPct <= 2; gapPct += 0.1) {
      const simulatedPriceB = priceA * (1 + gapPct / 100);
      const assetBought = (borrowUsd * (1 - dexFeePct / 100)) / priceA;
      const proceedsUsd = assetBought * simulatedPriceB * (1 - dexFeePct / 100);
      const repaymentUsd = borrowUsd * (1 + flashFeePct / 100);
      const netProfit = proceedsUsd - repaymentUsd - gasUsd;
      points.push({ gapPct: Number(gapPct.toFixed(1)), netProfit: Number(netProfit.toFixed(2)) });
    }
    return points;
  }, [borrowUsd, priceA, dexFeePct, flashFeePct, gasUsd]);

  const steps = result
    ? [
        { label: "Borrow", value: `$${borrowUsd.toLocaleString()}`, note: "Flash loan principal (simulated)" },
        { label: "Swap on Market A", value: `${result.assetBought.toFixed(4)} units`, note: `Bought at $${priceA}` },
        { label: "Swap on Market B", value: `$${result.proceedsUsd.toFixed(2)}`, note: `Sold at $${priceB}` },
        { label: "Repay flash loan", value: `-$${result.repaymentUsd.toFixed(2)}`, note: `Principal + ${flashFeePct}% fee` },
        {
          label: "Net result",
          value: `${result.netProfit >= 0 ? "+" : ""}$${result.netProfit.toFixed(2)}`,
          note: "After gas",
        },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Arbitrage Simulator"
        description="A fully simulated calculator for learning purposes only."
      />

      <Alert variant="warning" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Educational demonstration - not investment advice</AlertTitle>
        <AlertDescription>
          Every number on this page is a manual input you control. No real transaction, wallet, or
          exchange is involved. This does not predict, guarantee, or represent any real profit.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Simulated inputs</CardTitle>
            <CardDescription>All values are illustrative and editable.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Borrow amount (USD)</Label>
                <Input type="number" value={borrowUsd} onChange={(e) => setBorrowUsd(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>Gas cost (USD)</Label>
                <Input type="number" value={gasUsd} onChange={(e) => setGasUsd(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>Price on Market A</Label>
                <Input type="number" value={priceA} onChange={(e) => setPriceA(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>Price on Market B</Label>
                <Input type="number" value={priceB} onChange={(e) => setPriceB(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>Flash loan fee (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={flashFeePct}
                  onChange={(e) => setFlashFeePct(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>DEX fee per swap (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dexFeePct}
                  onChange={(e) => setDexFeePct(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simulated process</CardTitle>
            <CardDescription>Borrow → Swap → Swap → Repay → Result</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 text-sm">
                    <div>
                      <p className="font-medium">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.note}</p>
                    </div>
                    <p
                      className={cn(
                        "font-mono font-semibold",
                        step.label === "Net result" && result && result.netProfit >= 0 && "text-success",
                        step.label === "Net result" && result && result.netProfit < 0 && "text-destructive",
                      )}
                    >
                      {step.value}
                    </p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {result && (
              <div
                className={cn(
                  "mt-4 flex items-center gap-2 rounded-lg p-3 text-sm",
                  result.netProfit >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
                )}
              >
                {result.netProfit >= 0 ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {result.netProfit >= 0
                  ? "In this simulated scenario, proceeds exceed costs."
                  : "In this simulated scenario, costs exceed proceeds."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Net result vs. price gap</CardTitle>
          <CardDescription>
            Simulated net profit as the gap between Market A and Market B varies, holding other inputs fixed.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="gapPct" tick={{ fontSize: 12 }} unit="%" />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Net result"]} labelFormatter={(l) => `Gap: ${l}%`} />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              <Line type="monotone" dataKey="netProfit" stroke="hsl(244 75% 59%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
