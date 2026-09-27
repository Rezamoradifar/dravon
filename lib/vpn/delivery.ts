import { promises as fs } from "node:fs";
import path from "node:path";
import { provisionDevice } from "@/lib/vpn/provision";
import { addDevice, getAccount } from "@/lib/vpn/store";

/** All delivery paths share a filesystem lock, including separate PM2 workers.
 * A crashed worker leaves the lock in place for operator inspection; never
 * automatically steal it while a remote provision might still be running. */
export async function deliverNextDevice(walletAddress: string) {
  if (!/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) return { ok: false as const, error: "Invalid wallet address" };
  const directory = path.join(process.cwd(), "data", "vpn-delivery-locks");
  await fs.mkdir(directory, { recursive: true });
  const lock = path.join(directory, walletAddress.toLowerCase());
  try {
    await fs.mkdir(lock);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      return { ok: false as const, error: "Delivery is already running. Please retry shortly; contact support if this persists." };
    }
    throw error;
  }
  try {
    const account = await getAccount(walletAddress);
    if (!account) return { ok: false as const, error: "No paid account found" };
    if (account.devices.length >= account.paidDeviceCount) return { ok: true as const, account };
    if (new Date(account.expiresAt).getTime() <= Date.now()) return { ok: false as const, error: "Subscription expired. Contact support about your undelivered purchase." };
    const result = await provisionDevice(walletAddress, account.devices.length + 1, account.backend, account.dataPlanId, account.locationId);
    if (!result.ok) return result;
    const updated = await addDevice(walletAddress, result.device);
    return { ok: true as const, account: updated, config: result.device.config };
  } finally {
    await fs.rmdir(lock);
  }
}
