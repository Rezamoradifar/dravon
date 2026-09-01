import type { Address } from "viem";

import { VPN_PAYMENT_ADDRESS, VPN_PRICE_USD } from "@/lib/vpn/publicConfig";

/**
 * Server-side-only VPN product configuration. Every value is optional until
 * the operator actually provisions the VPN server and payment wallet - the
 * API routes that read this check for missing pieces explicitly and report
 * "not configured yet" rather than pretending a payment or a provisioning
 * request succeeded.
 */
export interface VpnConfig {
  paymentAddress: Address | null;
  priceUsd: { plus: number; pro: number };
  server: {
    host: string | null;
    port: number;
    username: string | null;
    privateKeyPath: string | null;
  };
}

export function getVpnConfig(): VpnConfig {
  return {
    paymentAddress: VPN_PAYMENT_ADDRESS,
    priceUsd: VPN_PRICE_USD,
    server: {
      host: process.env.VPN_SERVER_HOST || null,
      port: Number(process.env.VPN_SERVER_SSH_PORT ?? 22),
      username: process.env.VPN_SERVER_SSH_USER || null,
      privateKeyPath: process.env.VPN_SERVER_SSH_KEY_PATH || null,
    },
  };
}

export function isServerConfigured(config: VpnConfig): boolean {
  return Boolean(config.server.host && config.server.username && config.server.privateKeyPath);
}

export function isPaymentConfigured(config: VpnConfig): boolean {
  return Boolean(config.paymentAddress);
}
