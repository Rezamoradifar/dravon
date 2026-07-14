"use client";

import { formatUnits } from "viem";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { useTokenPayment } from "@/hooks/useTokenPayment";
import { useTranslation } from "@/contexts/language-context";

export function PaymentMethodPanel({
  payment,
  costUsd,
}: {
  payment: ReturnType<typeof useTokenPayment>;
  costUsd: number | undefined;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <Tabs value={payment.method} onValueChange={(v) => payment.setMethod(v as "usdt" | "bnb")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="usdt">{t("paymentMethod.payWithUsdt")}</TabsTrigger>
          <TabsTrigger value="bnb">{t("paymentMethod.payWithBnb")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {payment.method === "usdt" ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("paymentMethod.exactAmountRequired")}{" "}
            <span className="font-mono text-foreground">{costUsd?.toFixed(2)} USDT</span>
          </p>
          {payment.needsApproval ? (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">
                {t("paymentMethod.currentAllowance")}{" "}
                {payment.allowance !== undefined ? formatUnits(payment.allowance, 18) : "0"} USDT.{" "}
                {t("paymentMethod.approveNote")}
              </p>
              <Button type="button" variant="outline" onClick={() => payment.approve()} disabled={payment.isApproving}>
                {payment.isApproving ? t("paymentMethod.approving") : t("paymentMethod.approveUsdt")}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-success">{t("paymentMethod.allowanceSufficient")}</p>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="bnb-amount">{t("paymentMethod.maxBnbToSend")}</Label>
          <Input
            id="bnb-amount"
            inputMode="decimal"
            value={payment.bnbAmount}
            onChange={(e) => payment.setBnbAmount(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {payment.estimatedBnb !== undefined
              ? t("paymentMethod.estimatedFromPrice", { amount: payment.estimatedBnb.toFixed(6) })
              : ""}
            {t("paymentMethod.swapNote")}
          </p>
        </div>
      )}
    </div>
  );
}
