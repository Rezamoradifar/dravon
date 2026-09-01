import { NextResponse } from "next/server";
import { decodeEventLog, formatUnits, isAddress, parseUnits } from "viem";

import { erc20Abi } from "@/contracts/erc20Abi";
import { getVpnConfig, isPaymentConfigured } from "@/lib/vpn/config";
import { vpnServerPublicClient } from "@/lib/vpn/serverPublicClient";
import { findByTxHash, recordPayment } from "@/lib/vpn/store";

export const runtime = "nodejs";

// Binance-Peg BSC-USD (BEP-20 USDT) - 18 decimals, unlike Ethereum mainnet USDT.
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { walletAddress, txHash, tier } = (body ?? {}) as {
    walletAddress?: unknown;
    txHash?: unknown;
    tier?: unknown;
  };

  if (typeof walletAddress !== "string" || !isAddress(walletAddress)) {
    return NextResponse.json({ error: "Invalid walletAddress" }, { status: 400 });
  }
  if (typeof txHash !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    return NextResponse.json({ error: "Invalid txHash" }, { status: 400 });
  }
  if (tier !== "plus" && tier !== "pro") {
    return NextResponse.json({ error: "tier must be 'plus' or 'pro'" }, { status: 400 });
  }

  const config = getVpnConfig();
  if (!isPaymentConfigured(config)) {
    return NextResponse.json(
      { error: "VPN payments are not configured yet - set VPN_PAYMENT_ADDRESS." },
      { status: 503 },
    );
  }

  const existing = await findByTxHash(txHash);
  if (existing) {
    return NextResponse.json({ ok: true, status: existing.status, alreadyRecorded: true });
  }

  let receipt;
  try {
    receipt = await vpnServerPublicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
  } catch {
    return NextResponse.json({ error: "Transaction not found on-chain yet - try again shortly." }, { status: 404 });
  }

  if (receipt.status !== "success") {
    return NextResponse.json({ error: "Transaction failed on-chain" }, { status: 400 });
  }
  if (receipt.from.toLowerCase() !== walletAddress.toLowerCase()) {
    return NextResponse.json({ error: "Transaction sender does not match walletAddress" }, { status: 400 });
  }

  const requiredAmount = parseUnits(String(config.priceUsd[tier]), 18);
  const paymentAddress = config.paymentAddress!.toLowerCase();

  const validTransfer = receipt.logs.some((log) => {
    if (log.address.toLowerCase() !== USDT_ADDRESS.toLowerCase()) return false;
    try {
      const event = decodeEventLog({ abi: erc20Abi, data: log.data, topics: log.topics, eventName: "Transfer" });
      return (
        event.args.to.toLowerCase() === paymentAddress &&
        event.args.from.toLowerCase() === walletAddress.toLowerCase() &&
        event.args.value >= requiredAmount
      );
    } catch {
      return false;
    }
  });

  if (!validTransfer) {
    return NextResponse.json(
      { error: `No matching USDT transfer of at least $${config.priceUsd[tier]} to the payment address found in this transaction.` },
      { status: 400 },
    );
  }

  const matchedLog = receipt.logs.find((log) => log.address.toLowerCase() === USDT_ADDRESS.toLowerCase());
  const amount = matchedLog
    ? decodeEventLog({ abi: erc20Abi, data: matchedLog.data, topics: matchedLog.topics, eventName: "Transfer" }).args
        .value
    : requiredAmount;

  await recordPayment({
    walletAddress,
    tier,
    txHash,
    amountUsdt: formatUnits(amount, 18),
    paidAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, status: "pending_provisioning" });
}
