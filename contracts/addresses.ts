import { isAddress, type Address } from "viem";

// These are public on-chain contract addresses, not secrets, so a real,
// currently-correct value is baked in as the fallback for every deploy
// target that doesn't override it via env - no server-side .env edit is
// required to pick up a fresh redeploy of this file. Set the matching
// NEXT_PUBLIC_* var (see .env.example) only when pointing at a different
// deployment (e.g. a future contract migration, or a local testnet).
// SmartContract v7.4 (migrated 28 Sep 2026). v7.1 at 0x4c7c...59C3 is shut down:
// its views still answer but every write reverts with WindowClosed().
// The window/weekly defaults are only first-paint fallbacks - both are
// resolved live from the factory (latestWindow / weeklyWindow).
const DEFAULT_FACTORY_ADDRESS: Address = "0x344438c4d038Ccd30104a64FF51DD07AC223795E";
const DEFAULT_WINDOW_ADDRESS: Address = "0xc8E37E23293011d03788Df5f3C530BC4C2500850";
const DEFAULT_WEEKLY_WINDOW_ADDRESS: Address = "0x895687dd47d903A61297DefF64A8678DEA23a2Fd";

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
