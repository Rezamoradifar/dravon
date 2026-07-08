"use client";

import { formatUnits } from "viem";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { useTokenPayment } from "@/hooks/useTokenPayment";

export function PaymentMethodPanel({
  payment,
  costUsd,
}: {
  payment: ReturnType<typeof useTokenPayment>;
  costUsd: number | undefined;
}) {
  return (
    <div className="space-y-3 rounded-lg border p-3">
      <Tabs value={payment.method} onValueChange={(v) => payment.setMethod(v as "usdt" | "bnb")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="usdt">Pay with USDT</TabsTrigger>
          <TabsTrigger value="bnb">Pay with BNB</TabsTrigger>
        </TabsList>
      </Tabs>

      {payment.method === "usdt" ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Exact amount required: <span className="font-mono text-foreground">{costUsd?.toFixed(2)} USDT</span>
          </p>
          {payment.needsApproval ? (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Current allowance: {payment.allowance !== undefined ? formatUnits(payment.allowance, 18) : "0"} USDT.
                Approve the contract to spend USDT before registering.
              </p>
              <Button type="button" variant="outline" onClick={() => payment.approve()} disabled={payment.isApproving}>
                {payment.isApproving ? "Approving..." : "Approve USDT"}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-success">USDT allowance is sufficient.</p>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="bnb-amount">Max BNB to send</Label>
          <Input
            id="bnb-amount"
            inputMode="decimal"
            value={payment.bnbAmount}
            onChange={(e) => payment.setBnbAmount(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {payment.estimatedBnb !== undefined
              ? `Estimated from live price: ~${payment.estimatedBnb.toFixed(6)} BNB (a small buffer is pre-filled). `
              : ""}
            The contract swaps just enough BNB for the exact USDT amount and refunds the rest.
          </p>
        </div>
      )}
    </div>
  );
}
