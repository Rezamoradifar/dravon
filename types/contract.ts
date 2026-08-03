import type { Address } from "viem";

export interface MainBulkInfo {
  roundWindow: Address;
  userCount: bigint;
  pointValue: string;
  roundPoints: bigint;
  roundEnteredUSD: string;
  allEnteredUSD: string;
  nextBinaryPay: string;
  /** That round's own pool stage (1 healthiest - 4 floor), not today's. */
  stage: number;
}

export interface StageInfo {
  /** Current pool stage, 1 (healthiest) to 4 (floor). */
  stage: number;
  /** Rounds of full-price ($3/point) runway the free reserve could cover, in hundredths. */
  lastCoverage: bigint;
  /** Percent of a top-up's enterUSD routed to the weekly window at this stage. */
  weeklyPct: number;
  /** Upper bound on points-per-round on top of the worth-tier cap. */
  pointCeiling: number;
  /** Renewals allowed between forced flashes, or 0 for no limit. */
  topupsPerFlash: number;
  /** Consecutive good rounds counted toward the next stage upgrade. */
  goodStreak: number;
}

export interface WeekBulkInfo {
  week: bigint;
  pool: bigint;
  points: bigint;
  earners: bigint;
  paidSoFar: bigint;
  ended: boolean;
  finished: boolean;
  pointValue: bigint;
}

export interface UserWeekInfo {
  matched: bigint;
  raw: bigint;
  credited: bigint;
  owed: bigint;
}

export interface UserBulkInfo {
  roundPoints: string;
  roundEnter: string;
  worth: string;
  users: string;
  dirEarned: string;
  binaryEarned: string;
  earnable: string;
  insuranceStatus: string;
}

export interface UserRoundInfo {
  points: bigint[];
  dirEarn: string[];
  binaryEarn: string[];
  dirFlash: string[];
  binaryFlash: string[];
}

export interface GenealogyNode {
  address: Address;
  depth: number;
  index: number;
}
