"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TxProgress } from "@/components/shared/tx-progress";
import { useContractWrite } from "@/hooks/useContractWrite";
import { useTranslation } from "@/contexts/language-context";

export function TerminateAccountCard() {
  const { t } = useTranslation();
  const {
    execute,
    estimateGas,
    estimatedGas,
    isEstimating,
    isSigning,
    isConfirming,
    isConfirmed,
    hash,
  } = useContractWrite("terminateAccount");

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
        <CardTitle>{t("terminateAccountCard.title")}</CardTitle>
        <CardDescription>{t("terminateAccountCard.description")}</CardDescription>
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
          {isEstimating ? t("common2.estimating") : t("common2.estimateGas")}
        </Button>
        <ConfirmDialog
          trigger={<Button variant="destructive" disabled={isSigning || isConfirming}>{t("terminateAccountCard.submit")}</Button>}
          title={t("terminateAccountCard.confirmTitle")}
          description={t("terminateAccountCard.confirmDescription")}
          confirmLabel={t("terminateAccountCard.confirmLabel")}
          destructive
          isLoading={isSigning || isConfirming}
          onConfirm={handleConfirm}
        />
      </CardFooter>
    </Card>
  );
}
