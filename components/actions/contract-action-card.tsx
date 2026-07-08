"use client";

import * as React from "react";
import { isAddress, parseEther } from "viem";
import { useAccount } from "wagmi";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ActionResultPanel } from "@/components/actions/action-result-panel";
import { useContractWrite, type RoundWindowFunctionName } from "@/hooks/useContractWrite";

export interface ActionField {
  key: string;
  label: string;
  type: "uint" | "address" | "bool";
  placeholder?: string;
  max?: number;
  helper?: string;
}

function isFieldValid(field: ActionField, raw: string): boolean {
  if (field.type === "bool") return true;
  if (raw === "") return false;
  if (field.type === "address") return isAddress(raw);
  const num = Number(raw);
  if (!Number.isInteger(num) || num < 0) return false;
  if (field.max !== undefined && num > field.max) return false;
  return true;
}

export function ContractActionCard({
  functionName,
  signature,
  title,
  description,
  icon: Icon,
  fields,
  payable,
  confirm,
}: {
  functionName: RoundWindowFunctionName;
  signature: string;
  title: string;
  description: string;
  icon: LucideIcon;
  fields: ActionField[];
  payable?: boolean;
  confirm?: { title: string; description: string; confirmLabel: string };
}) {
  const { address } = useAccount();
  const [values, setValues] = React.useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, f.type === "bool" ? "false" : ""])),
  );
  const [nativeValue, setNativeValue] = React.useState("");

  const {
    execute,
    estimateGas,
    estimatedGas,
    isEstimating,
    isSigning,
    isConfirming,
    isConfirmed,
    isReceiptError,
    hash,
  } = useContractWrite(functionName);

  const allValid = fields.every((f) => isFieldValid(f, values[f.key] ?? ""));
  const valueValid = !payable || (nativeValue !== "" && Number(nativeValue) > 0);
  const canSubmit = allValid && valueValid;

  function buildArgs(): unknown[] {
    return fields.map((f) => {
      const raw = values[f.key];
      if (f.type === "address") return raw as `0x${string}`;
      if (f.type === "bool") return raw === "true";
      // uint24-range fields stay as plain numbers (matches the ABI's begin/chargeAccount
      // call convention elsewhere in this app); larger uint256 fields use BigInt.
      return f.max !== undefined ? Number(raw) : BigInt(raw);
    });
  }

  function paramsPreview(): string {
    const parts = fields.map((f) => `${f.key}: ${values[f.key] || "?"}`);
    if (payable) parts.push(`value: ${nativeValue || "0"}`);
    return parts.join(", ") || "()";
  }

  async function handleEstimate() {
    if (!canSubmit) return;
    await estimateGas(buildArgs(), payable ? parseEther(nativeValue) : undefined);
  }

  async function handleExecute() {
    if (!canSubmit) return;
    try {
      await execute(buildArgs(), payable ? parseEther(nativeValue) : undefined);
    } catch {
      // reported via toast
    }
  }

  const isBusy = isSigning || isConfirming;

  return (
    <Card className="card-glow flex h-full flex-col">
      <CardHeader className="flex-row items-start gap-3 space-y-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="truncate font-mono text-xs">{signature}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-sm text-muted-foreground">{description}</p>

        {fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={`${functionName}-${field.key}`}>{field.label}</Label>
            {field.type === "bool" ? (
              <Select value={values[field.key]} onValueChange={(v) => setValues((s) => ({ ...s, [field.key]: v }))}>
                <SelectTrigger id={`${functionName}-${field.key}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">False</SelectItem>
                  <SelectItem value="true">True</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={`${functionName}-${field.key}`}
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={(e) => setValues((s) => ({ ...s, [field.key]: e.target.value }))}
              />
            )}
            {field.helper && <p className="text-xs text-muted-foreground">{field.helper}</p>}
            {values[field.key] !== "" && !isFieldValid(field, values[field.key]) && (
              <p className="text-xs text-destructive">
                {field.type === "address" ? "Enter a valid address" : "Enter a valid non-negative integer"}
                {field.max !== undefined ? ` (max ${field.max})` : ""}
              </p>
            )}
          </div>
        ))}

        {payable && (
          <div className="space-y-1.5">
            <Label htmlFor={`${functionName}-value`}>Payment Amount (native currency)</Label>
            <Input
              id={`${functionName}-value`}
              inputMode="decimal"
              placeholder="0.0"
              value={nativeValue}
              onChange={(e) => setNativeValue(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">This function is payable - the amount is sent with the transaction.</p>
          </div>
        )}

        <div className="rounded-lg border bg-muted/20 p-2 font-mono text-[11px] text-muted-foreground">
          {functionName}({paramsPreview()})
        </div>

        <ActionResultPanel
          functionSignature={signature}
          estimatedGas={estimatedGas}
          isEstimating={isEstimating}
          isSigning={isSigning}
          isConfirming={isConfirming}
          isConfirmed={isConfirmed}
          isFailed={isReceiptError}
          hash={hash}
        />
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={!canSubmit || isEstimating} onClick={handleEstimate}>
          {isEstimating ? "Estimating..." : "Estimate gas"}
        </Button>
        {confirm ? (
          <ConfirmDialog
            trigger={
              <Button variant="destructive" disabled={!canSubmit || !address || isBusy} className="ml-auto">
                {isBusy ? "Processing..." : title}
              </Button>
            }
            title={confirm.title}
            description={confirm.description}
            confirmLabel={confirm.confirmLabel}
            destructive
            isLoading={isBusy}
            onConfirm={handleExecute}
          />
        ) : (
          <Button className="ml-auto" disabled={!canSubmit || !address || isBusy} onClick={handleExecute}>
            {isBusy ? "Processing..." : "Execute"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
