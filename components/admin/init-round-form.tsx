"use client";

import * as React from "react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TxProgress } from "@/components/shared/tx-progress";
import { useContractWrite } from "@/hooks/useContractWrite";

export function InitRoundForm() {
  const [round, setRound] = React.useState("");

  const {
    execute,
    estimateGas,
    estimatedGas,
    isEstimating,
    isSigning,
    isConfirming,
    isConfirmed,
    hash,
  } = useContractWrite("init");

  const roundNum = Number(round);
  const isValid = round !== "" && Number.isInteger(roundNum) && roundNum >= 0;

  async function handleEstimate() {
    if (!isValid) return;
    await estimateGas([BigInt(roundNum)]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    try {
      await execute([BigInt(roundNum)]);
    } catch {
      // reported via toast
    }
  }

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>Init Round</CardTitle>
        <CardDescription>init(round)</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="round">Round</Label>
            <Input
              id="round"
              inputMode="numeric"
              placeholder="Round id"
              value={round}
              onChange={(e) => setRound(e.target.value)}
            />
          </div>
          <TxProgress
            isSigning={isSigning}
            isConfirming={isConfirming}
            isConfirmed={isConfirmed}
            hash={hash}
            estimatedGas={estimatedGas}
          />
        </CardContent>
        <CardFooter className="flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={!isValid || isEstimating} onClick={handleEstimate}>
            {isEstimating ? "Estimating..." : "Estimate gas"}
          </Button>
          <Button type="submit" variant="destructive" disabled={!isValid || isSigning || isConfirming}>
            {isSigning || isConfirming ? "Processing..." : "Init Round"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
