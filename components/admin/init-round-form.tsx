"use client";

import * as React from "react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TxProgress } from "@/components/shared/tx-progress";
import { useContractWrite } from "@/hooks/useContractWrite";
import { useTranslation } from "@/contexts/language-context";

export function InitRoundForm() {
  const [round, setRound] = React.useState("");
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
  } = useContractWrite("init");

  const roundNum = Number(round);
  const isValid = round !== "" && Number.isInteger(roundNum) && roundNum >= 0;

  async function handleEstimate() {
    if (!isValid) return;
    await estimateGas([BigInt(roundNum)]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    try {
      await execute([BigInt(roundNum)]);
    } catch {
      // reported via toast
    }
  }

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>{t("initRound.title")}</CardTitle>
        <CardDescription>init(round)</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="round">{t("initRound.round")}</Label>
            <Input
              id="round"
              inputMode="numeric"
              placeholder={t("initRound.roundPlaceholder")}
              value={round}
              onChange={(e) => setRound(e.target.value)}
            />
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
          <Button type="button" variant="outline" disabled={!isValid || isEstimating} onClick={handleEstimate}>
            {isEstimating ? t("common2.estimating") : t("common2.estimateGas")}
          </Button>
          <Button type="submit" variant="destructive" disabled={!isValid || isSigning || isConfirming}>
            {isSigning || isConfirming ? t("common2.processing") : t("initRound.submit")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
