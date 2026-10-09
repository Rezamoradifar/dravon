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

import { PRIMARY_CHAIN_ID } from "@/lib/wagmi";
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
  const publicClient = usePublicClient({ chainId: PRIMARY_CHAIN_ID });
  const submitting = React.useRef(false);
  const { address: windowAddress, isConfirmed: isWindowConfirmed, isError: isWindowError } = useLatestRoundWindow();
  const [estimatedGas, setEstimatedGas] = React.useState<bigint | null>(null);
  const [isEstimating, setIsEstimating] = React.useState(false);

  const { writeContractAsync, data: hash, isPending: isSigning, reset } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isReceiptReceived,
    data: confirmedReceipt,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash, chainId: PRIMARY_CHAIN_ID });

  const isConfirmed = isReceiptReceived && confirmedReceipt?.status === "success";
  const chain = chains.find((c) => c.id === chainId);

  async function estimateGas(args: readonly unknown[], value?: bigint) {
    if (!publicClient || !address || chainId !== PRIMARY_CHAIN_ID || !isWindowConfirmed || isWindowError) return null;
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
    } catch {
      setEstimatedGas(null);
      return null;
    } finally {
      setIsEstimating(false);
    }
  }

  async function execute(args: readonly unknown[], value?: bigint) {
    if (submitting.current) return null;
    if (!publicClient || !address || chainId !== PRIMARY_CHAIN_ID || !isWindowConfirmed || isWindowError) {
      throw new Error("Connect to the project network and wait for the active contract to load.");
    }
    submitting.current = true;
    reset();
    let submittedHash: string | undefined;
    const toastId = toast.loading("Confirm the transaction in your wallet...");
    try {
      const txHash = await writeContractAsync({
        chainId: PRIMARY_CHAIN_ID,
        address: windowAddress,
        abi: roundWindowAbi as unknown as Abi,
        functionName,
        args,
        value,
      });

      submittedHash = txHash;
      if (address) logActivity({ hash: txHash, functionName, from: address, chainId: PRIMARY_CHAIN_ID });

      const link = explorerTxLink(chainId, chain?.blockExplorers?.default.url, txHash);
      toast.loading("Transaction submitted, waiting for confirmation...", {
        id: toastId,
        description: link ? link : txHash,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status === "reverted") {
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
      toast.error(submittedHash ? "Transaction submitted; confirmation could not be verified." : "Transaction failed", {
        id: toastId,
        description: parseContractError(error),
      });
      vibrate("error");
      throw error;
    } finally {
      submitting.current = false;
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
