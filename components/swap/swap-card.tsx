"use client";

import * as React from "react";
import { useAccount, useBalance } from "wagmi";
import { parseUnits } from "viem";
import { ArrowDownUp, Settings2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TokenSelect } from "@/components/swap/token-select";
import { TxProgress } from "@/components/shared/tx-progress";
import { SWAP_TOKENS, type SwapToken } from "@/lib/pancakeswap";
import { useSwapQuote } from "@/hooks/useSwapQuote";
import { useSwapExecute } from "@/hooks/useSwapExecute";
import { cn } from "@/lib/utils";

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1];

export function SwapCard() {
  const { address } = useAccount();
  const [fromToken, setFromToken] = React.useState<SwapToken>(SWAP_TOKENS[0]);
  const [toToken, setToToken] = React.useState<SwapToken>(SWAP_TOKENS[2]);
  const [amountIn, setAmountIn] = React.useState("");
  const [slippage, setSlippage] = React.useState(0.5);
  const [showSettings, setShowSettings] = React.useState(false);

  const { data: fromBalance } = useBalance({
    address,
    token: fromToken.address === "native" ? undefined : fromToken.address,
  });

  const { amountOut, amountOutFormatted, priceImpactPct, isLoading, isError, sameToken } = useSwapQuote(
    fromToken,
    toToken,
    amountIn,
  );

  const { needsApproval, approve, swap, isSigning, isConfirming, isConfirmed, hash } = useSwapExecute(
    fromToken,
    toToken,
  );

  const parsedAmountValid = amountIn !== "" && Number(amountIn) > 0;
  const minReceived =
    amountOut !== undefined
      ? (amountOut * BigInt(Math.round((1 - slippage / 100) * 10_000))) / BigInt(10_000)
      : undefined;

  let parsedAmountIn: bigint | undefined;
  try {
    parsedAmountIn = parsedAmountValid ? parseUnits(amountIn, fromToken.decimals) : undefined;
  } catch {
    parsedAmountIn = undefined;
  }

  const requiresApproval = parsedAmountIn !== undefined && needsApproval(parsedAmountIn);

  function swapDirection() {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmountIn("");
  }

  async function handleAction() {
    if (!parsedAmountIn || amountOut === undefined || minReceived === undefined) return;
    try {
      if (requiresApproval) {
        await approve();
        return;
      }
      await swap({ amountIn: parsedAmountIn, amountOutMin: minReceived });
    } catch {
      // toast already reported
    }
  }

  return (
    <Card className="card-glow mx-auto max-w-md">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Swap</CardTitle>
          <CardDescription>PancakeSwap Router V2 on BNB Smart Chain</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowSettings((v) => !v)}>
          <Settings2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showSettings && (
          <div className="rounded-lg border p-3 text-sm">
            <p className="mb-2 text-xs text-muted-foreground">Slippage tolerance</p>
            <div className="flex gap-2">
              {SLIPPAGE_OPTIONS.map((opt) => (
                <Button
                  key={opt}
                  type="button"
                  size="sm"
                  variant={slippage === opt ? "default" : "outline"}
                  onClick={() => setSlippage(opt)}
                >
                  {opt}%
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>From</span>
            {fromBalance && (
              <button
                type="button"
                className="hover:text-foreground"
                onClick={() => setAmountIn(fromBalance.formatted)}
              >
                Balance: {Number(fromBalance.formatted).toFixed(4)}
              </button>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Input
              inputMode="decimal"
              placeholder="0.0"
              className="border-none px-0 text-2xl shadow-none focus-visible:ring-0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
            />
            <TokenSelect value={fromToken} onChange={setFromToken} exclude={toToken} />
          </div>
        </div>

        <div className="flex justify-center">
          <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={swapDirection}>
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-xl border p-3">
          <p className="text-xs text-muted-foreground">To (estimated)</p>
          <div className="mt-1 flex items-center gap-2">
            <div
              className={cn(
                "flex-1 truncate text-2xl",
                !amountOutFormatted && "text-muted-foreground",
              )}
            >
              {isLoading ? "..." : amountOutFormatted ? Number(amountOutFormatted).toFixed(6) : "0.0"}
            </div>
            <TokenSelect value={toToken} onChange={setToToken} exclude={fromToken} />
          </div>
        </div>

        {sameToken && parsedAmountValid && (
          <p className="text-xs text-destructive">Choose two different tokens.</p>
        )}
        {isError && !sameToken && (
          <p className="text-xs text-destructive">No liquidity route found for this pair.</p>
        )}

        {parsedAmountValid && amountOutFormatted && !isError && (
          <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Price impact</span>
              <span className={cn(priceImpactPct !== undefined && priceImpactPct > 3 && "text-destructive")}>
                {priceImpactPct !== undefined ? `${priceImpactPct.toFixed(2)}%` : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Minimum received</span>
              <span>
                {minReceived !== undefined
                  ? `${(Number(minReceived) / 10 ** toToken.decimals).toFixed(6)} ${toToken.symbol}`
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Route</span>
              <span>
                {fromToken.symbol} → {toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Slippage tolerance</span>
              <span>{slippage}%</span>
            </div>
          </div>
        )}

        <TxProgress isSigning={isSigning} isConfirming={isConfirming} isConfirmed={isConfirmed} hash={hash} />

        <Separator />

        <Button
          className="w-full"
          disabled={
            !address ||
            !parsedAmountValid ||
            sameToken ||
            isError ||
            amountOut === undefined ||
            isSigning ||
            isConfirming
          }
          onClick={handleAction}
        >
          {isSigning || isConfirming
            ? "Processing..."
            : requiresApproval
              ? `Approve ${fromToken.symbol}`
              : "Swap"}
        </Button>
      </CardContent>
    </Card>
  );
}
