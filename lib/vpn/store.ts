import { promises as fs } from "fs";
import path from "path";

import { SUBSCRIPTION_DAYS, DEVICE_LIMIT, type VpnAccount, type VpnDevice, type VpnTier } from "@/lib/vpn/types";

export { DEVICE_LIMIT, SUBSCRIPTION_DAYS } from "@/lib/vpn/types";
export type { VpnAccount, VpnDevice, VpnPayment, VpnTier } from "@/lib/vpn/types";

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

/** Records a verified payment: extends expiry, upgrades tier if the new
 * payment is for a higher tier, and creates the account on a first payment. */
export async function applyPayment(params: {
  walletAddress: string;
  tier: VpnTier;
  txHash: string;
  amountUsdt: string;
}): Promise<VpnAccount> {
  const existing = await getAccount(params.walletAddress);
  const now = Date.now();
  const currentExpiry = existing ? new Date(existing.expiresAt).getTime() : 0;
  const base = Math.max(now, currentExpiry);
  const expiresAt = new Date(base + SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // A tier upgrade takes effect immediately; a same-or-lower-tier renewal
  // keeps the account's existing (possibly higher) tier.
  const tier: VpnTier =
    !existing || DEVICE_LIMIT[params.tier] > DEVICE_LIMIT[existing.tier] ? params.tier : existing.tier;

  const record: VpnAccount = {
    walletAddress: params.walletAddress,
    tier,
    expiresAt,
    devices: existing?.devices ?? [],
    payments: [
      ...(existing?.payments ?? []),
      { txHash: params.txHash, amountUsdt: params.amountUsdt, tier: params.tier, paidAt: new Date().toISOString() },
    ],
    needsProvisioning: true,
  };

  await appendRecord(record);
  return record;
}

export async function addDevice(walletAddress: string, device: VpnDevice): Promise<VpnAccount> {
  const existing = await getAccount(walletAddress);
  if (!existing) throw new Error(`No account for ${walletAddress}`);

  const record: VpnAccount = {
    ...existing,
    devices: [...existing.devices, device],
    needsProvisioning: false,
  };
  await appendRecord(record);
  return record;
}

export async function markProvisioningHandled(walletAddress: string): Promise<void> {
  const existing = await getAccount(walletAddress);
  if (!existing) return;
  await appendRecord({ ...existing, needsProvisioning: false });
}

export async function listNeedingProvisioning(): Promise<VpnAccount[]> {
  const all = await readAll();
  const latestByWallet = new Map<string, VpnAccount>();
  for (const record of all) latestByWallet.set(record.walletAddress.toLowerCase(), record);
  return [...latestByWallet.values()].filter((r) => r.needsProvisioning);
}
