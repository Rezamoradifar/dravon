"use client";

import * as React from "react";
import { useAccount, usePublicClient, useSendTransaction, useSwitchChain, useWriteContract } from "wagmi";
import { bsc } from "wagmi/chains";
import { parseEther, parseUnits } from "viem";

import { erc20Abi } from "@/contracts/erc20Abi";
import { useNativePrice } from "@/hooks/useNativePrice";
import { VPN_PAYMENT_ADDRESS, PRICE_PER_DEVICE_USD } from "@/lib/vpn/publicConfig";
import { parseContractError } from "@/lib/errors";
import type { VpnBackend } from "@/lib/vpn/types";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955" as const;
// Absorbs ordinary BNB price drift between estimating and sending, same
// convention as the app's other BNB payment flow (useTokenPayment).
const BNB_BUFFER = 1.08;
// How long to wait for the payment to be mined / the server to answer before
// showing an error instead of spinning forever.
const RECEIPT_TIMEOUT_MS = 3 * 60_000;
const VERIFY_TIMEOUT_MS = 90_000;

export type PaymentMethod = "usdt" | "bnb";
/** "renew" extends every currently active device by 30 days (deviceCount
 * must equal the account's current count); "add" buys `deviceCount` brand
 * new devices on top of whatever the account already has. */
export type PaymentIntent = "renew" | "add";
type Phase = "idle" | "paying" | "confirming" | "verifying" | "done" | "error";

/**
 * Sends either a direct USDT transfer or a native BNB transfer to the VPN
 * product's payment wallet for `deviceCount` devices ($1/device/month),
 * waits for on-chain confirmation, then asks the server to verify it (see
 * /api/vpn/verify-payment) before treating the payment as recorded.
 */
export function useVpnPayment() {
  const { address, chainId } = useAccount();
  // Payments are always on BNB Smart Chain, whatever network the wallet shows.
  const publicClient = usePublicClient({ chainId: bsc.id });
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const { price: bnbPrice } = useNativePrice();
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [txHash, setTxHash] = React.useState<string | null>(null);
  /** Set when the payment was recorded but the config could not be created yet. */
  const [provisioningError, setProvisioningError] = React.useState<string | null>(null);

  const requiredUsd = (deviceCount: number, perDeviceUsd: number = PRICE_PER_DEVICE_USD) =>
    Math.round(deviceCount * perDeviceUsd * 100) / 100;
  const estimatedBnb = (deviceCount: number, perDeviceUsd: number = PRICE_PER_DEVICE_USD) =>
    bnbPrice ? (requiredUsd(deviceCount, perDeviceUsd) / bnbPrice) * BNB_BUFFER : undefined;

  async function pay(
    deviceCount: number,
    method: PaymentMethod,
    backend: VpnBackend,
    intent: PaymentIntent,
    options: { dataPlanId?: string; locationId?: string; perDeviceUsd?: number } = {},
  ) {
    const perDeviceUsd = options.perDeviceUsd ?? PRICE_PER_DEVICE_USD;
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
    setProvisioningError(null);
    setPhase("paying");
    let stage: "paying" | "confirming" | "verifying" = "paying";
    let sentHash: string | undefined;
    try {
      if (chainId !== bsc.id) await switchChainAsync({ chainId: bsc.id });
      let hash: `0x${string}`;
      if (method === "usdt") {
        const amount = parseUnits(String(requiredUsd(deviceCount, perDeviceUsd)), 18);
        hash = await writeContractAsync({
          address: USDT_ADDRESS,
          abi: erc20Abi,
          functionName: "transfer",
          args: [VPN_PAYMENT_ADDRESS, amount],
          chainId: bsc.id,
        });
      } else {
        const bnbAmount = estimatedBnb(deviceCount, perDeviceUsd);
        if (!bnbAmount) throw new Error("BNB price unavailable - try USDT instead");
        hash = await sendTransactionAsync({
          to: VPN_PAYMENT_ADDRESS,
          value: parseEther(bnbAmount.toFixed(8)),
          chainId: bsc.id,
        });
      }
      setTxHash(hash);
      sentHash = hash;
      stage = "confirming";
      setPhase("confirming");
      if (!publicClient) throw new Error("BNB Smart Chain connection unavailable - refresh and try again");
      await publicClient.waitForTransactionReceipt({ hash, timeout: RECEIPT_TIMEOUT_MS });

      stage = "verifying";
      setPhase("verifying");
      const res = await fetch("/api/vpn/verify-payment", {
        method: "POST",
        signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          txHash: hash,
          method,
          deviceCount,
          backend,
          intent,
          ...(backend === "marzban" ? { dataPlanId: options.dataPlanId, locationId: options.locationId } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Verification failed");
      if (json.provisioningError) setProvisioningError(json.provisioningError);

      setPhase("done");
    } catch (err) {
      const timedOut = err instanceof Error && /timeout|timed out/i.test(`${err.name} ${err.message}`);
      if (timedOut && stage !== "paying") {
        setError(
          stage === "confirming"
            ? `The network is slow to confirm your payment. It was sent (${sentHash}) - refresh this page in a few minutes to see your config.`
            : `Your payment was sent (${sentHash}) but the server is slow to respond. Refresh this page in a minute to see your config.`,
        );
        setPhase("error");
        return;
      }
      setError(parseContractError(err));
      setPhase("error");
    }
  }

  function reset() {
    setPhase("idle");
    setError(null);
    setTxHash(null);
    setProvisioningError(null);
  }

  return { pay, reset, phase, error, txHash, provisioningError, requiredUsd, estimatedBnb };
}
