"use client";

import * as React from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TxProgress } from "@/components/shared/tx-progress";
import { useContractWrite } from "@/hooks/useContractWrite";

const UINT24_MAX = 16_777_215;

export function ChargeAccountForm() {
  const { address } = useAccount();
  const [targetBox, setTargetBox] = React.useState("");
  const [value, setValue] = React.useState("");

  const {
    execute,
    estimateGas,
    estimatedGas,
    isEstimating,
    isSigning,
    isConfirming,
    isConfirmed,
    hash,
  } = useContractWrite("chargeAccount");

  const targetBoxNum = Number(targetBox);
  const isTargetBoxValid =
    targetBox !== "" && Number.isInteger(targetBoxNum) && targetBoxNum >= 0 && targetBoxNum <= UINT24_MAX;
  const isValueValid = value !== "" && Number(value) > 0;
  const canSubmit = isTargetBoxValid && isValueValid;

  async function handleEstimate() {
    if (!canSubmit) return;
    await estimateGas([targetBoxNum], parseEther(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await execute([targetBoxNum], parseEther(value));
    } catch {
      // toast already reported
    }
  }

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>Charge Account</CardTitle>
        <CardDescription>Top up a box by calling chargeAccount(targetBox).</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="targetBox">Target Box</Label>
            <Input
              id="targetBox"
              inputMode="numeric"
              placeholder="0"
              value={targetBox}
              onChange={(e) => setTargetBox(e.target.value)}
            />
            {targetBox !== "" && !isTargetBoxValid && (
              <p className="text-xs text-destructive">Enter an integer between 0 and {UINT24_MAX}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="value">Payment Amount (native currency)</Label>
            <Input
              id="value"
              inputMode="decimal"
              placeholder="0.0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              chargeAccount() is payable - this amount is sent with the transaction.
            </p>
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
          <Button
            type="button"
            variant="outline"
            disabled={!canSubmit || isEstimating}
            onClick={handleEstimate}
          >
            {isEstimating ? "Estimating..." : "Estimate gas"}
          </Button>
          <Button type="submit" disabled={!canSubmit || !address || isSigning || isConfirming}>
            {isSigning || isConfirming ? "Processing..." : "Charge Account"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
