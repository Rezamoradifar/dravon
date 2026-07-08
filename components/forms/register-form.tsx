"use client";

import * as React from "react";
import { isAddress, parseEther, type Address } from "viem";
import { useAccount, useBalance } from "wagmi";
import { Wand2, Save } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TxProgress } from "@/components/shared/tx-progress";
import { useContractWrite } from "@/hooks/useContractWrite";
import { useBestReferral } from "@/hooks/useBestReferral";
import type { RegisterPreset } from "@/hooks/useSavedPresets";

const UINT24_MAX = 16_777_215;

export function RegisterForm({
  appliedPreset,
  onSavePreset,
  initialDirect,
}: {
  appliedPreset?: (RegisterPreset & { appliedAt: number }) | null;
  onSavePreset?: (fields: Omit<RegisterPreset, "name">) => void;
  initialDirect?: string;
}) {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const [startBox, setStartBox] = React.useState("");
  const [direct, setDirect] = React.useState(initialDirect ?? "");
  const [referral, setReferral] = React.useState("");
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (!appliedPreset) return;
    setStartBox(appliedPreset.startBox);
    setDirect(appliedPreset.direct);
    setReferral(appliedPreset.referral);
    setValue(appliedPreset.valueBnb);
  }, [appliedPreset]);

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

  const startBoxNum = Number(startBox);
  const isStartBoxValid = startBox !== "" && Number.isInteger(startBoxNum) && startBoxNum >= 0 && startBoxNum <= UINT24_MAX;
  const isDirectValid = isAddress(direct);
  const isReferralValid = isAddress(referral);
  const isValueValid = value !== "" && Number(value) > 0;
  const canSubmit = isStartBoxValid && isDirectValid && isReferralValid && isValueValid;

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
    if (!canSubmit) return;
    await estimateGas([startBoxNum, direct as Address, referral as Address], parseEther(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await execute([startBoxNum, direct as Address, referral as Address], parseEther(value));
    } catch {
      // toast already reported by useContractWrite
    }
  }

  return (
    <Card className="card-glow">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Register</CardTitle>
          <CardDescription>Join the round by calling begin(startBox, direct, referral).</CardDescription>
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
          <div className="space-y-1.5">
            <Label htmlFor="startBox">Start Box</Label>
            <Input
              id="startBox"
              inputMode="numeric"
              placeholder="0"
              value={startBox}
              onChange={(e) => setStartBox(e.target.value)}
            />
            {startBox !== "" && !isStartBoxValid && (
              <p className="text-xs text-destructive">Enter an integer between 0 and {UINT24_MAX}</p>
            )}
          </div>

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
              begin() is payable - this amount is sent with the transaction.
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
          {onSavePreset && (
            <Button
              type="button"
              variant="ghost"
              className="gap-1.5"
              disabled={!canSubmit}
              onClick={() => onSavePreset({ startBox, direct, referral, valueBnb: value })}
            >
              <Save className="h-4 w-4" /> Save as preset
            </Button>
          )}
          <Button type="submit" className="ml-auto" disabled={!canSubmit || !address || isSigning || isConfirming}>
            {isSigning || isConfirming ? "Processing..." : "Register"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
