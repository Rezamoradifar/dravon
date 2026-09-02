import { ADMIN_ADDRESS } from "@/contracts/addresses";
import { verifyWalletSignature } from "@/lib/vpn/walletAuth";

/**
 * Same signed-message proof as walletAuth.ts, plus a check that the signer
 * is the configured admin wallet - admin identity is wallet-based everywhere
 * else in this app (useIsAdmin), so this matches rather than introducing a
 * separate login.
 */
export async function verifyAdminSignature(params: {
  address: string;
  timestamp: number;
  signature: `0x${string}`;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!ADMIN_ADDRESS) return { ok: false, error: "No admin address configured" };
  if (params.address.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
    return { ok: false, error: "Not the admin address" };
  }
  return verifyWalletSignature(params);
}
