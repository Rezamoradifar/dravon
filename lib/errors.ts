import { BaseError, ContractFunctionRevertedError } from "viem";

const ERROR_MESSAGES: Record<string, string> = {
  AlreadyVoted: "You have already voted for shutdown this round.",
  EmergencyShutdown: "The contract is in emergency shutdown.",
  InsufficientPayment: "The amount sent is not enough for this action.",
  InvalidAddress: "One of the addresses provided is invalid.",
  InvalidStartBox: "The start box you selected is invalid.",
  MinimumNodesRequired: "Not enough nodes to distribute matching bonuses.",
  OnlyLatestWindow: "This action is only available on the latest round window.",
  ReentrancyGuardReentrantCall: "Reentrant call blocked by the contract.",
  SafeERC20FailedOperation: "The ERC20 token transfer failed.",
  TimeException: "This action is not available at this time.",
  UnsentValue: "Refund of unused value failed.",
  UserNotFound: "This wallet is not registered.",
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
