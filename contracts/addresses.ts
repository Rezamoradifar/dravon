import { isAddress, type Address } from "viem";

// These are public on-chain contract addresses, not secrets, so a real,
// currently-correct value is baked in as the fallback for every deploy
// target that doesn't override it via env - no server-side .env edit is
// required to pick up a fresh redeploy of this file. Set the matching
// NEXT_PUBLIC_* var (see .env.example) only when pointing at a different
// deployment (e.g. a future contract migration, or a local testnet).
const DEFAULT_FACTORY_ADDRESS: Address = "0x4c7c8060580b6b5Eb50dA04Ad06Fb26B4E7159C3";
const DEFAULT_WINDOW_ADDRESS: Address = "0x12F43550819f6D7e9D9f180d77059d760b9ef9c9";
const DEFAULT_WEEKLY_WINDOW_ADDRESS: Address = "0x5A375cF2888eDda9D198caD8E8DAf01a613275a5";

function readAddressEnv(value: string | undefined, fallback: Address, label: string): Address {
  if (!value) return fallback;
  if (!isAddress(value)) {
    throw new Error(
      `[contracts/addresses] ${label} is set but not a valid address. Fix it in your .env.local (see .env.example).`,
    );
  }
  return value;
}

export const FACTORY_ADDRESS = readAddressEnv(
  process.env.NEXT_PUBLIC_FACTORY_ADDRESS,
  DEFAULT_FACTORY_ADDRESS,
  "NEXT_PUBLIC_FACTORY_ADDRESS",
);

export const WINDOW_ADDRESS = readAddressEnv(
  process.env.NEXT_PUBLIC_WINDOW_ADDRESS,
  DEFAULT_WINDOW_ADDRESS,
  "NEXT_PUBLIC_WINDOW_ADDRESS",
);

export const WEEKLY_WINDOW_ADDRESS = readAddressEnv(
  process.env.NEXT_PUBLIC_WEEKLY_WINDOW_ADDRESS,
  DEFAULT_WEEKLY_WINDOW_ADDRESS,
  "NEXT_PUBLIC_WEEKLY_WINDOW_ADDRESS",
);

export const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS as
  | Address
  | undefined;

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 56);
