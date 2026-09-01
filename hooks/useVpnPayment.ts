"use client";

import * as React from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { parseUnits } from "viem";

import { erc20Abi } from "@/contracts/erc20Abi";
import { VPN_PAYMENT_ADDRESS, VPN_PRICE_USD } from "@/lib/vpn/publicConfig";
import { parseContractError } from "@/lib/errors";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955" as const;

export type VpnTier = "plus" | "pro";
type Phase = "idle" | "paying" | "confirming" | "verifying" | "done" | "error";

/**
 * Sends a direct USDT transfer to the VPN product's payment wallet, waits for
 * on-chain confirmation, then asks the server to verify it (see
 * /api/vpn/verify-payment) before treating the subscription as recorded.
 */
export function useVpnPayment() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [txHash, setTxHash] = React.useState<string | null>(null);

  async function pay(tier: VpnTier) {
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
      const amount = parseUnits(String(VPN_PRICE_USD[tier]), 18);
      const hash = await writeContractAsync({
        address: USDT_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [VPN_PAYMENT_ADDRESS, amount],
      });
      setTxHash(hash);
      setPhase("confirming");
      await publicClient?.waitForTransactionReceipt({ hash });

      setPhase("verifying");
      const res = await fetch("/api/vpn/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, txHash: hash, tier }),
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

  return { pay, reset, phase, error, txHash };
}
