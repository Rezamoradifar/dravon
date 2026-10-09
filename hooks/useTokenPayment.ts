"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import { type Address, parseUnits } from "viem";

import { parseNativeAmount } from "@/lib/payment-validation";
import { PRIMARY_CHAIN_ID } from "@/lib/wagmi";
import { erc20FullAbi } from "@/contracts/pancakeRouterAbi";
import { useLatestRoundWindow } from "@/hooks/useLatestRoundWindow";
import { useNativePrice } from "@/hooks/useNativePrice";
import { parseContractError } from "@/lib/errors";

function requiredCost(cost: number | undefined) { return cost !== undefined && Number.isFinite(cost) && cost > 0; }

export type PaymentMethod = "usdt" | "bnb";

/**
 * The Window contract charges exactly `costUsd` USDT (18 decimals on BSC), payable
 * either directly (requires an ERC20 approval to `spender`) or by sending BNB as
 * `msg.value`, which the contract swaps for the exact USDT amount via PancakeSwap V3
 * and refunds any unused BNB. This hook manages both paths.
 */
export function useTokenPayment(
  costUsd: number | undefined,
  stableToken: Address | undefined,
  spender: Address,
  nativeBalance?: bigint,
) {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: PRIMARY_CHAIN_ID });
  const chainId = useChainId();
  const activeWindow = useLatestRoundWindow();
  const canApprove = Boolean(address && publicClient && chainId === PRIMARY_CHAIN_ID && activeWindow.isConfirmed && !activeWindow.isError && spender.toLowerCase() === activeWindow.address.toLowerCase() && stableToken && requiredCost(costUsd));
  const approving = React.useRef(false);
  const [method, setMethod] = React.useState<PaymentMethod>("usdt");
  const [bnbAmount, setBnbAmountState] = React.useState("");
  const manualAmount = React.useRef(false);
  const setBnbAmount = (value: string) => { manualAmount.current = true; setBnbAmountState(value); };
  const [isApproving, setIsApproving] = React.useState(false);

  const { writeContractAsync } = useWriteContract();
  const { price: bnbPrice } = useNativePrice();

  const requiredUsdt = requiredCost(costUsd) ? parseUnits(costUsd!.toFixed(6), 18) : undefined;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    chainId: PRIMARY_CHAIN_ID,
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

  /**
   * The contract swaps sent BNB for the exact required USDT internally via
   * PancakeSwap and refunds any unused BNB. Our BNB estimate here comes from an
   * off-chain price feed (Chainlink/CoinGecko) that never matches the pool's
   * spot price to the cent and doesn't include the swap's own fee, so an amount
   * computed from the raw USD cost can land just short and revert. This fixed
   * cent buffer absorbs that ordinary drift on top of the 5% safety margin below.
   */
  const PAYMENT_BUFFER_USD = 0.01;

  const estimatedBnb =
    costUsd !== undefined && bnbPrice ? (costUsd + PAYMENT_BUFFER_USD) / bnbPrice : undefined;

  React.useEffect(() => {
    manualAmount.current = false;
    setBnbAmountState("");
  }, [costUsd, address, spender]);
  React.useEffect(() => {
    if (estimatedBnb !== undefined && !manualAmount.current) setBnbAmountState((estimatedBnb * 1.05).toFixed(6));
  }, [estimatedBnb, costUsd, address, spender]);

  async function approve() {
    if (!canApprove || approving.current || !address || !publicClient || chainId !== PRIMARY_CHAIN_ID || !stableToken || requiredUsdt === undefined) return;
    approving.current = true;
    setIsApproving(true);
    const toastId = toast.loading("Approve USDT spending in your wallet...");
    try {
      const txHash = await writeContractAsync({
        chainId: PRIMARY_CHAIN_ID,
        address: stableToken,
        abi: erc20FullAbi,
        functionName: "approve",
        args: [spender, requiredUsdt],
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      if (receipt.status !== "success") throw new Error("Approval reverted on-chain.");
      await refetchAllowance();
      toast.success("USDT approved", { id: toastId });
    } catch (error) {
      toast.error("Approval failed", { id: toastId, description: parseContractError(error) });
      throw error;
    } finally {
      approving.current = false;
      setIsApproving(false);
    }
  }

  let value: bigint | undefined;
  let isPaymentValid = false;
  let hasInsufficientBnbBalance = false;
  if (method === "usdt") {
    isPaymentValid = !needsApproval && requiredUsdt !== undefined;
    value = undefined;
  } else {
    const parsedBnb = parseNativeAmount(bnbAmount);
    hasInsufficientBnbBalance =
      parsedBnb !== undefined && nativeBalance !== undefined && parsedBnb > nativeBalance;
    isPaymentValid = parsedBnb !== undefined && !hasInsufficientBnbBalance;
    value = parsedBnb;
  }

  return {
    canApprove,
    method,
    setMethod,
    requiredUsdt,
    allowance,
    needsApproval,
    hasInsufficientBnbBalance,
    approve,
    isApproving,
    bnbAmount,
    setBnbAmount,
    estimatedBnb,
    value,
    isPaymentValid: isPaymentValid && chainId === PRIMARY_CHAIN_ID && !isApproving,
  };
}
