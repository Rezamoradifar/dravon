"use client";

import { useAccount, useBalance } from "wagmi";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TxProgress } from "@/components/shared/tx-progress";
import { PaymentMethodPanel } from "@/components/registration/payment-method-panel";
import { useContractWrite } from "@/hooks/useContractWrite";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTokenPayment } from "@/hooks/useTokenPayment";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";
import { tierCostUsd } from "@/lib/packages";

export function ChargeAccountForm({ entrance }: { entrance: number | undefined }) {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { stableToken } = useDashboardData();
  const { address: windowAddress } = useLatestRoundWindow();

  const costUsd = entrance ? tierCostUsd(entrance) : undefined;
  const payment = useTokenPayment(costUsd, stableToken, windowAddress);

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

  const canSubmit = Boolean(entrance) && payment.isPaymentValid;

  async function handleEstimate() {
    if (!canSubmit || !entrance) return;
    await estimateGas([entrance], payment.value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !entrance) return;
    try {
      await execute([entrance], payment.value);
    } catch {
      // toast already reported by useContractWrite
    }
  }

  return (
    <Card className="card-glow">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Top Up</CardTitle>
          <CardDescription>Upgrade by calling chargeAccount(targetBox) with your selected package.</CardDescription>
        </div>
        {balance && (
          <div className="shrink-0 text-right text-xs text-muted-foreground">
            Balance
            <p className="font-mono text-sm text-foreground">
              {Number(balance.formatted).toFixed(4)} {balance.symbol}
            </p>
          </div>
        )}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {!entrance && (
            <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              Select an available upgrade above to continue.
            </p>
          )}

          {entrance && <PaymentMethodPanel payment={payment} costUsd={costUsd} />}

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
          <Button type="submit" className="ml-auto" disabled={!canSubmit || !address || isSigning || isConfirming}>
            {isSigning || isConfirming ? "Processing..." : "Top Up"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
