// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

/**
 * @title IContractProvider
 * @author Obsidian
 * @notice The one function a round window calls on the contract provider.
 * @dev The provider is the revenue split that receives the dev share of every entry. The
 *      window only ever needs to tell it to pay its recipients out, so the interface is
 *      kept to that rather than mirroring the whole contract.
 */
interface IContractProvider {
    /**
     * @notice Pays out everything the provider is holding to its registered recipients.
     * @dev Permissionless on the provider's side; the round window calls it
     *      opportunistically at settlement so the split needs no keeper of its own.
     */
    function distribute() external;
}
