// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./utils/IPancakeV3Router.sol";
import "./utils/IWERC20.sol";

/**
 * @title Swapper
 * @author Obsidian
 * @notice Provides the BNB to USDT exchange every window needs to accept an entry paid
 *         in the native token.
 * @dev An abstract base rather than a contract of its own: the swap has to happen in the
 *      same call as the entry it funds, so putting it behind an external contract would
 *      add a call boundary and an approval hop to the hottest path in the system.
 *
 *      Exchange venue is PancakeSwap V3 on BSC mainnet. The fee tier is a compile-time
 *      constant; the router and the two token addresses are immutables fixed when the
 *      implementation is deployed — see {swapRouter} for why none of them is settable.
 */
abstract contract Swapper {
    using SafeERC20 for IERC20;

    // --- Configuration for BSC Mainnet Exchanges ---

    /**
     * @notice Thrown when the venue is constructed with a zero address.
     */
    error InvalidVenue();

    /**
     * @notice The PancakeSwap V3 router that executes the exchange.
     * @dev Fixed at construction and `immutable`, so there is no setter and no lever over
     *      where an entry's BNB is sent — retuning the venue means a redeploy, the same
     *      path a version migration already walks. It is supplied as a constructor
     *      argument rather than written as a literal only so that the venue is stated once
     *      at deployment instead of being compiled into the source; the guarantee to a
     *      holder is identical, since an immutable is burned into this implementation's
     *      runtime code and cannot be changed afterwards by anyone.
     */
    IPancakeV3Router internal immutable swapRouter;

    /**
     * @notice Address of the USDT stablecoin on BSC Mainnet.
     * @dev Fixed at construction for the same reason as {swapRouter}.
     */
    address internal immutable USDT;

    /**
     * @notice Address of Wrapped BNB (WBNB) on BSC Mainnet.
     * @dev Fixed at construction for the same reason as {swapRouter}.
     */
    address internal immutable wBNB;

    /**
     * @notice The stablecoin every balance in the system is denominated in.
     */
    IERC20 public immutable stableToken;

    /**
     * @notice The wrapped native token the router trades against.
     */
    IWERC20 public immutable wrappedToken;

    /**
     * @notice Binds the exchange venue this window trades through.
     * @dev Runs on the implementation, not on the clones. Immutables live in the
     *      implementation's runtime bytecode, and an EIP-1167 clone delegatecalls into
     *      that code, so every clone reads the values set here without having to be told
     *      them again in {SmartContractWindow-init}. That is why these three can be
     *      immutable while `factory` cannot: the venue is the same for every window ever
     *      cloned, whereas the factory address is not known when this is deployed.
     *
     *      Zero is rejected because a mistyped venue would otherwise surface as an opaque
     *      failed swap on the first entry rather than at deploy time.
     * @param router_ The PancakeSwap V3 router that executes the exchange.
     * @param usdt_ The USDT stablecoin every balance is denominated in.
     * @param wbnb_ The wrapped native token the router trades against.
     */
    constructor(address router_, address usdt_, address wbnb_) {
        if (router_ == address(0) || usdt_ == address(0) || wbnb_ == address(0)) {
            revert InvalidVenue();
        }
        swapRouter = IPancakeV3Router(router_);
        USDT = usdt_;
        wBNB = wbnb_;
        stableToken = IERC20(usdt_);
        wrappedToken = IWERC20(wbnb_);
    }

    /**
     * @notice The fee tier of the WBNB/USDT pool used, in hundredths of a basis point.
     * @dev 500 is the 0.05% tier, which carries the deepest WBNB/USDT liquidity on BSC.
     */
    uint24 internal constant poolFee = 500;

    /**
     * @notice How long after the block it is mined in a swap stays valid.
     * @dev The swap is atomic with the call that requests it, so any nonzero deadline is
     *      equivalent in practice. It is set to a real interval rather than to
     *      `block.timestamp` because a deadline equal to the current block asserts
     *      nothing at all — it is satisfied by whatever block includes the transaction,
     *      however long it sat in the mempool first.
     */
    uint256 internal constant SWAP_DEADLINE = 5 minutes;

    /**
     * @notice Grants the exchange router permission to spend this window's WBNB.
     * @dev Called once per window, from {SmartContractWindow-init}.
     *
     *      The allowance is unlimited and granted to the one canonical router fixed at
     *      construction.
     *      Approving per swap instead would add an approve and a reset to every entry
     *      paid in BNB — roughly 30,000 gas on a 430,000 gas call — to narrow an exposure
     *      that is already bounded by the fact that a window holds WBNB only for the few
     *      opcodes between {IWERC20-deposit} and the swap that consumes it. It is never
     *      the resting form of this contract's funds; USDT is.
     *
     *      USDT is deliberately *not* approved. It used to be, unlimited, alongside WBNB
     *      — and nothing ever spent it: the only swap here is {swapExactOut}, where USDT
     *      is the output token and the router pulls WBNB. An unlimited standing allowance
     *      over the entire round pool, granted for no reason, is exactly the kind of
     *      exposure that costs nothing to remove.
     *
     *      {SafeERC20-forceApprove} rather than a bare `approve` so a token that returns
     *      false instead of reverting cannot leave the window silently unable to swap.
     */
    function initializeApprovals() internal {
        IERC20(wBNB).forceApprove(address(swapRouter), type(uint256).max);
    }

    /**
     * @notice Exchanges BNB for an exact amount of USDT.
     * @dev Wraps the whole of `maxAmountIn`, swaps for exactly `amountOut`, then unwraps
     *      whatever the router did not take. The transaction reverts if `maxAmountIn`
     *      cannot cover `amountOut` at the current price, which is what bounds slippage —
     *      there is no separate tolerance to set.
     * @param maxAmountIn The maximum amount of BNB, in wei, the caller will spend.
     * @param amountOut The exact amount of USDT, in smallest units, to receive.
     * @return amountInUsed The amount of BNB, in wei, actually spent.
     */
    function swapExactOut(
        uint256 maxAmountIn,
        uint256 amountOut
    ) internal returns (uint256 amountInUsed) {
        IPancakeV3Router.ExactOutputSingleParams
            memory params = IPancakeV3Router.ExactOutputSingleParams({
                tokenIn: wBNB,
                tokenOut: USDT,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp + SWAP_DEADLINE,
                amountOut: amountOut,
                amountInMaximum: maxAmountIn,
                sqrtPriceLimitX96: 0
            });

        // Wrap the full amount, then swap. The router pulls only what the price requires.
        wrappedToken.deposit{value: maxAmountIn}();

        amountInUsed = swapRouter.exactOutputSingle(params);

        // Unwrap the remainder so the refund below can be paid in native BNB.
        if (amountInUsed < maxAmountIn) {
            wrappedToken.withdraw(maxAmountIn - amountInUsed);
        }
    }

    /**
     * @notice Accepts native BNB.
     * @dev Required, and not dead code despite having an empty body: {IWERC20-withdraw}
     *      returns the unwrapped remainder of a swap by sending BNB to this contract, and
     *      that transfer reverts without a payable receive function. Entries paid in BNB
     *      arrive through {SmartContractWindow-begin}, which is payable in its own right.
     */
    receive() external payable {}
}
