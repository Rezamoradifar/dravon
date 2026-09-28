// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;
pragma abicoder v2;

/**
 * @title IPancakeV3Router
 * @author Obsidian
 * @notice The one call this system makes against the PancakeSwap V3 router.
 * @dev A local, pinned declaration of the single entry point {Swapper-swapExactOut} uses,
 *      rather than an import of the pancakeswap v3-periphery package.
 *
 *      The package version is the last third-party source in the verification bundle that
 *      static analysers do not recognise as a known library, so its `pragma solidity
 *      >=0.7.5` and its transitive `>=0.5.0` callback interface are read as unpinned
 *      pragmas belonging to us, alongside two struct-packing findings against parameter
 *      layouts that are fixed by the router's own ABI and cannot be reordered. Declaring
 *      only what is called removes all of that and costs nothing: an interface is a
 *      calldata shape, and this one is byte-identical to the package's.
 *
 *      {ExactOutputSingleParams} must therefore keep exactly these fields, in exactly this
 *      order and these widths. The resulting selector is
 *      `exactOutputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))`
 *      — test/Swapper.test.js asserts it against the published router ABI.
 *
 *      The package interface also declares `exactInputSingle`, `exactInput` and
 *      `exactOutput`, and inherits `IPancakeV3SwapCallback`. None of them is reachable
 *      from this system: the only swap it performs is BNB in, an exact amount of USDT out.
 */
interface IPancakeV3Router {
    /**
     * @notice Parameters for a single-pool swap that buys an exact amount of output.
     * @dev Field order and widths are fixed by the deployed router's ABI. Reordering them
     *      to pack better would silently produce calldata the router decodes as different
     *      values.
     * @param tokenIn The token being sold.
     * @param tokenOut The token being bought.
     * @param fee The fee tier of the pool to trade through.
     * @param recipient Who receives `tokenOut`.
     * @param deadline Timestamp after which the swap is no longer valid.
     * @param amountOut The exact amount of `tokenOut` to receive.
     * @param amountInMaximum The most `tokenIn` the caller will spend.
     * @param sqrtPriceLimitX96 Price bound, or 0 for none.
     */
    struct ExactOutputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
        uint160 sqrtPriceLimitX96;
    }

    /**
     * @notice Swaps as little `tokenIn` as possible for an exact amount of `tokenOut`.
     * @dev Reverts if `amountInMaximum` cannot cover `amountOut` at the current price,
     *      which is what bounds slippage for the caller.
     * @param params The swap parameters.
     * @return amountIn The amount of `tokenIn` actually spent.
     */
    function exactOutputSingle(
        ExactOutputSingleParams calldata params
    ) external payable returns (uint256 amountIn);
}
