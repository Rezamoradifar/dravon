// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title DravonUSD (DUSD)
/// @notice Standard BEP-20 token for BNB Smart Chain. Independent project,
/// not affiliated with or representing Tether/USDT in any way.
contract DravonUSD is ERC20, ERC20Burnable, Ownable {
    constructor(uint256 initialSupply, address initialOwner)
        ERC20("DravonUSD", "DUSD")
        Ownable(initialOwner)
    {
        _mint(initialOwner, initialSupply);
    }

    /// @notice Mint additional tokens. Restricted to the contract owner.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
