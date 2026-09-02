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

export type VpnBackend = "wireguard" | "marzban";

export interface VpnDevice {
  id: string;
  label: string;
  provisionedAt: string;
  backend: VpnBackend;
  /** For "wireguard": the full client .conf text. For "marzban": the
   * subscription URL (importable by any V2Ray/Shadowsocks/Xray client).
   * Sensitive either way - never returned to anyone but the owning wallet
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
  /** Chosen on the account's first payment and fixed afterward - an account
   * is either WireGuard or Marzban (V2Ray/Shadowsocks/...), not a mix, to
   * keep device-limit and admin-retry logic unambiguous. */
  backend: VpnBackend;
  devices: VpnDevice[];
  payments: VpnPayment[];
}
