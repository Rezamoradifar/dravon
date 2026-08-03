import { BaseError, ContractFunctionRevertedError } from "viem";

const ERROR_MESSAGES: Record<string, string> = {
  AlreadyDistributed: "This weekly payout has already been distributed.",
  AlreadyVoted: "You have already voted for shutdown this round.",
  EmergencyShutdown: "The contract is in emergency shutdown.",
  // Temporary and self-clearing: the user must earn their balance back down to
  // zero before topping up again. Deliberately worded differently from
  // MaxReached below - one says "wait to earn more", the other says "your
  // balance is too full right now". Users hit this routinely at stages 1-3.
  FlashRequired: "You've used your renewals for this cycle. Earn your balance down to zero, then you can top up again.",
  InsufficientPayment: "The amount sent is not enough for this action.",
  InvalidAddress: "One of the addresses provided is invalid.",
  InvalidStartBox: "The start box you selected is invalid.",
  MaxReached: "Your balance has reached its earnable cap for now.",
  MinimumNodesRequired: "Not enough nodes to distribute matching bonuses.",
  OnlyLatestWindow: "This action is only available on the latest round window.",
  ReentrancyGuardReentrantCall: "Reentrant call blocked by the contract.",
  SafeERC20FailedOperation: "The ERC20 token transfer failed.",
  TimeException: "This action is not available at this time.",
  UnsentValue: "Refund of unused value failed.",
  UserNotFound: "This wallet is not registered.",
  WeekNotEnded: "This week hasn't closed yet - the weekly payout isn't available until it does.",
  WindowClosed: "This round window is closed.",
};

export function parseContractError(error: unknown): string {
  if (error instanceof BaseError) {
    const revertError = error.walk(
      (err) => err instanceof ContractFunctionRevertedError,
    ) as ContractFunctionRevertedError | undefined;

    if (revertError) {
      const errorName = revertError.data?.errorName;
      if (errorName && ERROR_MESSAGES[errorName]) {
        return ERROR_MESSAGES[errorName];
      }
      if (errorName) return `Transaction reverted: ${errorName}`;
      if (revertError.reason) return revertError.reason;
    }

    const shortMessage = (error as BaseError).shortMessage;
    if (shortMessage) return shortMessage;
  }

  if (error instanceof Error) return error.message;
  return "Something went wrong while sending the transaction.";
}
