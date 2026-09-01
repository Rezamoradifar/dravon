import { isAddress, type Address } from "viem";

/**
 * The VPN payment address and prices are not secrets - a payer needs to know
 * them - so, like contracts/addresses.ts, they're NEXT_PUBLIC_ and safe to
 * read from client components. Server-only pieces (the VPN server's SSH
 * details) live in lib/vpn/config.ts instead.
 */
function readOptionalAddress(value: string | undefined): Address | null {
  if (!value) return null;
  if (!isAddress(value)) {
    throw new Error("[vpn] NEXT_PUBLIC_VPN_PAYMENT_ADDRESS is set but not a valid address.");
  }
  return value;
}

function readPrice(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return value && Number.isFinite(n) && n > 0 ? n : fallback;
}

export const VPN_PAYMENT_ADDRESS = readOptionalAddress(process.env.NEXT_PUBLIC_VPN_PAYMENT_ADDRESS);

export const VPN_PRICE_USD = {
  plus: readPrice(process.env.NEXT_PUBLIC_VPN_PRICE_PLUS_USD, 9),
  pro: readPrice(process.env.NEXT_PUBLIC_VPN_PRICE_PRO_USD, 19),
} as const;

export const VPN_PAYMENTS_LIVE = Boolean(VPN_PAYMENT_ADDRESS);
