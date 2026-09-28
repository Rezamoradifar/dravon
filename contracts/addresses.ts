import { isAddress, zeroAddress, type Address } from "viem";

export const CONTRACT_VERSION = "7.4";
// Deliberately separate from the retired v7.1 environment variable. Configure
// only after the operator supplies the v7.4 factory; never reuse old windows.
const configuredFactory = process.env.NEXT_PUBLIC_FACTORY_ADDRESS_V7_4;
const retiredFactory = "0x4c7c8060580b6b5eb50da04ad06fb26b4e7159c3";
export const CONTRACTS_CONFIGURED = Boolean(
  configuredFactory && isAddress(configuredFactory) &&
  configuredFactory.toLowerCase() !== retiredFactory && configuredFactory !== zeroAddress,
);
export const FACTORY_ADDRESS: Address = CONTRACTS_CONFIGURED
  ? configuredFactory as Address : zeroAddress;
export const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS as Address | undefined;
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 56);
