"use client";

import * as React from "react";
import { isAddress, type Address } from "viem";
import { useAccount, useBalance } from "wagmi";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TxProgress } from "@/components/shared/tx-progress";
import { PaymentMethodPanel } from "@/components/registration/payment-method-panel";
import { useContractWrite } from "@/hooks/useContractWrite";
import { useBestReferral } from "@/hooks/useBestReferral";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTokenPayment } from "@/hooks/useTokenPayment";
import { WINDOW_ADDRESS } from "@/contracts/addresses";
import { tierCostUsd } from "@/lib/packages";

export function RegisterForm({
  entrance,
  initialDirect,
}: {
  entrance: number | undefined;
  initialDirect?: string;
}) {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { stableToken } = useDashboardData();
  const [direct, setDirect] = React.useState(initialDirect ?? "");
  const [referral, setReferral] = React.useState("");

  const costUsd = entrance ? tierCostUsd(entrance) : undefined;
  const payment = useTokenPayment(costUsd, stableToken, WINDOW_ADDRESS);

  const {
    execute,
    estimateGas,
    estimatedGas,
    isEstimating,
    isSigning,
    isConfirming,
    isConfirmed,
    hash,
  } = useContractWrite("begin");

  const { referral: bestReferral, isLoading: isFindingReferral, refetch: refetchBestReferral } =
    useBestReferral(isAddress(direct) ? (direct as Address) : undefined);

  const isDirectValid = isAddress(direct);
  const isReferralValid = isAddress(referral);
  const canSubmit = Boolean(entrance) && isDirectValid && isReferralValid && payment.isPaymentValid;

  async function handleFindReferral() {
    if (!isDirectValid) {
      toast.error("Enter a valid direct sponsor address first");
      return;
    }
    const result = await refetchBestReferral();
    if (result.data) {
      setReferral(result.data);
    } else {
      toast.error("Could not find a referral for this direct sponsor");
    }
  }

  async function handleEstimate() {
    if (!canSubmit || !entrance) return;
    await estimateGas([entrance, direct as Address, referral as Address], payment.value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !entrance) return;
    try {
      await execute([entrance, direct as Address, referral as Address], payment.value);
    } catch {
      // toast already reported by useContractWrite
    }
  }

  return (
    <Card className="card-glow">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Register</CardTitle>
          <CardDescription>Join by calling begin(startBox, direct, referral) with your selected package.</CardDescription>
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
              Select a package above to continue.
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="direct">Direct Sponsor</Label>
            <Input
              id="direct"
              placeholder="0x..."
              value={direct}
              onChange={(e) => setDirect(e.target.value)}
            />
            {direct !== "" && !isDirectValid && (
              <p className="text-xs text-destructive">Enter a valid address</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="referral">Referral Sponsor</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                disabled={!isDirectValid || isFindingReferral}
                onClick={handleFindReferral}
              >
                <Wand2 className="h-3 w-3" />
                {isFindingReferral ? "Finding..." : "Auto-fill best referral"}
              </Button>
            </div>
            <Input
              id="referral"
              placeholder="0x..."
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
            />
            {referral !== "" && !isReferralValid && (
              <p className="text-xs text-destructive">Enter a valid address</p>
            )}
            {bestReferral && (
              <p className="text-xs text-muted-foreground">Suggested: {bestReferral}</p>
            )}
          </div>

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
            {isSigning || isConfirming ? "Processing..." : "Register"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
