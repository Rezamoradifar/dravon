// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

/**
 * @title IWindowFactory
 * @author Obsidian
 * @notice The window-directory half of the main contract's surface.
 * @dev Split out from {ISmartContract} so a caller that only needs to find a window does
 *      not have to depend on the whole system interface.
 */
interface IWindowFactory {
    /**
     * @notice The window for the current round — the only one accepting entries.
     * @dev Every window answers this, closed ones included, so a caller holding a stale
     *      address can always find the current one.
     * @return The address of the latest window.
     */
    function getLatestWindow() external view returns (address);

    /**
     * @notice The window that ran a given round.
     * @dev Returns the zero address for a round that never opened one.
     * @param roundId The round to look up.
     * @return The address of that round's window.
     */
    function roundToWindow(uint256 roundId) external view returns (address);
}
