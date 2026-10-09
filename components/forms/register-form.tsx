"use client";

import * as React from "react";
import { isAddress, zeroAddress, type Address } from "viem";
import { useAccount, useBalance, useChainId } from "wagmi";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TxProgress } from "@/components/shared/tx-progress";
import { PaymentMethodPanel } from "@/components/registration/payment-method-panel";
import { RegistrationStepper, type RegistrationStep } from "@/components/registration/registration-stepper";
import { useContractWrite } from "@/hooks/useContractWrite";
import { useBestReferral } from "@/hooks/useBestReferral";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTokenPayment } from "@/hooks/useTokenPayment";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";
import { tierCostUsd } from "@/lib/packages";
import { PRIMARY_CHAIN_ID } from "@/lib/wagmi";
import { useTranslation } from "@/contexts/language-context";

export function RegisterForm({
  entrance,
  initialDirect,
}: {
  entrance: number | undefined;
  initialDirect?: string;
}) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const { stableToken } = useDashboardData();
  const { address: windowAddress, isConfirmed: isWindowConfirmed, isError: isWindowError } = useLatestRoundWindow();
  const { t } = useTranslation();
  const [direct, setDirect] = React.useState(initialDirect ?? "");
  const [referral, setReferral] = React.useState("");

  const costUsd = entrance ? tierCostUsd(entrance) : undefined;
  const payment = useTokenPayment(costUsd, stableToken, windowAddress, balance?.value);

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

  const isDirectValid = isAddress(direct) && direct.toLowerCase() !== zeroAddress && direct.toLowerCase() !== address?.toLowerCase();
  const isReferralValid = isAddress(referral) && referral.toLowerCase() !== zeroAddress && referral.toLowerCase() !== address?.toLowerCase();
  const canSubmit = Boolean(entrance) && isDirectValid && isReferralValid && payment.isPaymentValid && chainId === PRIMARY_CHAIN_ID && isWindowConfirmed && !isWindowError && !isSigning && !isConfirming;

  const directRef = React.useRef(direct);
  directRef.current = direct;

  const currentStep: RegistrationStep = !address
    ? "connect"
    : chainId !== PRIMARY_CHAIN_ID
      ? "network"
      : isConfirmed
        ? "success"
        : isConfirming
          ? "pending"
          : !isDirectValid || !isReferralValid
            ? "referrer"
            : "confirm";

  async function handleFindReferral() {
    if (!isDirectValid) {
      toast.error(t("registerForm.enterDirectFirst"));
      return;
    }
    const requestedDirect = direct;
    const result = await refetchBestReferral();
    if (directRef.current !== requestedDirect) return;
    if (result.data && result.data.toLowerCase() !== zeroAddress) {
      setReferral(result.data);
    } else {
      toast.error(t("registerForm.noReferralFound"));
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
          <CardTitle>{t("registerForm.title")}</CardTitle>
          <CardDescription>{t("registerForm.description")}</CardDescription>
        </div>
        {balance && (
          <div className="shrink-0 text-right text-xs text-muted-foreground">
            {t("registerForm.balance")}
            <p className="font-mono text-sm text-foreground">
              {Number(balance.formatted).toFixed(4)} {balance.symbol}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-0">
        <RegistrationStepper current={currentStep} />
      </CardContent>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {!entrance && (
            <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              {t("registerForm.selectPackagePrompt")}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="direct">{t("registerForm.directSponsor")}</Label>
            <Input
              id="direct"
              placeholder="0x..."
              value={direct}
              dir="ltr"
              aria-invalid={direct !== "" && !isDirectValid}
              onChange={(e) => { setDirect(e.target.value.trim()); setReferral(""); }}
            />
            {direct !== "" && !isDirectValid && (
              <p className="text-xs text-destructive">{t("registerForm.invalidAddress")}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="referral">{t("registerForm.referralSponsor")}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                disabled={!isDirectValid || isFindingReferral}
                onClick={handleFindReferral}
              >
                <Wand2 className="h-3 w-3" />
                {isFindingReferral ? t("registerForm.finding") : t("registerForm.autoFillReferral")}
              </Button>
            </div>
            <Input
              id="referral"
              placeholder="0x..."
              value={referral}
              dir="ltr"
              aria-invalid={referral !== "" && !isReferralValid}
              onChange={(e) => setReferral(e.target.value.trim())}
            />
            {referral !== "" && !isReferralValid && (
              <p className="text-xs text-destructive">{t("registerForm.invalidAddress")}</p>
            )}
            {bestReferral && (
              <p className="text-xs text-muted-foreground">{t("registerForm.suggested", { address: bestReferral })}</p>
            )}
          </div>

          {(!isWindowConfirmed || isWindowError) && <p role="status" className="text-sm text-muted-foreground">{t("improvements.windowUnavailable")}</p>}
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
            {isEstimating ? t("registerForm.estimating") : t("registerForm.estimateGas")}
          </Button>
          <Button type="submit" className="ml-auto" disabled={!canSubmit || !address || isSigning || isConfirming}>
            {isSigning || isConfirming ? t("registerForm.processing") : t("registerForm.submit")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
