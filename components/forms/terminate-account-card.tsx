"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TxProgress } from "@/components/shared/tx-progress";
import { useContractWrite } from "@/hooks/useContractWrite";

export function TerminateAccountCard() {
  const { execute, isSigning, isConfirming, isConfirmed, hash } = useContractWrite("terminateAccount");

  async function handleConfirm() {
    try {
      await execute([]);
    } catch {
      // reported via toast
    }
  }

  return (
    <Card className="card-glow border-destructive/40">
      <CardHeader>
        <CardTitle>Terminate Account</CardTitle>
        <CardDescription>terminateAccount() - permanently terminate your account in this window.</CardDescription>
      </CardHeader>
      <CardContent>
        <TxProgress isSigning={isSigning} isConfirming={isConfirming} isConfirmed={isConfirmed} hash={hash} />
      </CardContent>
      <CardFooter>
        <ConfirmDialog
          trigger={<Button variant="destructive" disabled={isSigning || isConfirming}>Terminate Account</Button>}
          title="Terminate your account?"
          description="This is irreversible. Your account in this round window will be permanently terminated."
          confirmLabel="Terminate"
          destructive
          isLoading={isSigning || isConfirming}
          onConfirm={handleConfirm}
        />
      </CardFooter>
    </Card>
  );
}
