"use client";

import * as React from "react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TxProgress } from "@/components/shared/tx-progress";
import { useContractWrite } from "@/hooks/useContractWrite";
import { useTranslation } from "@/contexts/language-context";

export function MatchingBonusForm() {
  const [nodes, setNodes] = React.useState("");
  const [devPool, setDevPool] = React.useState("false");
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
  } = useContractWrite("distributeMatchingBonuses");

  const nodesNum = Number(nodes);
  const isNodesValid = nodes !== "" && Number.isInteger(nodesNum) && nodesNum > 0;

  async function handleEstimate() {
    if (!isNodesValid) return;
    await estimateGas([BigInt(nodesNum), devPool === "true"]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isNodesValid) return;
    try {
      await execute([BigInt(nodesNum), devPool === "true"]);
    } catch {
      // reported via toast
    }
  }

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>{t("matchingBonus.title")}</CardTitle>
        <CardDescription>distributeMatchingBonuses(nodes, devPool)</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nodes">{t("matchingBonus.nodes")}</Label>
            <Input
              id="nodes"
              inputMode="numeric"
              placeholder={t("matchingBonus.nodesPlaceholder")}
              value={nodes}
              onChange={(e) => setNodes(e.target.value)}
            />
            {nodes !== "" && !isNodesValid && (
              <p className="text-xs text-destructive">{t("matchingBonus.invalidNodes")}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>{t("matchingBonus.devPool")}</Label>
            <Select value={devPool} onValueChange={setDevPool}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">{t("matchingBonus.false")}</SelectItem>
                <SelectItem value="true">{t("matchingBonus.true")}</SelectItem>
              </SelectContent>
            </Select>
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
          <Button type="button" variant="outline" disabled={!isNodesValid || isEstimating} onClick={handleEstimate}>
            {isEstimating ? t("common2.estimating") : t("common2.estimateGas")}
          </Button>
          <Button type="submit" disabled={!isNodesValid || isSigning || isConfirming}>
            {isSigning || isConfirming ? t("common2.processing") : t("matchingBonus.submit")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
