import { verifyMessage } from "viem";

const MAX_SIGNATURE_AGE_MS = 5 * 60_000;

export function walletAuthMessage(timestamp: number): string {
  return `dravon-vpn-account-action:${timestamp}`;
}

/**
 * Verifies a request genuinely comes from the wallet it claims to, via a
 * signed, timestamped message - there's no session/login system in this app,
 * and every VPN account is keyed by wallet address, so this is the only way
 * to prove "this caller may read/change wallet X's account" (its stored
 * WireGuard configs contain private keys, so this gate matters).
 */
export async function verifyWalletSignature(params: {
  address: string;
  timestamp: number;
  signature: `0x${string}`;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (Math.abs(Date.now() - params.timestamp) > MAX_SIGNATURE_AGE_MS) {
    return { ok: false, error: "Signature expired" };
  }

  const valid = await verifyMessage({
    address: params.address as `0x${string}`,
    message: walletAuthMessage(params.timestamp),
    signature: params.signature,
  });

  return valid ? { ok: true } : { ok: false, error: "Invalid signature" };
}
