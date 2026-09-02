/**
 * The three registration tiers, derived directly from the Window contract's source
 * (`_calculateEntryRequirements` in Window.sol only accepts startBox 10, 50 or 100,
 * and charges exactly `startBox * 1.1` USDT). Nothing here is an invented price -
 * it is the fixed formula encoded in the deployed contract.
 */
export interface PackageTier {
  entrance: 10 | 50 | 100;
  name: string;
}

/**
 * The $10 box (an $11 entry) is a real trap: the contract books it as a $50
 * box carrying a $44 installment debt, and every payout is withheld against
 * that debt first - so a new registrant sees little or no real earnings
 * until it clears. This is a limitation of the deployed contract itself, not
 * something the frontend can fix. It's offered here at the site owner's
 * explicit request, on the condition that PackageTierCards shows a clear,
 * un-missable warning on this tier - see the `debtWarningTitle`/Body i18n
 * keys and the `entrance === 10` branch in package-tier-cards.tsx. Do not
 * remove the warning while this tier stays listed.
 */
export const PACKAGE_TIERS: PackageTier[] = [
  { entrance: 10, name: "Starter" },
  { entrance: 50, name: "Professional" },
  { entrance: 100, name: "Enterprise" },
];

/** startBox * 1.1, exactly matching Window.sol's `_calculateEntryRequirements`. */
export function tierCostUsd(entrance: number): number {
  return Math.round(entrance * 1.1 * 100) / 100;
}

export function tierByEntrance(entrance: number): PackageTier | undefined {
  return PACKAGE_TIERS.find((t) => t.entrance === entrance);
}
