/**
 * Pure types/constants shared by both server code (lib/vpn/store.ts, API
 * routes) and client components (the account panel, admin panel). Kept
 * separate from store.ts specifically because store.ts imports Node's `fs`
 * - a client component importing anything from it would fail to bundle.
 */
export type VpnTier = "plus" | "pro";

/** How many simultaneous devices each tier may provision. */
export const DEVICE_LIMIT: Record<VpnTier, number> = { plus: 1, pro: 3 };

/** Subscription length granted per payment - "top-up" extends this from
 * whichever is later: now, or the account's current expiry. */
export const SUBSCRIPTION_DAYS = 30;

export interface VpnDevice {
  id: string;
  label: string;
  provisionedAt: string;
  /** The full client .conf text - stored so the owner can re-download it
   * later, not just at the moment it was generated. Sensitive: contains a
   * WireGuard private key. Never returned to anyone but the owning wallet
   * (see lib/vpn/walletAuth.ts) or the admin. */
  config: string;
}

export interface VpnPayment {
  txHash: string;
  amountUsdt: string;
  tier: VpnTier;
  paidAt: string;
}

export interface VpnAccount {
  walletAddress: string;
  tier: VpnTier;
  expiresAt: string;
  devices: VpnDevice[];
  payments: VpnPayment[];
  /** Set when a payment was verified but auto-provisioning the first device
   * failed or the VPN server wasn't configured yet - the admin panel surfaces
   * these so a human can retry once the server is ready. */
  needsProvisioning: boolean;
}
