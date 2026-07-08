"use client";

import * as React from "react";
import { useReadContracts } from "wagmi";
import { parseUnits, formatUnits } from "viem";

import { pancakeRouterAbi } from "@/contracts/pancakeRouterAbi";
import { PANCAKE_ROUTER_V2, SWAP_SUPPORTED_CHAIN_ID, tokenPathAddress, type SwapToken } from "@/lib/pancakeswap";

export function useSwapQuote(fromToken: SwapToken, toToken: SwapToken, amountIn: string) {
  const parsedAmount = React.useMemo(() => {
    if (!amountIn || Number(amountIn) <= 0) return null;
    try {
      return parseUnits(amountIn, fromToken.decimals);
    } catch {
      return null;
    }
  }, [amountIn, fromToken.decimals]);

  const path = React.useMemo(
    () => [tokenPathAddress(fromToken), tokenPathAddress(toToken)] as const,
    [fromToken, toToken],
  );

  const referenceAmount = React.useMemo(() => {
    try {
      return parseUnits("0.001", fromToken.decimals);
    } catch {
      return BigInt(1);
    }
  }, [fromToken.decimals]);

  const sameToken = tokenPathAddress(fromToken).toLowerCase() === tokenPathAddress(toToken).toLowerCase();

  const { data, isLoading, isError } = useReadContracts({
    contracts: [
      {
        address: PANCAKE_ROUTER_V2,
        abi: pancakeRouterAbi,
        functionName: "getAmountsOut",
        args: parsedAmount ? [parsedAmount, path] : undefined,
        chainId: SWAP_SUPPORTED_CHAIN_ID,
      },
      {
        address: PANCAKE_ROUTER_V2,
        abi: pancakeRouterAbi,
        functionName: "getAmountsOut",
        args: [referenceAmount, path],
        chainId: SWAP_SUPPORTED_CHAIN_ID,
      },
    ],
    query: { enabled: !sameToken && Boolean(parsedAmount), refetchInterval: 12_000 },
  });

  const amountOut = data?.[0]?.result?.[1];
  const referenceOut = data?.[1]?.result?.[1];

  const amountOutFormatted = amountOut !== undefined ? formatUnits(amountOut, toToken.decimals) : undefined;

  let priceImpactPct: number | undefined;
  if (amountOut !== undefined && referenceOut !== undefined && parsedAmount) {
    const actualRate = Number(formatUnits(amountOut, toToken.decimals)) / Number(amountIn);
    const spotRate = Number(formatUnits(referenceOut, toToken.decimals)) / Number(formatUnits(referenceAmount, fromToken.decimals));
    if (spotRate > 0) {
      priceImpactPct = Math.max(0, (1 - actualRate / spotRate) * 100);
    }
  }

  return {
    parsedAmount,
    amountOut,
    amountOutFormatted,
    priceImpactPct,
    isLoading,
    isError: isError || sameToken,
    sameToken,
  };
}
