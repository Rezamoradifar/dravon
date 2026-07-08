"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useChainId,
  useChains,
} from "wagmi";
import { maxUint256 } from "viem";

import { pancakeRouterAbi, erc20FullAbi } from "@/contracts/pancakeRouterAbi";
import { PANCAKE_ROUTER_V2, tokenPathAddress, type SwapToken } from "@/lib/pancakeswap";
import { parseContractError } from "@/lib/errors";
import { explorerTxLink } from "@/lib/format";

const DEADLINE_SECONDS = 20 * 60;

export function useSwapExecute(fromToken: SwapToken, toToken: SwapToken) {
  const { address } = useAccount();
  const chainId = useChainId();
  const chains = useChains();
  const chain = chains.find((c) => c.id === chainId);
  const publicClient = usePublicClient();

  const isFromNative = fromToken.address === "native";

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: isFromNative ? undefined : (fromToken.address as `0x${string}`),
    abi: erc20FullAbi,
    functionName: "allowance",
    args: address ? [address, PANCAKE_ROUTER_V2] : undefined,
    query: { enabled: !isFromNative && Boolean(address) },
  });

  const { writeContractAsync, data: hash, isPending: isSigning, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const needsApproval = (requiredAmount: bigint) =>
    !isFromNative && (allowance === undefined || allowance < requiredAmount);

  async function approve() {
    if (isFromNative) return;
    const toastId = toast.loading("Approve token spending in your wallet...");
    try {
      const txHash = await writeContractAsync({
        address: fromToken.address as `0x${string}`,
        abi: erc20FullAbi,
        functionName: "approve",
        args: [PANCAKE_ROUTER_V2, maxUint256],
      });
      await publicClient?.waitForTransactionReceipt({ hash: txHash });
      await refetchAllowance();
      toast.success("Approved", { id: toastId });
    } catch (error) {
      toast.error("Approval failed", { id: toastId, description: parseContractError(error) });
      throw error;
    }
  }

  async function swap({
    amountIn,
    amountOutMin,
  }: {
    amountIn: bigint;
    amountOutMin: bigint;
  }) {
    if (!address) return;
    reset();
    const path = [tokenPathAddress(fromToken), tokenPathAddress(toToken)] as const;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + DEADLINE_SECONDS);

    const toastId = toast.loading("Confirm the swap in your wallet...");
    try {
      let txHash: `0x${string}`;

      if (isFromNative) {
        txHash = await writeContractAsync({
          address: PANCAKE_ROUTER_V2,
          abi: pancakeRouterAbi,
          functionName: "swapExactETHForTokens",
          args: [amountOutMin, path, address, deadline],
          value: amountIn,
        });
      } else if (toToken.address === "native") {
        txHash = await writeContractAsync({
          address: PANCAKE_ROUTER_V2,
          abi: pancakeRouterAbi,
          functionName: "swapExactTokensForETH",
          args: [amountIn, amountOutMin, path, address, deadline],
        });
      } else {
        txHash = await writeContractAsync({
          address: PANCAKE_ROUTER_V2,
          abi: pancakeRouterAbi,
          functionName: "swapExactTokensForTokens",
          args: [amountIn, amountOutMin, path, address, deadline],
        });
      }

      const link = explorerTxLink(chainId, chain?.blockExplorers?.default.url, txHash);
      toast.loading("Swap submitted, waiting for confirmation...", { id: toastId, description: link || txHash });

      const receipt = await publicClient?.waitForTransactionReceipt({ hash: txHash });
      if (receipt?.status === "reverted") {
        toast.error("Swap reverted on-chain.", { id: toastId });
        return null;
      }

      toast.success("Swap confirmed", { id: toastId, description: link || txHash });
      return txHash;
    } catch (error) {
      toast.error("Swap failed", { id: toastId, description: parseContractError(error) });
      throw error;
    }
  }

  return {
    allowance,
    needsApproval,
    approve,
    swap,
    isSigning,
    isConfirming,
    isConfirmed,
    hash,
  };
}
