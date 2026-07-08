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

export function MatchingBonusForm() {
  const [nodes, setNodes] = React.useState("");
  const [devPool, setDevPool] = React.useState("false");

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
        <CardTitle>Distribute Matching Bonuses</CardTitle>
        <CardDescription>distributeMatchingBonuses(nodes, devPool)</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nodes">Nodes</Label>
            <Input
              id="nodes"
              inputMode="numeric"
              placeholder="Number of nodes to process"
              value={nodes}
              onChange={(e) => setNodes(e.target.value)}
            />
            {nodes !== "" && !isNodesValid && (
              <p className="text-xs text-destructive">Enter a positive integer</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Dev Pool</Label>
            <Select value={devPool} onValueChange={setDevPool}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">False</SelectItem>
                <SelectItem value="true">True</SelectItem>
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
            {isEstimating ? "Estimating..." : "Estimate gas"}
          </Button>
          <Button type="submit" disabled={!isNodesValid || isSigning || isConfirming}>
            {isSigning || isConfirming ? "Processing..." : "Distribute"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
