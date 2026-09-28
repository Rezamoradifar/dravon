// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title UintToFloatString
 * @author Obsidian
 * @notice Renders a fixed-point integer as a decimal string.
 * @dev Every balance in the system is an integer with 18 implied decimals. The bulk view
 *      functions on the windows return display strings rather than raw integers so a
 *      block explorer shows the same figures as the dapp, and this is what formats them.
 */
library UintToFloatString {
    using Strings for uint256;

    /**
     * @notice Converts `number` to a decimal string, rescaling its precision.
     * @dev Truncates rather than rounds, and omits the fractional part entirely when the
     *      remainder is zero, so a whole amount renders as "100" and not "100.00".
     * @param number The fixed-point integer to convert.
     * @param inDecimals How many decimal places `number` implicitly carries.
     * @param outDecimals How many decimal places to show. Zero renders the integer part only.
     * @return num The formatted string.
     */
    function _floatString(
        uint256 number,
        uint8 inDecimals,
        uint8 outDecimals
    ) internal pure returns (string memory num) {
        string memory h = (number / 10 ** inDecimals).toString();

        if (outDecimals != 0) {
            uint256 remainder = number % 10 ** inDecimals;
            if (remainder != 0) {
                h = string.concat(h, ".");
                while (outDecimals != 0) {
                    remainder *= 10;
                    h = string.concat(
                        h,
                        (remainder / 10 ** inDecimals).toString()
                    );
                    remainder %= 10 ** inDecimals;
                    outDecimals--;
                }
            }
        }
        return h;
    }
}
