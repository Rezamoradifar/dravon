"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import { type Address, parseUnits, parseEther, maxUint256 } from "viem";

import { erc20FullAbi } from "@/contracts/pancakeRouterAbi";
import { useNativePrice } from "@/hooks/useNativePrice";
import { parseContractError } from "@/lib/errors";

export type PaymentMethod = "usdt" | "bnb";

/**
 * The Window contract charges exactly `costUsd` USDT (18 decimals on BSC), payable
 * either directly (requires an ERC20 approval to `spender`) or by sending BNB as
 * `msg.value`, which the contract swaps for the exact USDT amount via PancakeSwap V3
 * and refunds any unused BNB. This hook manages both paths.
 */
export function useTokenPayment(costUsd: number | undefined, stableToken: Address | undefined, spender: Address) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [method, setMethod] = React.useState<PaymentMethod>("usdt");
  const [bnbAmount, setBnbAmount] = React.useState("");
  const [isApproving, setIsApproving] = React.useState(false);

  const { writeContractAsync } = useWriteContract();
  const { price: bnbPrice } = useNativePrice();

  const requiredUsdt = costUsd !== undefined ? parseUnits(costUsd.toFixed(6), 18) : undefined;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: stableToken,
    abi: erc20FullAbi,
    functionName: "allowance",
    args: address && stableToken ? [address, spender] : undefined,
    query: { enabled: Boolean(address && stableToken) },
  });

  const needsApproval =
    method === "usdt" &&
    requiredUsdt !== undefined &&
    (allowance === undefined || allowance < requiredUsdt);

  const estimatedBnb = costUsd !== undefined && bnbPrice ? costUsd / bnbPrice : undefined;

  React.useEffect(() => {
    if (estimatedBnb !== undefined && bnbAmount === "") {
      setBnbAmount((estimatedBnb * 1.05).toFixed(6));
    }
    // Only seed the default once an estimate first becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatedBnb !== undefined]);

  async function approve() {
    if (!stableToken || requiredUsdt === undefined) return;
    setIsApproving(true);
    const toastId = toast.loading("Approve USDT spending in your wallet...");
    try {
      const txHash = await writeContractAsync({
        address: stableToken,
        abi: erc20FullAbi,
        functionName: "approve",
        args: [spender, maxUint256],
      });
      await publicClient?.waitForTransactionReceipt({ hash: txHash });
      await refetchAllowance();
      toast.success("USDT approved", { id: toastId });
    } catch (error) {
      toast.error("Approval failed", { id: toastId, description: parseContractError(error) });
      throw error;
    } finally {
      setIsApproving(false);
    }
  }

  let value: bigint | undefined;
  let isPaymentValid = false;
  if (method === "usdt") {
    isPaymentValid = !needsApproval && requiredUsdt !== undefined;
    value = undefined;
  } else {
    const parsedBnb = bnbAmount !== "" && Number(bnbAmount) > 0 ? parseEther(bnbAmount) : undefined;
    isPaymentValid = parsedBnb !== undefined;
    value = parsedBnb;
  }

  return {
    method,
    setMethod,
    requiredUsdt,
    allowance,
    needsApproval,
    approve,
    isApproving,
    bnbAmount,
    setBnbAmount,
    estimatedBnb,
    value,
    isPaymentValid,
  };
}
