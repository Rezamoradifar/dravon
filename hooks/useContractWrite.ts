"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useAccount,
  useChainId,
  useChains,
} from "wagmi";
import type { Abi } from "viem";

import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { parseContractError } from "@/lib/errors";
import { explorerTxLink } from "@/lib/format";
import { logActivity, updateActivityStatus } from "@/hooks/useActivityLog";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";

export type RoundWindowFunctionName =
  | "begin"
  | "chargeAccount"
  | "distributeMatchingBonuses"
  | "voteShutdown"
  | "terminateAccount"
  | "resetWalletAddress"
  | "init";

export function useContractWrite(functionName: RoundWindowFunctionName) {
  const { address } = useAccount();
  const chainId = useChainId();
  const chains = useChains();
  const publicClient = usePublicClient();
  const { address: windowAddress } = useLatestRoundWindow();
  const [estimatedGas, setEstimatedGas] = React.useState<bigint | null>(null);
  const [isEstimating, setIsEstimating] = React.useState(false);

  const { writeContractAsync, data: hash, isPending: isSigning, reset } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const chain = chains.find((c) => c.id === chainId);

  async function estimateGas(args: readonly unknown[], value?: bigint) {
    if (!publicClient || !address) return null;
    setIsEstimating(true);
    try {
      const gas = await publicClient.estimateContractGas({
        address: windowAddress,
        abi: roundWindowAbi as unknown as Abi,
        functionName,
        args,
        account: address,
        value,
      });
      setEstimatedGas(gas);
      return gas;
    } catch (error) {
      setEstimatedGas(null);
      return null;
    } finally {
      setIsEstimating(false);
    }
  }

  async function execute(args: readonly unknown[], value?: bigint) {
    reset();
    const toastId = toast.loading("Confirm the transaction in your wallet...");
    try {
      const txHash = await writeContractAsync({
        address: windowAddress,
        abi: roundWindowAbi as unknown as Abi,
        functionName,
        args,
        value,
      });

      if (address) logActivity({ hash: txHash, functionName, from: address });

      const link = explorerTxLink(chainId, chain?.blockExplorers?.default.url, txHash);
      toast.loading("Transaction submitted, waiting for confirmation...", {
        id: toastId,
        description: link ? link : txHash,
      });

      const receipt = await publicClient?.waitForTransactionReceipt({ hash: txHash });

      if (receipt?.status === "reverted") {
        updateActivityStatus(txHash, "failed");
        toast.error("Transaction reverted on-chain.", { id: toastId });
        return null;
      }

      updateActivityStatus(txHash, "confirmed");
      toast.success("Transaction confirmed", {
        id: toastId,
        description: link ? link : txHash,
      });
      return txHash;
    } catch (error) {
      toast.error("Transaction failed", {
        id: toastId,
        description: parseContractError(error),
      });
      throw error;
    }
  }

  return {
    execute,
    estimateGas,
    estimatedGas,
    isEstimating,
    isSigning,
    isConfirming,
    isConfirmed,
    isReceiptError,
    receiptError,
    hash,
    reset,
  };
}
