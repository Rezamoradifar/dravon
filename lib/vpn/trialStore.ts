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

export async function recordTrial(record: TrialRecord): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.appendFile(TRIALS_FILE, `${JSON.stringify(record)}\n`, "utf8");
}
