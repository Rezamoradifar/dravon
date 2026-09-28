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
import { zeroAddress, type Abi } from "viem";
import { CHAIN_ID, CONTRACTS_CONFIGURED, FACTORY_ADDRESS } from "@/contracts/addresses";
import { factoryAbi } from "@/contracts/factoryAbi";
import { useQueryClient } from "@tanstack/react-query";

import { roundWindowAbi } from "@/contracts/roundWindowAbi";
import { parseContractError } from "@/lib/errors";
import { explorerTxLink } from "@/lib/format";
import { fireConfetti } from "@/lib/confetti";
import { vibrate } from "@/lib/haptics";
import { speakWelcome } from "@/lib/voice";
import { pushNotification } from "@/lib/notifications";
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
  const publicClient = usePublicClient({ chainId: CHAIN_ID });
  const queryClient = useQueryClient();
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

  async function resolveWriteWindow() {
    if (!CONTRACTS_CONFIGURED || !publicClient || !address) throw new Error("Contract v7.4 is not configured or wallet is disconnected.");
    if (chainId !== CHAIN_ID) throw new Error("Switch your wallet to the contract network first.");
    const latest = await publicClient.readContract({ address: FACTORY_ADDRESS, abi: factoryAbi, functionName: "getLatestWindow" });
    if (latest === zeroAddress) throw new Error("The factory has no active round window.");
    if (!windowAddress || latest.toLowerCase() !== windowAddress.toLowerCase()) {
      await queryClient.invalidateQueries();
      throw new Error("The round window changed. Refresh the payment approval and try again.");
    }
    return latest;
  }

  async function estimateGas(args: readonly unknown[], value?: bigint) {
    if (!publicClient || !address) return null;
    setIsEstimating(true);
    try {
      const latest = await resolveWriteWindow();
      const gas = await publicClient.estimateContractGas({
        address: latest,
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
      const latest = await resolveWriteWindow();
      await publicClient!.simulateContract({ address: latest, abi: roundWindowAbi as unknown as Abi, functionName, args, account: address, value });
      const txHash = await writeContractAsync({
        chainId: CHAIN_ID,
        address: latest,
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
        if (address) {
          pushNotification({
            kind: "tx-failed",
            owner: address,
            titleKey: "notifications.txFailed",
            bodyKey: "notifications.txFailedBody",
            bodyParams: { function: functionName },
          });
        }
        vibrate("error");
        return null;
      }

      await queryClient.invalidateQueries();
      updateActivityStatus(txHash, "confirmed");
      toast.success("Transaction confirmed", {
        id: toastId,
        description: link ? link : txHash,
      });
      if (address) {
        pushNotification({
          kind: "tx-confirmed",
          owner: address,
          titleKey: "notifications.txConfirmed",
          bodyKey: "notifications.txConfirmedBody",
          bodyParams: { function: functionName },
        });
      }
      fireConfetti();
      vibrate("success");
      // Only the very first "begin" call is a new registration - chargeAccount
      // and everything else already has a user, so this stays a one-time
      // welcome moment rather than firing on every confirmed transaction.
      if (functionName === "begin") speakWelcome();
      return txHash;
    } catch (error) {
      toast.error("Transaction failed", {
        id: toastId,
        description: parseContractError(error),
      });
      vibrate("error");
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
