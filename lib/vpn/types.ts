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
  /** Marzban-only - which data plan this device was provisioned with
   * (see MARZBAN_DATA_PLANS). Absent for WireGuard devices and for older
   * records from before data plans existed (those are all "unlimited"). */
  dataPlanId?: string;
}

/** A GB-capped alternative to the flat unlimited price, offered only for
 * the Marzban backend (Marzban natively enforces a data cap via its own
 * `data_limit` field; WireGuard has no such metering in this app, so it
 * stays flat-rate unlimited only). `gb: null` means unlimited, priced the
 * same as the existing flat per-device rate. Prices here are a starting
 * point, not a fixed law - the operator can edit them any time; nothing
 * about the provisioning code assumes these exact numbers. */
export interface DataPlan {
  id: string;
  label: string;
  gb: number | null;
  priceUsd: number;
}

export const MARZBAN_DATA_PLANS: DataPlan[] = [
  { id: "10gb", label: "10GB", gb: 10, priceUsd: 0.5 },
  { id: "50gb", label: "50GB", gb: 50, priceUsd: 1.5 },
  { id: "100gb", label: "100GB", gb: 100, priceUsd: 2.5 },
  { id: "unlimited", label: "Unlimited", gb: null, priceUsd: PRICE_PER_DEVICE_USD },
];

export const DEFAULT_DATA_PLAN_ID = "unlimited";

export function getDataPlan(id: string | undefined): DataPlan {
  return MARZBAN_DATA_PLANS.find((p) => p.id === id) ?? MARZBAN_DATA_PLANS.find((p) => p.id === DEFAULT_DATA_PLAN_ID)!;
}

export function dataPlanLimitBytes(plan: DataPlan): number {
  return plan.gb === null ? 0 : plan.gb * 1024 * 1024 * 1024;
}

/** Free one-time trial, Marzban only - enough to actually test the
 * service, small enough that it can't substitute for a real plan. */
export const TRIAL_DATA_LIMIT_MB = 100;
export const TRIAL_DAYS = 3;

export interface VpnPayment {
  txHash: string;
  amountUsd: number;
  method: PaymentMethod;
  deviceCount: number;
  paidAt: string;
}

/** User-facing label for a backend - "Marzban" is an internal panel name
 * with no meaning to a buyer, so it's shown simply as "VPN" everywhere a
 * backend is displayed to the account owner (WireGuard is a recognizable
 * enough brand name to show as-is). Not translated - same convention as
 * "USDT"/"BNB" elsewhere in this app. */
export function backendDisplayLabel(backend: VpnBackend): string {
  return backend === "wireguard" ? "WireGuard" : "VPN";
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
  /** Marzban-only - the data plan to use for the *next* device(s) this
   * account still owes (see MARZBAN_DATA_PLANS). Unlike `backend` this is
   * NOT fixed forever: each payment can request a different plan, e.g. an
   * "upgrade" purchase. It never changes an already-provisioned device's
   * actual Marzban data_limit - those keep whatever they were created
   * with (see VpnDevice.dataPlanId for the per-device record of that). */
  dataPlanId?: string;
  devices: VpnDevice[];
  payments: VpnPayment[];
}
