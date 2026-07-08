"use client";

import * as React from "react";
import { isAddress, type Address } from "viem";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TxProgress } from "@/components/shared/tx-progress";
import { useContractWrite } from "@/hooks/useContractWrite";

export function ResetWalletForm() {
  const [newAddr, setNewAddr] = React.useState("");
  const {
    execute,
    estimateGas,
    estimatedGas,
    isEstimating,
    isSigning,
    isConfirming,
    isConfirmed,
    hash,
  } = useContractWrite("resetWalletAddress");

  const isValid = isAddress(newAddr);

  async function handleConfirm() {
    if (!isValid) return;
    try {
      await execute([newAddr as Address]);
    } catch {
      // reported via toast
    }
  }

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>Reset Wallet Address</CardTitle>
        <CardDescription>resetWalletAddress(newAddr) - move your account to a new wallet.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="newAddr">New Wallet Address</Label>
          <Input
            id="newAddr"
            placeholder="0x..."
            value={newAddr}
            onChange={(e) => setNewAddr(e.target.value)}
          />
          {newAddr !== "" && !isValid && <p className="text-xs text-destructive">Enter a valid address</p>}
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
          disabled={!isValid || isEstimating || isSigning || isConfirming}
          onClick={() => estimateGas([newAddr as Address])}
        >
          {isEstimating ? "Estimating..." : "Estimate gas"}
        </Button>
        <ConfirmDialog
          trigger={<Button variant="destructive" disabled={!isValid || isSigning || isConfirming}>Reset Wallet</Button>}
          title="Reset your wallet address?"
          description={`Your account will be moved to ${newAddr || "the new address"}. This cannot be undone.`}
          confirmLabel="Reset Wallet"
          destructive
          isLoading={isSigning || isConfirming}
          onConfirm={handleConfirm}
        />
      </CardFooter>
    </Card>
  );
}
