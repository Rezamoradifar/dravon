import type { Address } from "viem";

export interface MainBulkInfo {
  roundWindow: Address;
  userCount: bigint;
  pointValue: string;
  roundPoints: bigint;
  roundEnteredUSD: string;
  allEnteredUSD: string;
  nextBinaryPay: string;
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
