import { promises as fs } from "fs";
import path from "path";

/**
 * Free, one-time-per-wallet trial tracking - deliberately separate from
 * vpn-accounts.jsonl (paid accounts). A trial never touches paidDeviceCount
 * or an account's real device list, so it can never be mistaken for, or
 * silently convert into, a paid entitlement.
 */
export interface TrialRecord {
  walletAddress: string;
  subscriptionUrl: string;
  grantedAt: string;
  expiresAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const TRIALS_FILE = path.join(DATA_DIR, "vpn-trials.jsonl");

async function readAll(): Promise<TrialRecord[]> {
  try {
    const raw = await fs.readFile(TRIALS_FILE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as TrialRecord);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function hasUsedTrial(walletAddress: string): Promise<boolean> {
  const all = await readAll();
  return all.some((r) => r.walletAddress.toLowerCase() === walletAddress.toLowerCase());
}

/**
 * How many trials were granted in the last 24 hours (rolling window, not
 * calendar-day, so it doesn't reset all at once at midnight). A wallet
 * address costs nothing to generate, so "one per wallet" alone doesn't stop
 * someone from farming many trials - this caps the total blast radius of
 * that (see TRIAL_DAILY_LIMIT in lib/vpn/types.ts) regardless of how many
 * different wallets are used.
 */
export async function countTrialsInLast24h(): Promise<number> {
  const all = await readAll();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return all.filter((r) => new Date(r.grantedAt).getTime() >= cutoff).length;
}

export async function recordTrial(record: TrialRecord): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(TRIALS_FILE, `${JSON.stringify(record)}\n`, "utf8");
}
