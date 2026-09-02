import { NextResponse } from "next/server";
import { decodeEventLog, formatUnits, isAddress } from "viem";

import { erc20Abi } from "@/contracts/erc20Abi";
import { chainlinkAggregatorAbi } from "@/contracts/chainlinkAggregatorAbi";
import { NATIVE_PRICE_FEEDS } from "@/lib/nativePriceFeeds";
import { getVpnConfig, isPaymentConfigured, isServerConfigured, isMarzbanConfigured } from "@/lib/vpn/config";
import { provisionDevice } from "@/lib/vpn/provision";
import { vpnServerPublicClient } from "@/lib/vpn/serverPublicClient";
import { addDevice, applyPayment, findByTxHash, getAccount } from "@/lib/vpn/store";
import { getDataPlan, MARZBAN_DATA_PLANS } from "@/lib/vpn/types";
import { bsc } from "viem/chains";

export const runtime = "nodejs";

// Binance-Peg BSC-USD (BEP-20 USDT) - 18 decimals, unlike Ethereum mainnet USDT.
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
// A BNB payment's USD value can drift between submission and verification -
// accepted down to 90% of the required amount to absorb ordinary price
// movement, matching the buffer philosophy already used for BNB payments
// elsewhere in this app (useTokenPayment's PAYMENT_BUFFER_USD).
const BNB_PRICE_TOLERANCE = 0.9;
// A single verify-payment call provisions at most this many devices, so one
// oversized deviceCount can't trigger an unbounded run of SSH calls.
const MAX_DEVICES_PER_CALL = 10;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { walletAddress, txHash, method, deviceCount, backend, intent, dataPlanId } = (body ?? {}) as {
    walletAddress?: unknown;
    txHash?: unknown;
    method?: unknown;
    deviceCount?: unknown;
    backend?: unknown;
    intent?: unknown;
    dataPlanId?: unknown;
  };

  if (typeof walletAddress !== "string" || !isAddress(walletAddress)) {
    return NextResponse.json({ error: "Invalid walletAddress" }, { status: 400 });
  }
  if (typeof txHash !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    return NextResponse.json({ error: "Invalid txHash" }, { status: 400 });
  }
  if (method !== "usdt" && method !== "bnb") {
    return NextResponse.json({ error: "method must be 'usdt' or 'bnb'" }, { status: 400 });
  }
  if (backend !== "wireguard" && backend !== "marzban") {
    return NextResponse.json({ error: "backend must be 'wireguard' or 'marzban'" }, { status: 400 });
  }
  if (intent !== "renew" && intent !== "add") {
    return NextResponse.json({ error: "intent must be 'renew' or 'add'" }, { status: 400 });
  }
  if (typeof deviceCount !== "number" || !Number.isInteger(deviceCount) || deviceCount < 1 || deviceCount > MAX_DEVICES_PER_CALL) {
    return NextResponse.json({ error: `deviceCount must be an integer between 1 and ${MAX_DEVICES_PER_CALL}` }, { status: 400 });
  }
  // Data plans (GB caps) only exist for Marzban - WireGuard has no metering
  // in this app, so it stays flat-rate unlimited regardless of this field.
  if (dataPlanId !== undefined) {
    if (backend !== "marzban") {
      return NextResponse.json({ error: "dataPlanId is only valid for the 'marzban' backend" }, { status: 400 });
    }
    if (typeof dataPlanId !== "string" || !MARZBAN_DATA_PLANS.some((p) => p.id === dataPlanId)) {
      return NextResponse.json({ error: "Invalid dataPlanId" }, { status: 400 });
    }
  }

  const config = getVpnConfig();
  if (!isPaymentConfigured(config)) {
    return NextResponse.json(
      { error: "VPN payments are not configured yet - set NEXT_PUBLIC_VPN_PAYMENT_ADDRESS." },
      { status: 503 },
    );
  }

  const existing = await findByTxHash(txHash);
  if (existing) {
    return NextResponse.json({ ok: true, account: existing, alreadyRecorded: true });
  }

  const existingAccount = await getAccount(walletAddress);
  const existingCount = existingAccount?.paidDeviceCount ?? 0;

  // "renew" pays to extend every currently active device by another 30 days
  // (the target device count doesn't change) - `deviceCount` must exactly
  // match the account's current count, so a client can't under-price a
  // renewal. "add" pays for `deviceCount` brand new devices on top of
  // whatever the account already has.
  let chargeDeviceCount: number;
  let targetDeviceCount: number;
  if (intent === "renew") {
    if (existingCount < 1) {
      return NextResponse.json({ error: "Nothing to renew yet - buy a device first." }, { status: 400 });
    }
    if (deviceCount !== existingCount) {
      return NextResponse.json(
        { error: `A renewal must cover all ${existingCount} active device(s) - send deviceCount: ${existingCount}.` },
        { status: 400 },
      );
    }
    chargeDeviceCount = existingCount;
    targetDeviceCount = existingCount;
  } else {
    chargeDeviceCount = deviceCount;
    targetDeviceCount = existingCount + deviceCount;
  }

  const paymentAddress = config.paymentAddress!.toLowerCase();
  // GB data plans only change the price for Marzban; WireGuard always uses
  // the flat per-device rate, and Marzban with no plan given (or plan
  // "unlimited") also resolves to that same flat rate.
  const perDevicePrice = backend === "marzban" ? getDataPlan(dataPlanId as string | undefined).priceUsd : config.pricePerDeviceUsd;
  const requiredUsd = chargeDeviceCount * perDevicePrice;
  let paidUsd: number;

  if (method === "usdt") {
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

    const matchedLog = receipt.logs.find((log) => {
      if (log.address.toLowerCase() !== USDT_ADDRESS.toLowerCase()) return false;
      try {
        const event = decodeEventLog({ abi: erc20Abi, data: log.data, topics: log.topics, eventName: "Transfer" });
        return (
          event.args.to.toLowerCase() === paymentAddress && event.args.from.toLowerCase() === walletAddress.toLowerCase()
        );
      } catch {
        return false;
      }
    });
    if (!matchedLog) {
      return NextResponse.json({ error: "No matching USDT transfer to the payment address found in this transaction." }, { status: 400 });
    }
    const value = decodeEventLog({ abi: erc20Abi, data: matchedLog.data, topics: matchedLog.topics, eventName: "Transfer" })
      .args.value;
    paidUsd = Number(formatUnits(value, 18));

    if (paidUsd < requiredUsd) {
      return NextResponse.json(
        { error: `Payment ($${paidUsd.toFixed(2)}) is less than required ($${requiredUsd} for ${chargeDeviceCount} device(s)).` },
        { status: 400 },
      );
    }
  } else {
    let tx;
    let receipt;
    try {
      tx = await vpnServerPublicClient.getTransaction({ hash: txHash as `0x${string}` });
      receipt = await vpnServerPublicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
    } catch {
      return NextResponse.json({ error: "Transaction not found on-chain yet - try again shortly." }, { status: 404 });
    }
    if (receipt.status !== "success") {
      return NextResponse.json({ error: "Transaction failed on-chain" }, { status: 400 });
    }
    if (tx.from.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ error: "Transaction sender does not match walletAddress" }, { status: 400 });
    }
    if (!tx.to || tx.to.toLowerCase() !== paymentAddress) {
      return NextResponse.json({ error: "Transaction recipient is not the VPN payment address" }, { status: 400 });
    }

    const feed = NATIVE_PRICE_FEEDS[bsc.id];
    const [decimals, roundData] = await Promise.all([
      vpnServerPublicClient.readContract({ address: feed.chainlinkFeed, abi: chainlinkAggregatorAbi, functionName: "decimals" }),
      vpnServerPublicClient.readContract({ address: feed.chainlinkFeed, abi: chainlinkAggregatorAbi, functionName: "latestRoundData" }),
    ]);
    const bnbUsdPrice = Number(roundData[1]) / 10 ** decimals;
    paidUsd = Number(formatUnits(tx.value, 18)) * bnbUsdPrice;

    if (paidUsd < requiredUsd * BNB_PRICE_TOLERANCE) {
      return NextResponse.json(
        {
          error: `Payment (~$${paidUsd.toFixed(2)} at $${bnbUsdPrice.toFixed(0)}/BNB) is less than required ($${requiredUsd} for ${chargeDeviceCount} device(s)).`,
        },
        { status: 400 },
      );
    }
  }

  let account = await applyPayment({
    walletAddress,
    txHash,
    amountUsd: paidUsd,
    method,
    deviceCount: targetDeviceCount,
    chargeDeviceCount,
    backend,
    dataPlanId: backend === "marzban" ? (dataPlanId as string | undefined) : undefined,
  });

  // Provision whatever devices this payment brought the account up to,
  // capped per-call - if the backend isn't configured, or a provisioning
  // call fails partway through, the account simply stays under its
  // paidDeviceCount and the admin panel's fallback list picks up the rest.
  const backendReady = account.backend === "wireguard" ? isServerConfigured(config) : isMarzbanConfigured(config);
  if (backendReady) {
    while (account.devices.length < account.paidDeviceCount && account.devices.length < MAX_DEVICES_PER_CALL) {
      const result = await provisionDevice(walletAddress, account.devices.length + 1, account.backend, account.dataPlanId);
      if (!result.ok) break;
      account = await addDevice(walletAddress, result.device);
    }
  }

  return NextResponse.json({ ok: true, account });
}
