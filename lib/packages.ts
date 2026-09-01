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
 * The $10 box (an $11 entry) is deliberately not offered here even though the
 * contract still technically accepts it: a new entrant at that tier is booked
 * as a $50 box carrying a $44 debt, and every payout is withheld against that
 * debt first - so a new registrant sees $0 of real earnings until it clears.
 * Removing it from the UI doesn't change the contract (someone could still
 * call begin(10, ...) directly), but it stops the site from steering new
 * users into it.
 */
export const PACKAGE_TIERS: PackageTier[] = [
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
