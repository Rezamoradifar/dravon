/** Rules from the supplied v7.4 SmartContract.sol, expressed in token base units. */
export function canPayOffInstallment(entrance?: number, debt?: bigint): boolean {
  return entrance === 50 && debt !== undefined && debt > 0n;
}

export function canTopUp(target: number, entrance?: number, debt?: bigint,
  earnable?: bigint, cap?: bigint, renewals?: bigint): boolean {
  if (target === 50) return canPayOffInstallment(entrance, debt);
  if (target !== 100 || entrance === undefined || debt === undefined) return false;
  if (entrance < 100) return true;
  return entrance === 100 && earnable !== undefined && cap !== undefined &&
    renewals !== undefined && earnable < cap && renewals < 2n;
}

export function clampRoundsAgo(value: bigint | number, counter: bigint): bigint {
  const requested = typeof value === "number"
    ? BigInt(Number.isSafeInteger(value) && value > 0 ? value : 0) : value;
  return requested < 0n ? 0n : requested > counter ? counter : requested;
}

/** UI uses newer-to-older offsets; Solidity expects older first, newer second. */
export function historyRange(from: number, to: number, counter: bigint) {
  const a = clampRoundsAgo(from, counter);
  const b = clampRoundsAgo(to, counter);
  return { oldest: a > b ? a : b, newest: a < b ? a : b };
}
