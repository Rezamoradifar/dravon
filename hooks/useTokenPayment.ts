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
import { type Address, parseUnits, parseEther, maxUint256 } from "viem";

import { CHAIN_ID, CONTRACTS_CONFIGURED, FACTORY_ADDRESS } from "@/contracts/addresses";
import { factoryAbi } from "@/contracts/factoryAbi";
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
export function useTokenPayment(
  costUsd: number | undefined,
  stableToken: Address | undefined,
  spender: Address | undefined,
  nativeBalance?: bigint,
) {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: CHAIN_ID });
  const chainId = useChainId();
  const [method, setMethod] = React.useState<PaymentMethod>("usdt");
  const [bnbAmount, setBnbAmount] = React.useState("");
  const [isApproving, setIsApproving] = React.useState(false);

  const { writeContractAsync } = useWriteContract();
  const { price: bnbPrice } = useNativePrice();

  const requiredUsdt = costUsd !== undefined ? parseUnits(costUsd.toFixed(6), 18) : undefined;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: stableToken,
    chainId: CHAIN_ID,
    abi: erc20FullAbi,
    functionName: "allowance",
    args: address && stableToken && spender ? [address, spender] : undefined,
    query: { enabled: Boolean(address && stableToken && spender) },
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
    if (estimatedBnb !== undefined && bnbAmount === "") {
      setBnbAmount((estimatedBnb * 1.05).toFixed(6));
    }
    // Only seed the default once an estimate first becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatedBnb !== undefined]);

  async function approve() {
    if (!CONTRACTS_CONFIGURED || !stableToken || !spender || requiredUsdt === undefined || !publicClient) return;
    setIsApproving(true);
    const toastId = toast.loading("Approve USDT spending in your wallet...");
    try {
      if (chainId !== CHAIN_ID) throw new Error("Switch your wallet to the contract network first.");
      const latest = await publicClient.readContract({ address: FACTORY_ADDRESS, abi: factoryAbi, functionName: "getLatestWindow" });
      if (latest.toLowerCase() !== spender.toLowerCase()) throw new Error("The round changed. Refresh before approving USDT.");
      const txHash = await writeContractAsync({
        chainId: CHAIN_ID,
        address: stableToken,
        abi: erc20FullAbi,
        functionName: "approve",
        args: [spender, maxUint256],
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      if (receipt.status !== "success") throw new Error("USDT approval reverted.");
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
  let hasInsufficientBnbBalance = false;
  if (method === "usdt") {
    isPaymentValid = !needsApproval && requiredUsdt !== undefined;
    value = undefined;
  } else {
    const parsedBnb = bnbAmount !== "" && Number(bnbAmount) > 0 ? parseEther(bnbAmount) : undefined;
    hasInsufficientBnbBalance =
      parsedBnb !== undefined && nativeBalance !== undefined && parsedBnb > nativeBalance;
    isPaymentValid = parsedBnb !== undefined && !hasInsufficientBnbBalance;
    value = parsedBnb;
  }

  return {
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
    isPaymentValid: isPaymentValid && CONTRACTS_CONFIGURED && Boolean(spender) && chainId === CHAIN_ID,
  };
}
