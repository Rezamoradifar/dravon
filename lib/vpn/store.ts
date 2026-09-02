import { promises as fs } from "fs";
import path from "path";

import { SUBSCRIPTION_DAYS, type PaymentMethod, type VpnAccount, type VpnBackend, type VpnDevice } from "@/lib/vpn/types";

export { PRICE_PER_DEVICE_USD, SUBSCRIPTION_DAYS } from "@/lib/vpn/types";
export type { VpnAccount, VpnBackend, VpnDevice, VpnPayment, PaymentMethod } from "@/lib/vpn/types";

const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_FILE = path.join(DATA_DIR, "vpn-accounts.jsonl");

async function readAll(): Promise<VpnAccount[]> {
  try {
    const raw = await fs.readFile(ACCOUNTS_FILE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as VpnAccount);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

/** Append-only JSON-lines log, matching the site-feedback.jsonl pattern -
 * the latest record for a wallet address is its current state. */
async function appendRecord(record: VpnAccount): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(ACCOUNTS_FILE, `${JSON.stringify(record)}\n`, "utf8");
}

export async function getAccount(walletAddress: string): Promise<VpnAccount | undefined> {
  const all = await readAll();
  return [...all].reverse().find((r) => r.walletAddress.toLowerCase() === walletAddress.toLowerCase());
}

export async function findByTxHash(txHash: string): Promise<VpnAccount | undefined> {
  const all = await readAll();
  return [...all]
    .reverse()
    .find((r) => r.payments.some((p) => p.txHash.toLowerCase() === txHash.toLowerCase()));
}

/**
 * Records a verified payment: extends expiry by SUBSCRIPTION_DAYS from
 * whichever is later (now or the current expiry), and raises
 * paidDeviceCount to at least `deviceCount` (never lowers it on its own).
 *
 * `deviceCount` is the account's new *target* total - existingCount for a
 * renewal, or existingCount + addCount for adding extra devices. The caller
 * (the verify-payment route) works this out from the requested intent.
 * `chargeDeviceCount` is what this specific payment actually charged for
 * (existingCount for a renewal, just addCount for an add) and is what gets
 * recorded in the payment history log, so it reads as "paid for N
 * device(s)" rather than as the resulting total.
 */
export async function applyPayment(params: {
  walletAddress: string;
  txHash: string;
  amountUsd: number;
  method: PaymentMethod;
  deviceCount: number;
  chargeDeviceCount: number;
  backend: VpnBackend;
  /** Marzban-only - see VpnAccount.dataPlanId. Undefined leaves the
   * account's existing plan default (or unset, for WireGuard) untouched. */
  dataPlanId?: string;
}): Promise<VpnAccount> {
  const existing = await getAccount(params.walletAddress);
  const now = Date.now();
  const currentExpiry = existing ? new Date(existing.expiresAt).getTime() : 0;
  const base = Math.max(now, currentExpiry);
  const expiresAt = new Date(base + SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const record: VpnAccount = {
    walletAddress: params.walletAddress,
    expiresAt,
    paidDeviceCount: Math.max(existing?.paidDeviceCount ?? 0, params.deviceCount),
    // Fixed on first payment - a renewal/top-up can't switch an account's backend.
    backend: existing?.backend ?? params.backend,
    // Not fixed - a later payment can request a different plan (an
    // "upgrade") for whatever device(s) it's paying for; already-
    // provisioned devices keep their own recorded dataPlanId regardless.
    dataPlanId: params.dataPlanId ?? existing?.dataPlanId,
    devices: existing?.devices ?? [],
    payments: [
      ...(existing?.payments ?? []),
      {
        txHash: params.txHash,
        amountUsd: params.amountUsd,
        method: params.method,
        deviceCount: params.chargeDeviceCount,
        paidAt: new Date().toISOString(),
      },
    ],
  };

  await appendRecord(record);
  return record;
}

export async function addDevice(walletAddress: string, device: VpnDevice): Promise<VpnAccount> {
  const existing = await getAccount(walletAddress);
  if (!existing) throw new Error(`No account for ${walletAddress}`);

  const record: VpnAccount = { ...existing, devices: [...existing.devices, device] };
  await appendRecord(record);
  return record;
}

function latestPerWallet(all: VpnAccount[]): VpnAccount[] {
  const latestByWallet = new Map<string, VpnAccount>();
  for (const record of all) latestByWallet.set(record.walletAddress.toLowerCase(), record);
  return [...latestByWallet.values()];
}

export async function listNeedingProvisioning(): Promise<VpnAccount[]> {
  const all = await readAll();
  return latestPerWallet(all).filter((r) => r.devices.length < r.paidDeviceCount);
}

/** Every account's current state - used by the bot-secret-gated admin API
 * (lib/vpn/botAuth.ts) so the Telegram admin bot can read the same data the
 * human /admin panel sees. */
export async function listAllAccounts(): Promise<VpnAccount[]> {
  const all = await readAll();
  return latestPerWallet(all);
}

/**
 * Extends an existing account's expiry by `days` with no charge - e.g. the
 * Telegram bot's referral reward. Only meaningful for an account that
 * already has at least one paid device; returns undefined (no-op) for a
 * wallet with no account yet or zero paidDeviceCount, since there is
 * nothing to extend.
 */
export async function grantBonusDays(walletAddress: string, days: number): Promise<VpnAccount | undefined> {
  const existing = await getAccount(walletAddress);
  if (!existing || existing.paidDeviceCount < 1) return undefined;

  const now = Date.now();
  const currentExpiry = new Date(existing.expiresAt).getTime();
  const base = Math.max(now, currentExpiry);
  const record: VpnAccount = {
    ...existing,
    expiresAt: new Date(base + days * 24 * 60 * 60 * 1000).toISOString(),
  };

  await appendRecord(record);
  return record;
}
