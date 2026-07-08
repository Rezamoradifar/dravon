import { isAddress, type Address } from "viem";

function readAddressEnv(value: string | undefined, label: string): Address {
  if (!value || !isAddress(value)) {
    throw new Error(
      `[contracts/addresses] ${label} is missing or invalid. Set it in your .env.local (see .env.example).`,
    );
  }
  return value;
}

export const FACTORY_ADDRESS = readAddressEnv(
  process.env.NEXT_PUBLIC_FACTORY_ADDRESS,
  "NEXT_PUBLIC_FACTORY_ADDRESS",
);

export const WINDOW_ADDRESS = readAddressEnv(
  process.env.NEXT_PUBLIC_WINDOW_ADDRESS,
  "NEXT_PUBLIC_WINDOW_ADDRESS",
);

export const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS as
  | Address
  | undefined;

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 56);
