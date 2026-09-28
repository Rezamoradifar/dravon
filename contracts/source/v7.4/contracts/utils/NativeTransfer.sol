// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

/**
 * @title NativeTransfer
 * @author Obsidian
 * @notice Sends native BNB to an address and reverts if the recipient rejects it.
 * @dev Named for what it does rather than for the type it extends. It used to be called
 *      `Address`, which collided with {openzeppelin-contracts/utils/Address.sol} — two
 *      libraries of the same name in one compilation unit, which static analysers flag
 *      and which makes a verified source listing ambiguous to read.
 *
 *      A low-level call is the only correct way to send native value here. `transfer`
 *      and `send` forward a fixed 2300 gas stipend, which a recipient contract with a
 *      non-trivial `receive` cannot run on, and which changes meaning whenever an opcode
 *      is repriced. The call below forwards all available gas and checks the result.
 */
library NativeTransfer {
    /**
     * @notice Thrown when the recipient rejected the transfer or ran out of gas.
     */
    error UnsentValue();

    /**
     * @notice Thrown when the recipient is the zero address.
     */
    error InvalidRecipient();

    /**
     * @notice Thrown when the contract does not hold the amount it was asked to send.
     */
    error InsufficientBalance();

    /**
     * @notice Sends `amount` of native BNB to `recipient`.
     * @dev Reverts with {InvalidRecipient} on the zero address, {InsufficientBalance} if
     *      the balance cannot cover the transfer, and {UnsentValue} if the recipient
     *      rejects it. The two checks ahead of the call are what turn an opaque failed
     *      call into a named reason, and they cost one comparison and one BALANCE each.
     *
     *      No account-existence check is made on `recipient`, and none is wanted: an
     *      empty payload carries no return data to misread, so a transfer to an
     *      address with no code is a plain funding of an EOA and must succeed.
     * @param recipient The address to send BNB to.
     * @param amount The amount of BNB to send, in wei.
     */
    function _sendValue(address payable recipient, uint256 amount) internal {
        if (recipient == address(0)) revert InvalidRecipient();
        if (address(this).balance < amount) revert InsufficientBalance();

        (bool success, ) = recipient.call{value: amount}("");
        if (!success) revert UnsentValue();
    }
}
