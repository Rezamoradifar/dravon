import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, "vpn-subscriptions.jsonl");

export type VpnSubscriptionStatus = "pending_provisioning" | "active" | "rejected";

export interface VpnSubscription {
  walletAddress: string;
  tier: "plus" | "pro";
  txHash: string;
  amountUsdt: string;
  paidAt: string;
  status: VpnSubscriptionStatus;
  provisionedAt?: string;
  /** Set once an admin marks a payment invalid on manual review. */
  rejectedReason?: string;
}

async function readAll(): Promise<VpnSubscription[]> {
  try {
    const raw = await fs.readFile(SUBSCRIPTIONS_FILE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as VpnSubscription);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

/**
 * Append-only JSON-lines log, matching the existing site-feedback.jsonl
 * pattern - there's no database in this project, and one txHash per line is
 * enough to reconstruct current state (the latest record for a txHash wins).
 */
async function appendRecord(record: VpnSubscription): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(SUBSCRIPTIONS_FILE, `${JSON.stringify(record)}\n`, "utf8");
}

export async function recordPayment(record: Omit<VpnSubscription, "status">): Promise<void> {
  await appendRecord({ ...record, status: "pending_provisioning" });
}

export async function markProvisioned(txHash: string): Promise<void> {
  const existing = await findByTxHash(txHash);
  if (!existing) throw new Error(`No subscription found for txHash ${txHash}`);
  await appendRecord({ ...existing, status: "active", provisionedAt: new Date().toISOString() });
}

export async function markRejected(txHash: string, reason: string): Promise<void> {
  const existing = await findByTxHash(txHash);
  if (!existing) throw new Error(`No subscription found for txHash ${txHash}`);
  await appendRecord({ ...existing, status: "rejected", rejectedReason: reason });
}

/** Latest record per txHash, since re-appending is how status updates are made. */
export async function findByTxHash(txHash: string): Promise<VpnSubscription | undefined> {
  const all = await readAll();
  return [...all].reverse().find((r) => r.txHash.toLowerCase() === txHash.toLowerCase());
}

export async function listPending(): Promise<VpnSubscription[]> {
  const all = await readAll();
  const latestByTx = new Map<string, VpnSubscription>();
  for (const record of all) latestByTx.set(record.txHash.toLowerCase(), record);
  return [...latestByTx.values()].filter((r) => r.status === "pending_provisioning");
}
