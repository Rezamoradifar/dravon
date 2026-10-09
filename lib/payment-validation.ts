import { parseEther } from "viem";

/** Accept only positive decimal native amounts with on-chain precision. */
export function parseNativeAmount(input: string): bigint | undefined {
  if (!/^\d+(\.\d{0,18})?$/.test(input)) return undefined;
  try {
    const value = parseEther(input);
    return value > 0n ? value : undefined;
  } catch { return undefined; }
}

export function registrationStatus(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}
