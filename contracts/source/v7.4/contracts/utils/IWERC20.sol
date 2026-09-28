// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IWERC20
 * @author Obsidian
 * @notice The ERC-20 interface plus the two functions a wrapped native token adds.
 * @dev Used for WBNB. Deposit and withdraw are what let a window take an entry paid in
 *      native BNB and hand the router an ERC-20 it can trade.
 */
interface IWERC20 is IERC20 {
    /**
     * @notice Wraps the native currency sent with the call into an equal number of tokens.
     * @dev The minted tokens are credited to `msg.sender`.
     */
    function deposit() external payable;

    /**
     * @notice Burns wrapped tokens and returns the equivalent native currency.
     * @dev The native currency is sent to `msg.sender`, which must be able to receive it.
     * @param wad The amount of wrapped tokens to unwrap.
     */
    function withdraw(uint256 wad) external;
}
