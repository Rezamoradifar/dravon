/**
 * Pure types/constants shared by both server code (lib/vpn/store.ts, API
 * routes) and client components (the account panel, admin panel). Kept
 * separate from store.ts specifically because store.ts imports Node's `fs`
 * - a client component importing anything from it would fail to bundle.
 */
export type PaymentMethod = "usdt" | "bnb";

/** Flat per-device monthly price - no more Plus/Pro tiers. Every device
 * (config) is unlimited bandwidth, single-device, $1/month. */
export const PRICE_PER_DEVICE_USD = 1;

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
  amountUsd: number;
  method: PaymentMethod;
  deviceCount: number;
  paidAt: string;
}

export interface VpnAccount {
  walletAddress: string;
  expiresAt: string;
  /** The most devices this account has ever paid to keep active - the
   * target device count. Provisioning catches up to this; it never removes
   * devices on its own. */
  paidDeviceCount: number;
  devices: VpnDevice[];
  payments: VpnPayment[];
}
