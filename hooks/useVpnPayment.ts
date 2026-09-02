"use client";

import * as React from "react";
import { useAccount, usePublicClient, useSendTransaction, useWriteContract } from "wagmi";
import { parseEther, parseUnits } from "viem";

import { erc20Abi } from "@/contracts/erc20Abi";
import { useNativePrice } from "@/hooks/useNativePrice";
import { VPN_PAYMENT_ADDRESS, PRICE_PER_DEVICE_USD } from "@/lib/vpn/publicConfig";
import { parseContractError } from "@/lib/errors";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955" as const;
// Absorbs ordinary BNB price drift between estimating and sending, same
// convention as the app's other BNB payment flow (useTokenPayment).
const BNB_BUFFER = 1.08;

export type PaymentMethod = "usdt" | "bnb";
type Phase = "idle" | "paying" | "confirming" | "verifying" | "done" | "error";

/**
 * Sends either a direct USDT transfer or a native BNB transfer to the VPN
 * product's payment wallet for `deviceCount` devices ($1/device/month),
 * waits for on-chain confirmation, then asks the server to verify it (see
 * /api/vpn/verify-payment) before treating the payment as recorded.
 */
export function useVpnPayment() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const { price: bnbPrice } = useNativePrice();
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [txHash, setTxHash] = React.useState<string | null>(null);

  const requiredUsd = (deviceCount: number) => deviceCount * PRICE_PER_DEVICE_USD;
  const estimatedBnb = (deviceCount: number) =>
    bnbPrice ? (requiredUsd(deviceCount) / bnbPrice) * BNB_BUFFER : undefined;

  async function pay(deviceCount: number, method: PaymentMethod) {
    if (!address) {
      setError("Connect your wallet first");
      setPhase("error");
      return;
    }
    if (!VPN_PAYMENT_ADDRESS) {
      setError("VPN payments are not live yet");
      setPhase("error");
      return;
    }

    setError(null);
    setPhase("paying");
    try {
      let hash: `0x${string}`;
      if (method === "usdt") {
        const amount = parseUnits(String(requiredUsd(deviceCount)), 18);
        hash = await writeContractAsync({
          address: USDT_ADDRESS,
          abi: erc20Abi,
          functionName: "transfer",
          args: [VPN_PAYMENT_ADDRESS, amount],
        });
      } else {
        const bnbAmount = estimatedBnb(deviceCount);
        if (!bnbAmount) throw new Error("BNB price unavailable - try USDT instead");
        hash = await sendTransactionAsync({ to: VPN_PAYMENT_ADDRESS, value: parseEther(bnbAmount.toFixed(8)) });
      }
      setTxHash(hash);
      setPhase("confirming");
      await publicClient?.waitForTransactionReceipt({ hash });

      setPhase("verifying");
      const res = await fetch("/api/vpn/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, txHash: hash, method, deviceCount }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Verification failed");

      setPhase("done");
    } catch (err) {
      setError(parseContractError(err));
      setPhase("error");
    }
  }

  function reset() {
    setPhase("idle");
    setError(null);
    setTxHash(null);
  }

  return { pay, reset, phase, error, txHash, requiredUsd, estimatedBnb };
}
