import type { Address } from "viem";

import { VPN_PAYMENT_ADDRESS, PRICE_PER_DEVICE_USD } from "@/lib/vpn/publicConfig";
import { VPN_LOCATIONS, DEFAULT_LOCATION_ID } from "@/lib/vpn/types";

export interface MarzbanServerConfig {
  apiUrl: string;
  username: string;
  password: string;
}

/**
 * Server-side-only VPN product configuration. Every value is optional until
 * the operator actually provisions the VPN server and payment wallet - the
 * API routes that read this check for missing pieces explicitly and report
 * "not configured yet" rather than pretending a payment or a provisioning
 * request succeeded.
 */
export interface VpnConfig {
  paymentAddress: Address | null;
  pricePerDeviceUsd: number;
  server: {
    host: string | null;
    port: number;
    username: string | null;
    privateKeyPath: string | null;
  };
  /** One Marzban server per location id (see VPN_LOCATIONS), keyed the same
   * way. The original single-server deployment keeps using the plain
   * MARZBAN_* env vars for "us"; any other location reads
   * MARZBAN_<CODE>_* instead, so adding a new server is just new env vars -
   * no code change needed. */
  marzban: Record<string, MarzbanServerConfig | undefined>;
}

function readMarzbanServerConfig(locationId: string): MarzbanServerConfig | undefined {
  const prefix = locationId === DEFAULT_LOCATION_ID ? "MARZBAN" : `MARZBAN_${locationId.toUpperCase()}`;
  const apiUrl = process.env[`${prefix}_API_URL`];
  const username = process.env[`${prefix}_ADMIN_USERNAME`];
  const password = process.env[`${prefix}_ADMIN_PASSWORD`];
  if (!apiUrl || !username || !password) return undefined;
  return { apiUrl, username, password };
}

export function getVpnConfig(): VpnConfig {
  const marzban: Record<string, MarzbanServerConfig | undefined> = {};
  for (const location of VPN_LOCATIONS) marzban[location.id] = readMarzbanServerConfig(location.id);

  return {
    paymentAddress: VPN_PAYMENT_ADDRESS,
    pricePerDeviceUsd: PRICE_PER_DEVICE_USD,
    server: {
      host: process.env.VPN_SERVER_HOST || null,
      port: Number(process.env.VPN_SERVER_SSH_PORT ?? 22),
      username: process.env.VPN_SERVER_SSH_USER || null,
      privateKeyPath: process.env.VPN_SERVER_SSH_KEY_PATH || null,
    },
    marzban,
  };
}

export function isServerConfigured(config: VpnConfig): boolean {
  return Boolean(config.server.host && config.server.username && config.server.privateKeyPath);
}

export function isMarzbanConfigured(config: VpnConfig, locationId: string = DEFAULT_LOCATION_ID): boolean {
  return Boolean(config.marzban[locationId]);
}

export function isPaymentConfigured(config: VpnConfig): boolean {
  return Boolean(config.paymentAddress);
}
