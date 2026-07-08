"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TxProgress } from "@/components/shared/tx-progress";
import { useContractWrite } from "@/hooks/useContractWrite";

export function VoteShutdownCard() {
  const {
    execute,
    estimateGas,
    estimatedGas,
    isEstimating,
    isSigning,
    isConfirming,
    isConfirmed,
    hash,
  } = useContractWrite("voteShutdown");

  async function handleConfirm() {
    try {
      await execute([]);
    } catch {
      // reported via toast
    }
  }

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>Vote Shutdown</CardTitle>
        <CardDescription>voteShutdown() - cast your vote to shut the round down.</CardDescription>
      </CardHeader>
      <CardContent>
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
          disabled={isEstimating || isSigning || isConfirming}
          onClick={() => estimateGas([])}
        >
          {isEstimating ? "Estimating..." : "Estimate gas"}
        </Button>
        <ConfirmDialog
          trigger={<Button variant="destructive" disabled={isSigning || isConfirming}>Vote Shutdown</Button>}
          title="Vote for shutdown?"
          description="This casts your on-chain vote to shut down the round. You can only vote once per round."
          confirmLabel="Vote Shutdown"
          destructive
          isLoading={isSigning || isConfirming}
          onConfirm={handleConfirm}
        />
      </CardFooter>
    </Card>
  );
}
