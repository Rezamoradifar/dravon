import { verifyMessage } from "viem";

import { ADMIN_ADDRESS } from "@/contracts/addresses";

const MAX_SIGNATURE_AGE_MS = 5 * 60_000;

export function adminAuthMessage(timestamp: number): string {
  return `dravon-vpn-admin-action:${timestamp}`;
}

/**
 * Verifies that a request genuinely comes from the wallet holding
 * ADMIN_ADDRESS, using a signed, timestamped message instead of a session -
 * there's no traditional login system in this app, and admin identity is
 * already wallet-based everywhere else (useIsAdmin).
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
  if (Math.abs(Date.now() - params.timestamp) > MAX_SIGNATURE_AGE_MS) {
    return { ok: false, error: "Signature expired" };
  }

  const valid = await verifyMessage({
    address: params.address as `0x${string}`,
    message: adminAuthMessage(params.timestamp),
    signature: params.signature,
  });

  return valid ? { ok: true } : { ok: false, error: "Invalid signature" };
}
