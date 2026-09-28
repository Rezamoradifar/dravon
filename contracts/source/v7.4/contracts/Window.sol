// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./utils/UintToFloatString.sol";
import "./utils/NativeTransfer.sol";
import "./Swapper.sol";
import "./interfaces/ISmartContract.sol";
import "./WeeklyWindow.sol";
import "./interfaces/IContractProvider.sol";

/**
 * @title SmartContractWindow
 * @author Obsidian
 * @notice Holds one round's pool and is the only contract participants transact with.
 *         Entries, top-ups, round payouts and the emergency exit all go through here.
 * @dev One of these is cloned per round, every 12 hours, by {WindowFactory-createWindow}.
 *      The split is deliberate: this contract holds the money, {SmartContract} holds the
 *      ledger. A window's balance is therefore exactly one round's pool, which is what
 *      makes the round point value computable from `balanceOf(address(this))` rather than
 *      from a running total that could drift away from the funds actually present.
 *
 *      Because it is a clone, everything that varies per round is bound in {init}; the
 *      only constructor arguments are the exchange venue, which is the same for every
 *      window and is burned into the implementation's runtime code as immutables the
 *      clones read through their delegatecall. There is no owner, no pause and no
 *      privileged setter; the only actor with special rights is the factory that cloned it.
 */
contract SmartContractWindow is ReentrancyGuard, Swapper {
    using SafeERC20 for IERC20;
    using Strings for uint256;
    using UintToFloatString for uint256;
    using NativeTransfer for address payable;

    /**
     * @notice Thrown when a call is made to a window that is not the latest one.
     */
    error OnlyLatestWindow();

    /**
     * @notice Thrown when the window has closed and no longer accepts entries.
     */
    error WindowClosed();

    /**
     * @notice Thrown when the address given is not registered in the system.
     */
    error UserNotFound();

    /**
     * @notice Thrown when {init} is called on a window that is already bound.
     */
    error AlreadyInitialized();

    /**
     * @notice Reference to the main SmartContract factory contract.
     * @dev Storage rather than an immutable. The factory used to deploy this
     *      implementation from its own constructor, which put this contract's whole
     *      creation code inside the factory's initcode and left the deploy within
     *      3,165 bytes of the EIP-3860 limit. The implementation is now deployed
     *      first and its address handed to the factory, so it cannot know the factory
     *      at construction time — it learns it in {init} instead.
     */
    ISmartContract internal factory;

    /**
     * @notice Flag indicating whether this operational window is closed.
     */
    bool public isClosed;

    /**
     * @notice The unique identifier for the current operational round.
     */
    uint256 public roundId;

    /**
     * @notice The pool stage this round runs under, 1 (healthiest) to 4 (floor).
     * @dev Snapshotted when the window is created and never changed, because the stage
     *      is fixed for a whole round. Reading it off the factory instead would give
     *      whatever the stage happens to be now, so a window that closed weeks ago would
     *      misreport the terms its participants actually entered under.
     */
    uint8 public stage;

    /**
     * @notice Restricts a function to the round window that is still accepting entries.
     * @dev Reverts with {WindowClosed} once the round has settled. A closed window keeps
     *      its funds and its payout functions; what it stops taking is new money.
     */
    modifier onlyLatestWindow() {
        if (isClosed) revert WindowClosed();
        _;
    }

    /**
     * @notice Runs the body only while the window is open, returning zeros otherwise.
     * @dev Used on the bulk view functions, which a dapp polls across several rounds at
     *      once. A closed window has no live figures to report, and returning empty
     *      values keeps a caller that walks back over past rounds from reverting on the
     *      first one it finds closed.
     */
    modifier ifOpen() {
        if (!isClosed) _;
    }

    /**
     * @notice Refuses a window that has already been bound to a factory.
     * @dev The guard is once-only rather than caller-is-factory, because a fresh clone
     *      has no factory recorded yet. Nothing can slip in ahead of the real one:
     *      {WindowFactory-createWindow} clones and initializes in the same call, so a
     *      clone is never observable unbound.
     */
    modifier initializer() {
        if (address(factory) != address(0)) revert AlreadyInitialized();
        _;
    }

    /**
     * @notice Emitted once, when a freshly cloned window is bound to its round.
     * @param factoryAddr The main contract that cloned and bound this window.
     * @param round The round this window runs.
     * @param roundStage The pool stage in force for that round.
     */
    event WindowInitialized(
        address indexed factoryAddr,
        uint256 indexed round,
        uint8 roundStage
    );

    /**
     * @notice Emitted when the window stops accepting entries.
     * @dev Fires at settlement, and also on an emergency shutdown.
     * @param round The round that closed.
     */
    event WindowClosedEvent(uint256 indexed round);

    /**
     * @notice Emitted when an emergency shutdown empties the system into the provider.
     * @param round The round that was running when the shutdown carried.
     * @param provider Where the funds were sent.
     * @param stableAmount USDT swept out of this window.
     * @param nativeAmount Native BNB swept out of this window.
     */
    event SystemShutdown(
        uint256 indexed round,
        address indexed provider,
        uint256 stableAmount,
        uint256 nativeAmount
    );

    /**
     * @notice Emitted when a participant closes their account and takes their assurance.
     * @param userAddr The participant that closed their account.
     * @param payout The assurance value paid out.
     */
    event AccountTerminated(address indexed userAddr, uint256 payout);

    /**
     * @notice Emitted when a new participant enters through this window.
     * @param userAddr The participant that entered.
     * @param direct The referrer credited for the entry.
     * @param box The box paid for: 10 is the $11 installment, 50 and 100 the real boxes.
     * @param enterUSD The net USD the entry was worth.
     */
    event Entered(
        address indexed userAddr,
        address indexed direct,
        uint24 box,
        uint256 enterUSD
    );

    /**
     * @notice Emitted when an existing participant raises or renews their box.
     * @param userAddr The participant that topped up.
     * @param box The box topped up to.
     * @param enterUSD The net USD the top-up was worth.
     */
    event ToppedUp(address indexed userAddr, uint24 box, uint256 enterUSD);

    /**
     * @notice Emitted when a participant moves their account to another wallet.
     * @param from The wallet the account left.
     * @param to The wallet it now pays out to.
     */
    event WalletChanged(address indexed from, address indexed to);

    /**
     * @notice Emitted when an account votes for an emergency shutdown.
     * @param voter The account that voted.
     * @param carried Whether this vote crossed the threshold and drained the pool.
     */
    event ShutdownVoteCast(address indexed voter, bool carried);

    /**
     * @notice Emitted once per round, when its point value is fixed and it closes.
     * @param round The round being settled.
     * @param pointValue What each point settled at.
     * @param assuranceHeld Assurance handed forward to the next round.
     */
    event RoundPriced(
        uint256 indexed round,
        uint256 pointValue,
        uint256 assuranceHeld
    );

    /**
     * @notice Emitted for each batch of a round's payout.
     * @param round The round being paid out.
     * @param from First index paid in this batch.
     * @param to One past the last index paid.
     * @param complete Whether this batch finished the round.
     */
    event RoundBatchPaid(
        uint256 indexed round,
        uint256 from,
        uint256 to,
        bool complete
    );

    /**
     * @notice Deploys the implementation that every round window is cloned from.
     * @dev Marks the implementation itself as bound, so {init} refuses it.
     *
     *      Clones start with empty storage and are bound by {init}. The
     *      implementation is only ever delegatecalled and never holds funds, but
     *      leaving it open would let anyone name themselves its factory, which is a
     *      confusing thing to find on a verified contract.
     *
     *      The venue arguments are forwarded to {Swapper}, which stores them as
     *      immutables in this implementation's runtime code; the clones inherit them for
     *      free and never pass them again.
     * @param router_ The PancakeSwap V3 router that executes BNB to USDT exchanges.
     * @param usdt_ The USDT stablecoin every balance in the system is denominated in.
     * @param wbnb_ The wrapped native token the router trades against.
     */
    constructor(
        address router_,
        address usdt_,
        address wbnb_
    ) payable Swapper(router_, usdt_, wbnb_) {
        factory = ISmartContract(address(this));
    }

    /**
     * @notice Initializes the operational window for a specific round.
     * @dev Callable once, by whoever clones it — which is only ever the factory.
     * @param round The ID of the round this window represents.
     * @param stage_ The pool stage in force for this round.
     * @dev The stage is passed in rather than read back off the factory. The first
     *      window is created from inside the factory's own constructor, where there is
     *      no code at that address yet, so a call back to it would revert.
     * @dev The once-only guard lives in {initializer}; see there for why it is not a
     *      caller-is-factory check.
     */
    function init(uint256 round, uint8 stage_) external initializer {
        factory = ISmartContract(msg.sender);
        roundId = round;
        stage = stage_;
        initializeApprovals();
        emit WindowInitialized(msg.sender, round, stage_);
    }

    /**
     * @notice Formats a USD amount into a dollar string representation.
     * @param amountUSD The amount in USD (with 18 decimals).
     * @param decimals The number of decimal places to display after the dollar sign.
     * @return s The formatted string (e.g., "$100.00").
     * @dev Thin wrapper over {UintToFloatString-_floatString} that prefixes the sign.
     */
    function formatAsDollarString(
        uint256 amountUSD,
        uint8 decimals
    ) internal pure returns (string memory s) {
        return string.concat("$", (amountUSD)._floatString(18, decimals));
    }

    /**
     * @notice Formats a value with a given label as a dollar string.
     * @param name The label for the value (e.g., "Balance: ").
     * @param amountUSD The amount in USD (with 18 decimals).
     * @param decimals The number of decimal places to display.
     * @return s The formatted string (e.g., "Balance: $100.00").
     * @dev As {formatAsDollarString}, with a caller-supplied label in front.
     */
    function formatValueWithLabel(
        string memory name,
        uint256 amountUSD,
        uint8 decimals
    ) internal pure returns (string memory s) {
        return string.concat(name, "$", (amountUSD)._floatString(18, decimals));
    }

    /**
     * @notice Thrown when the box paid for is not one the system sells.
     */
    error InvalidStartBox();

    /**
     * @notice Works out what an entry costs and takes payment for it.
     * @dev Calculates the entry requirements for a user joining or topping up.
     *      Determines the entrance fee, whether a direct uplift is applicable, the USD equivalent to enter,
     *      and the required BNB for the swap if applicable.
     * @param startBox The entrance box (10 for the $11 box, 50 for the $55 box, 100 for the $110 box).
     * @param enterPrice The BNB amount sent by the user for entry. If 0, USDT is assumed for entry.
     * @param userAddr The address of the user.
     * @return enterUSD The USD equivalent required for entry.
     * @return reqBNB The required BNB amount for swapping to USDT, if BNB is used for entry.
     */
    function _calculateEntryRequirements(
        uint256 startBox,
        uint256 enterPrice,
        address userAddr
    ) internal returns (uint256 enterUSD, uint256 reqBNB) {
        if (startBox != 100 && startBox != 50 && startBox != 10)
            revert InvalidStartBox();

        if (enterPrice != 0)
            return (
                startBox * 1e18,
                swapExactOut(enterPrice, startBox * 1.1e18)
            );
        stableToken.safeTransferFrom(
            userAddr,
            address(this),
            startBox * 1.1e18
        );
        return (startBox * 1e18, 0);
    }

    /**
     * @notice Allows a user to join the current operational window.
     * @dev Handles BNB or USDT entry, calculates fees, and forwards to the SmartContract factory.

     * @param direct The address of the direct referrer.
     * @param referral The address of the indirect referrer.
     */
    function begin(
        uint24 startBox,
        address direct,
        address referral
    ) external payable nonReentrant onlyLatestWindow {
        ISmartContract _factory = factory;
        // Calculate entry requirements based on provided BNB or USDT.
        (uint256 enterUSD, uint256 requiredBNB) = _calculateEntryRequirements(
            startBox,
            msg.value,
            msg.sender
        );

        // Call the factory to process the user's entry and calculate direct shares.
        uint256 directShare = _factory.join(
            msg.sender,
            direct,
            referral,
            startBox,
            enterUSD
        );

        // Distribute direct shares and a portion to the content provider if applicable.
        IERC20(USDT).safeTransfer(_factory.getContractProvider(), enterUSD / 10);
        if (directShare != 0) IERC20(USDT).safeTransfer(direct, directShare);
        // Flat 15% to the weekly window on every join, at every stage. Unlike the direct
        // share this is not skipped for a flashed direct.
        _payWeeklyWindow((enterUSD * 15) / 100);

        // Refund any excess BNB sent by the user.
        if (requiredBNB < msg.value) {
            payable(msg.sender)._sendValue(msg.value - requiredBNB);
        }

        emit Entered(msg.sender, direct, startBox, enterUSD);
    }

    /**
     * @notice Allows an existing user to top up their account within the current operational window.
     * @dev Processes BNB or USDT top-ups, calculates shares, and updates user data in the SmartContract factory.
     * @param targetBox The box to top up to (50 for the $55 box, 100 for the $110 box).
     *                  10 is not a top-up target: it is an entry price, not a box.
     *                  Must be strictly greater than the user's current box, except the $110 box which may renew itself,
     *                  and 50 for a $55 box still owing its installment, which pays the debt off in full.
     */
    function chargeAccount(
        uint24 targetBox
    ) external payable nonReentrant onlyLatestWindow {
        ISmartContract _factory = factory;
        // Calculate entry requirements for the top-up.
        (uint256 enterUSD, uint256 requiredBNB) = _calculateEntryRequirements(
            targetBox,
            msg.value,
            msg.sender
        );

        // Call the factory to process the top-up.
        _factory.topUp(msg.sender, targetBox, enterUSD);

        // Distribute a portion to the content provider and direct shares if applicable.
        IERC20(USDT).safeTransfer(
            _factory.getContractProvider(),
            enterUSD / 10
        );
        // Stage lever: 15 / 10 / 5 / 0 percent of a top-up funds the weekly window.
        // At the floor nothing is diverted and the whole amount stays in the pool.
        (uint8 weeklyPct, , ) = _factory.currentStageParams();
        _payWeeklyWindow((enterUSD * weeklyPct) / 100);

        // Refund any excess BNB sent by the user.
        if (requiredBNB < msg.value) {
            payable(msg.sender)._sendValue(msg.value - requiredBNB);
        }

        emit ToppedUp(msg.sender, targetBox, enterUSD);
    }

    /**
     * @notice Distributes matching bonuses to eligible users based on their activity.
     * @dev This function iterates through a subset of users and processes their binary team payouts.
     * @param nodes The number of nodes to process in this distribution batch.
     * @param devPool A boolean indicating whether to distribute to the development pool after payouts.
     */
    function distributeMatchingBonuses(
        uint256 nodes,
        uint256 weekNodes,
        bool devPool
    ) external nonReentrant {
        ISmartContract _factory = factory;
        // Check conditions for binary payment distribution and retrieve relevant parameters.
        (
            uint256 index,
            uint256 pointValue,
            uint256 receiversCount
        ) = _checkBinaryPay(nodes);

        uint256 round = roundId;

        // Determine the length and fullness status of the binary payment index.
        (uint256 len, bool isFull) = _checkBinaryIndex(
            receiversCount,
            index,
            nodes
        );

        // Iterate through eligible receivers and transfer their allocated amounts.
        uint256 devTotal;
        for (uint256 i = index; i < len; ) {
            (address userAddr, uint256 amount, uint256 devShare) = _factory
                .processBinaryTeamPayout(round, i, pointValue);
            devTotal += devShare;
            // Dust amounts are already filtered out by _processBinaryTeamBonus,
            // which never credits/deducts them, so amount is always 0 or above threshold.
            // A zero recipient would revert the transfer and, because the cursor below
            // only advances once the batch completes, leave the round undistributable.
            if (amount != 0 && userAddr != address(0)) {
                stableToken.safeTransfer(userAddr, amount);
            }
            unchecked {
                ++i;
            }
        }
        // The dev's cut of any installment debt these payouts cleared. Accumulated and
        // sent once rather than per receiver, and before the sweep below — anything left
        // here when the round completes goes to the next round's pool.
        if (devTotal != 0) {
            IERC20(USDT).safeTransfer(_factory.getContractProvider(), devTotal);
        }

        // If the distribution is complete, transfer remaining funds to the latest window.
        if (isFull) {
            // A round that paid out exactly its pool leaves nothing to sweep.
            uint256 remaining = IERC20(USDT).balanceOf(address(this));
            if (remaining != 0) {
                IERC20(USDT).safeTransfer(
                    _factory.getLatestWindow(),
                    remaining
                );
            }
        }

        if (devPool)
            IContractProvider(_factory.getContractProvider()).distribute();

        emit RoundBatchPaid(round, index, len, isFull);

        // Settle the round first, then the week: both draw on the same period-earnable
        // budget, so the order has to be fixed here rather than left to the caller.
        _distributeWeek(weekNodes);
    }

    /**
     * @notice Settles a batch of the previous week alongside this round.
     * @dev Pays a batch of the most recently finished week alongside this round, so both
     *      can be settled in one transaction.
     *      Passing a batch size while that week is still running simply does nothing —
     *      the round payout above must not fail because the week is not ready yet.
     * @param weekNodes How many weekly earners to pay. Zero does nothing.
     */
    function _distributeWeek(uint256 weekNodes) internal {
        ISmartContract _factory = factory;
        if (weekNodes == 0) return;
        uint256 currentWeek = _factory.weekOf(_factory.realRound());
        if (currentWeek == 0) return;
        address weekWindow = _factory.weekToWindow(currentWeek - 1);
        if (weekWindow == address(0)) return;
        WeeklyWindow(weekWindow).tryDistributeWeekly(weekNodes);
    }

    /**
     * @notice Thrown when a payout batch is smaller than the minimum allowed.
     * @param required The smallest batch size the payout accepts.
     */
    error MinimumNodesRequired(uint256 required);

    /**
     * @notice Thrown when a round is settled before its 12 hours are up.
     */
    error TimeException();

    /**
     * @notice Prices the round and, on the first batch, closes it.
     * @dev Internal function to check binary payment conditions and retrieve parameters.
     *      Determines the starting index for processing, the point value, and the total receiver count.
     * @param nodes The number of nodes intended for processing.
     * @return index The starting index for binary payment processing.
     * @return pointValue The calculated point value for this round's distribution.
     * @return receiversCount The total count of binary receivers for the current round.
     */
    function _checkBinaryPay(
        uint256 nodes
    )
        internal
        returns (uint256 index, uint256 pointValue, uint256 receiversCount)
    {
        ISmartContract _factory = factory;
        // Enforce a minimum number of nodes for binary payment processing.
        if (nodes < 50) revert MinimumNodesRequired(50);

        index = binaryPayIndex;
        // During an emergency shutdown, prevent any binary payments if the index is zero.
        if (index == 0 && isShutdown) revert EmergencyShutdown();

        // Retrieve round data from the factory.
        (uint256 users, uint256 points) = _factory.roundData(roundId);
        // If binaryPayIndex is not zero, use existing point value.
        if (index != 0) {
            return (index, stabilizedPointValue, users);
        }

        // Prevent processing if the current round is the real-time round.
        if (roundId == _factory.realRound()) revert TimeException();
        // Calculate and store the current point value.
        uint256 newAssurance;
        (pointValue, newAssurance) = currentPointValue(points);
        stabilizedPointValue = pointValue;

        // Reserve left once this round's payout and the assurance are set aside. This is
        // the conservative figure: flashed and ceiling-capped receivers forfeit, so the
        // real payout is at or below `pointValue * points`.
        uint256 committed = pointValue * points + newAssurance;
        uint256 balance = stableToken.balanceOf(address(this));
        uint256 freeAfter = balance > committed ? balance - committed : 0;

        // Increment the factory's round counter and close the current window.
        _factory.roundIncrement(newAssurance, freeAfter, points);
        emit RoundPriced(roundId, pointValue, newAssurance);
        if (newAssurance != 0)
            IERC20(USDT).safeTransfer(_factory.getLatestWindow(), newAssurance);
        _closeWindow();

        return (index, pointValue, users);
    }

    /**
     * @notice How far through the round's receiver list the payout has reached.
     * @dev Zero means the round has not started paying out, or has finished. The
     *      distinction is drawn by {isClosed}, not by this value.
     */
    uint256 internal binaryPayIndex;
    /**
     * @notice Stores the calculated point value for the current binary payment pool.
     */
    uint256 public stabilizedPointValue;

    /**
     * @notice Calculates the current point value based on the total points and the contract's USDT balance.
     * @param totalPoints The total points accumulated in the current round.
     * @return value The calculated point value.
     * @return newAssurance Assurance the pool can still afford to carry forward.
     * @dev Pays the {POINT_PEG} of $3 whenever the balance covers it and the assurance
     *      besides. Below that it prices the round at what the pool can actually pay,
     *      which is what keeps a short round solvent rather than merely late.
     */
    function currentPointValue(
        uint256 totalPoints
    ) internal view returns (uint256 value, uint256 newAssurance) {
        if (totalPoints == 0) totalPoints = 1;
        uint256 assurance = factory.assurance();
        uint256 balance = stableToken.balanceOf(address(this));

        uint256 deduct = totalPoints * 3e18;

        if (deduct + assurance <= balance) return (3e18, assurance);
        if (deduct < balance) return (3e18, balance - deduct);
        // The pool cannot cover the peg, so the round is priced at what it can actually
        // pay. This used to hold 10% back (PAYOUT_RATIO) so a short round could not
        // empty the pool outright. It no longer earns its place: a payout is capped by
        // each participant's period earnable and the excess is forfeited back to the
        // next window, so a short round already leaves the points it could not pay
        // behind. Withholding a second time only slowed the payouts of the participants
        // who did earn.
        return (balance / totalPoints, 0);
    }

    /**
     * @notice Retrieves the point value for a specific round.
     * @param round The ID of the round.
     * @return The point value for the specified round.
     * @dev A settled round has its value frozen on its own window; the live round has to
     *      be priced on the spot, because nothing has fixed it yet.
     */
    function roundPointValue(uint256 round) internal view returns (uint256) {
        ISmartContract _factory = factory;
        if (round != _factory.roundCounter()) {
            return (_factory.getRoundPointValue(round));
        }
        (, uint256 points) = _factory.roundData(round);
        (uint256 value, ) = currentPointValue(points);
        return value;
    }

    /**
     * @notice Advances the payout cursor and reports whether the round is finished.
     * @dev Internal function to check and update the binary payment index.
     * @param binaryReceiversLen The total number of binary receivers.
     * @param index The current starting index for processing.
     * @param nodes The number of nodes to process in the current batch.
     * @return len The ending index for the current processing batch.
     * @return full A boolean indicating if all binary receivers have been processed.
     */
    function _checkBinaryIndex(
        uint256 binaryReceiversLen,
        uint256 index,
        uint256 nodes
    ) internal returns (uint256 len, bool full) {
        // If processing all remaining nodes, reset binaryPayIndex and mark as full.
        if (nodes + index >= binaryReceiversLen) {
            delete binaryPayIndex;
            return (binaryReceiversLen, true);
        }
        // Increment binaryPayIndex for the next batch.
        binaryPayIndex += nodes;
        return (nodes + index, false);
    }

    /**
     * @notice Allows a user to change their associated wallet address.
     * @dev Only callable by the user and only if the window is active.
     * @param newAddr The new address to associate with the user's account.
     */
    function resetWalletAddress(
        address newAddr
    ) external nonReentrant onlyLatestWindow {
        factory.changeWalletAddress(msg.sender, newAddr);
        emit WalletChanged(msg.sender, newAddr);
    }

    /**
     * @notice Retrieves main operational information for a given number of rounds ago.
     * @param roundsAgo The number of rounds to look back from the current round.
     * @return roundWindow The address of the window contract for the specified round.
     * @return userCount_ The number of users in the specified round.
     * @return pointValue_ The formatted dollar string of the point value for the round.
     * @return roundPoints_ The total points accumulated in the specified round.
     * @return roundEnteredUSD_ The formatted dollar string of the USD value that entered in the specified round.
     * @return allEnteredUSD_ The formatted dollar string of the total USD value that entered across all rounds up to the specified round.
     * @return NextBinaryPay The time remaining until the next binary payout or status.
     * @return stage_ The pool stage that round ran under.
     * @dev One call so a dapp can render a round summary without a dozen round trips.
     *      Guarded by {ifOpen}, so a closed window reports zeros rather than reverting.
     */
    function getMainBulkInfo(
        uint256 roundsAgo
    )
        external
        view
        ifOpen
        returns (
            address roundWindow,
            uint256 userCount_,
            string memory pointValue_,
            uint256 roundPoints_,
            string memory roundEnteredUSD_,
            string memory allEnteredUSD_,
            string memory NextBinaryPay,
            uint8 stage_
        )
    {
        ISmartContract _factory = factory;
        uint256 round = _factory.roundCounter() - roundsAgo;
        roundWindow = _factory.roundToWindow(round);
        // That round's own stage, not today's.
        stage_ = roundWindow == address(0)
            ? 0
            : SmartContractWindow(payable(roundWindow)).stage();
        pointValue_ = formatAsDollarString(roundPointValue(round), 3);
        roundPoints_ = _factory.getRoundTotalPoints(round);
        roundEnteredUSD_ = formatAsDollarString(
            _factory.getRoundEnteredUSD(round),
            0
        );
        // Both figures are only written on rounds that saw activity, so an empty round
        // reads zero and the last populated one has to be walked back to. The `round > 0`
        // guards matter: without them a system whose round 0 is still empty underflows
        // here and the whole view reverts.
        userCount_ = _factory.getUserCount(round);
        while (userCount_ == 0 && round != 0) {
            round--;
            userCount_ = _factory.getUserCount(round);
        }
        round = _factory.roundCounter() - roundsAgo;
        uint256 allEntered = _factory.getAllEnteredUSD(round);
        while (allEntered == 0 && round != 0) {
            round--;
            allEntered = _factory.getAllEnteredUSD(round);
        }
        allEnteredUSD_ = formatAsDollarString(allEntered, 0);
        NextBinaryPay = getTimeToNextBinaryPay();
    }

    /**
     * @notice Retrieves detailed user information for the current round.
     * @param userAddr The address of the user.
     * @return roundPoints The user's points in the current round and their maximum calculable points.
     * @return unmatchedVolume The formatted USD value of leg volume that has not been
     *         matched yet, one side or the other. The matched part is what has already
     *         paid out, so what is left on the heavier leg is what is still waiting for
     *         the other side to catch up.
     * @return worth The formatted USD value of the user's left and right side contributions.
     * @return users The number of users on the user's left and right sides.
     * @return dirEarned The formatted USD value of the user's direct earnings for the round and total.
     * @return binaryEarned The formatted USD value of the user's total binary earnings.
     * @return earnable The formatted USD value of the user's earnable amount for the round and total, or a top-up message.
     * @return insuranceStatus The participant's assurance standing, as a display string.
     * @dev Figures come back pre-formatted so a block explorer shows the same numbers as
     *      the dapp. Reverts with {UserNotFound} for an address that never registered.
     */
    function getUserBulkInfo(
        address userAddr
    )
        external
        view
        ifOpen
        returns (
            string memory roundPoints,
            string memory unmatchedVolume,
            string memory worth,
            string memory users,
            string memory dirEarned,
            string memory binaryEarned,
            string memory earnable,
            string memory insuranceStatus
        )
    {
        ISmartContract _factory = factory;
        uint48 userId = _factory.addrToId(userAddr);
        uint256 round = roundId;
        if (userId == 0) revert UserNotFound();
        (
            uint40 leftWorth,
            uint40 rightWorth,
            uint40 leftUsers_,
            uint40 rightUsers_,
            int40 variance,
            ,
            ,
            ,
            uint24 entrance
        ) = _factory.getUserData(userId);
        uint256 left = leftWorth;
        uint256 right = rightWorth;
        worth = string.concat(
            "Left: $",
            (left * 10).toString(),
            ", Right: $",
            (right * 10).toString()
        );
        uint256 roundPoints_ = _factory.getRoundPoints(round, userId);
        roundPoints = string.concat(
            uint256(roundPoints_).toString(),
            " / ",
            _factory.calculateMaxPoints(left < right ? left : right).toString()
        );
        users = string.concat(
            "Left: ",
            uint256(leftUsers_).toString(),
            ", Right: ",
            uint256(rightUsers_).toString()
        );
        uint256 roundDir = _factory.getRoundDirEarned(round, userId);
        dirEarned = string.concat(
            formatValueWithLabel("Round: ", roundDir, 2),
            formatValueWithLabel(
                ", Total: ",
                _factory.getTotalDirEarned(userId),
                2
            )
        );
        binaryEarned = formatValueWithLabel(
            "Total: ",
            _factory.getTotalBinaryEarned(userId),
            2
        );
        uint256 userMaxEntrance = _factory.entranceCap(entrance);
        uint256 _roundEarnable = userMaxEntrance > roundDir
            ? userMaxEntrance - roundDir
            : 0;
        uint256 _totalEarnable = _factory.getUserPeriodEarnable(userId);
        earnable = _totalEarnable >= 1e18
            ? string.concat(
                formatValueWithLabel("Round: ", _roundEarnable, 2),
                formatValueWithLabel(", Total: ", _totalEarnable, 2)
            )
            : "Top Up Time ...";
        (uint256 leftVariance, uint256 rightVariance) = variance < 0
            ? (uint256(int256(-variance)), uint256(0))
            : (uint256(0), uint256(int256(variance)));
        // Leg worth is stored as enterUSD/10, which is why {worth} and {legs} scale by
        // 10 — so this does too. The round's points used to be added in and the whole
        // thing scaled by 100, which measured neither volume nor points.
        unmatchedVolume = string.concat(
            "Left: $",
            (leftVariance * 10).toString(),
            ", Right: $",
            (rightVariance * 10).toString()
        );
        uint256 insuranceValue = _factory.insuranceStatus(userId);
        insuranceStatus = insuranceValue == uint256(0)
            ? "-"
            : insuranceValue == uint256(1)
                ? "UnderCommitmentTime"
                : formatValueWithLabel("commited: ", insuranceValue, 2);
    }

    /**
     * @notice Retrieves historical user information for a range of past rounds.
     * @param userAddr The address of the user.
     * @param fromRoundsAgo The number of rounds ago to start retrieving data.
     * @param RoundsAgo The number of rounds ago to end retrieving data.
     * @return points An array of points for each round.
     * @return dirEarn An array of formatted dollar strings for direct earnings per round.
     * @return binaryEarn An array of formatted dollar strings for binary earnings per round.
     * @return dirFlash An array of formatted dollar strings for direct flash earnings per round.
     * @return binaryFlash An array of formatted dollar strings for binary flash earnings per round.
     * @dev The caller bounds the range, so a window far enough back to be expensive to
     *      read is the caller's own choice rather than something this has to police.
     */
    function getUserRoundInfo(
        address userAddr,
        uint256 fromRoundsAgo,
        uint256 RoundsAgo
    )
        external
        view
        ifOpen
        returns (
            uint256[] memory points,
            string[] memory dirEarn,
            string[] memory binaryEarn,
            string[] memory dirFlash,
            string[] memory binaryFlash
        )
    {
        ISmartContract _factory = factory;
        uint48 userId = _factory.addrToId(userAddr);
        if (userId == 0) revert UserNotFound();
        uint256 len = fromRoundsAgo - RoundsAgo + 1;
        uint256 roundCounter = _factory.roundCounter();
        points = new uint256[](len);
        dirEarn = new string[](len);
        binaryEarn = new string[](len);
        dirFlash = new string[](len);
        binaryFlash = new string[](len);
        for (uint256 i; i < len; ) {
            uint256 round = roundCounter - fromRoundsAgo + i;
            points[i] = _factory.getRoundPoints(round, userId);
            dirEarn[i] = formatAsDollarString(
                _factory.getRoundDirEarned(round, userId),
                2
            );
            binaryEarn[i] = formatAsDollarString(
                _factory.getRoundBinaryEarned(round, userId),
                2
            );
            dirFlash[i] = formatAsDollarString(
                _factory.getRoundDirFlash(round, userId),
                2
            );
            binaryFlash[i] = formatAsDollarString(
                _factory.getRoundBinaryFlash(round, userId),
                2
            );
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Calculates and returns the time remaining until the next binary payout, or its status.
     * @return res A string indicating the time remaining or payout status.
     * @dev Three states: mid-payout reports progress through the receiver list, a round
     *      past its 12 hours reports that it is up, and a live round counts down.
     */
    function getTimeToNextBinaryPay()
        internal
        view
        returns (string memory res)
    {
        ISmartContract _factory = factory;
        if (binaryPayIndex != 0) {
            uint256 binaryReceiversCount = _factory.getBinaryReceiversLength(
                roundId
            );
            return
                string.concat(
                    "Time's up! (Paid: ",
                    binaryPayIndex.toString(),
                    "/",
                    binaryReceiversCount.toString(),
                    ")"
                );
        }
        uint256 real = _factory.realRound();
        bool passed = roundId != real;
        if (passed) return string.concat("Time's up!");

        uint256 nextTime = _factory.startTime() + ((real + 1) * 12 hours);
        uint256 remainingTime = nextTime - block.timestamp;
        return
            string.concat(
                " remaining : ",
                ((remainingTime % 12 hours) / 1 hours).toString(),
                " hours, ",
                ((remainingTime % 1 hours) / 1 minutes).toString(),
                " minutes"
            );
    }

    /**
     * @notice Retrieves the optimal referral address for user placement.
     * @param direct The address of the direct referrer.
     * @return referral The best referral address for placement.
     * @dev Delegates to the ledger, which walks down the lighter leg to the first free
     *      slot. Exposed here so a dapp only ever has to hold the window's address.
     */
    function getBestReferralForDirect(
        address direct
    ) external view ifOpen returns (address referral) {
        return factory.getBestReferralForPlacement(direct);
    }

    /**
     * @notice Retrieves the address of the latest active operational window.
     * @return window The address of the latest window.
     * @dev How a dapp holding a stale window address finds the current one. Every window
     *      answers this, including closed ones, which is the point of it being here.
     */
    function LatestWindow() external view returns (address window) {
        return IWindowFactory(factory).getLatestWindow();
    }

    /**
     * @notice Everything about the weekly race, readable from the latest round window so
     *         a dapp needs one call rather than several across two contracts.
     * @return weekId_ The week currently collecting.
     * @return weekWindow The window collecting it.
     * @return pool The USDT sitting in that window so far.
     * @return points Raw weekly points earned so far this week.
     * @return earners How many participants have earned at least one.
     * @return roundsLeft Rounds remaining before the week closes.
     * @return matchNeeded Matched leg volume, in dollars, that earns one weekly point.
     * @dev Reads across both the ledger and the weekly window so a dapp needs one call
     *      rather than several across two contracts.
     */
    function getWeekBulkInfo()
        external
        view
        returns (
            uint256 weekId_,
            address weekWindow,
            string memory pool,
            uint256 points,
            uint256 earners,
            uint256 roundsLeft,
            string memory matchNeeded
        )
    {
        ISmartContract _factory = factory;
        uint256 real = _factory.realRound();
        weekId_ = _factory.weekOf(real);
        weekWindow = _factory.weekToWindow(weekId_);
        pool = formatAsDollarString(
            weekWindow == address(0) ? 0 : IERC20(USDT).balanceOf(weekWindow),
            2
        );
        points = _factory.weekTotalPoints(weekId_);
        earners = _factory.getWeekReceiversLength(weekId_);
        uint256 weekRounds = _factory.WEEK_ROUNDS();
        // The week boundary is where {DataStorage-weekOf} puts it, which is
        // `(round + weekPhase) / WEEK_ROUNDS` — so the countdown has to carry the same
        // phase. Without it this measured to a boundary anchored at deployment rather
        // than to the real one, and was correct only for a contract that happened to go
        // out on a Monday. v7 went out on a Friday (weekPhase 8), so round 30 of week 2
        // reported 12 rounds left when the week in fact rolled 4 rounds later.
        roundsLeft = weekRounds - ((real + _factory.weekPhase()) % weekRounds);
        // Leg worth is carried in units of enterUSD/10, so the dollar figure is x10.
        matchNeeded = formatAsDollarString(
            _factory.WEEK_MATCH_UNIT() * 10 * 1e18,
            0
        );
    }

    /**
     * @notice One participant's standing in the current week.
     * @param userAddr The participant to look up.
     * @return legs Matched volume so far, as left and right dollar figures.
     * @return matched The smaller of the two, in dollars — this is what earns points.
     * @return toNextPoint Dollars of matched volume still needed for the next point.
     * @return points Raw weekly points earned this week.
     * @return payable_ Points that will actually be paid, after the 3-of-4 cut.
     * @return lifetime Weekly points this participant has ever earned.
     * @dev Reverts with {UserNotFound} for an address that never registered. Reports the
     *      week that is collecting now, not the one this window's round belongs to.
     */
    function getUserWeekInfo(
        address userAddr
    )
        external
        view
        returns (
            string memory legs,
            string memory matched,
            string memory toNextPoint,
            uint256 points,
            uint256 payable_,
            uint256 lifetime
        )
    {
        ISmartContract _factory = factory;
        uint48 userId = _factory.addrToId(userAddr);
        if (userId == 0) revert UserNotFound();
        uint256 week = _factory.weekOf(_factory.realRound());

        (
            uint256 left,
            uint256 right,
            uint256 m,
            uint256 raw,
            uint256 credited
        ) = _factory.getWeekProgress(userId, week);

        legs = string.concat(
            "Left: $",
            (left * 10).toString(),
            ", Right: $",
            (right * 10).toString()
        );
        matched = string.concat("$", (m * 10).toString());

        uint256 unit = _factory.WEEK_MATCH_UNIT();
        toNextPoint = string.concat("$", ((unit - (m % unit)) * 10).toString());
        (, , , uint32 total) = _factory._userWeek(userId);
        return (legs, matched, toNextPoint, raw, credited, total);
    }

    /**
     * @notice Routes the weekly share of an entry to the week's window.
     * @dev Sends a share of an entry to the weekly window pool.
     *      While no weekly window is configured the transfer is skipped and the funds
     *      simply stay in this window, so the pool is never worse off than before.
     * @param amount The USDT amount to route to the weekly window.
     */
    function _payWeeklyWindow(uint256 amount) internal {
        if (amount == 0) return;
        address weekly = factory.weeklyWindow();
        if (weekly == address(0)) return;
        IERC20(USDT).safeTransfer(weekly, amount);
    }

    /**
     * @notice Stops the window accepting new entries.
     * @dev Called at settlement, and by {_shutdown}. Idempotent, and deliberately does
     *      not touch the payout functions: a closed window still has a round to pay out.
     */
    function _closeWindow() internal {
        isClosed = true;
        emit WindowClosedEvent(roundId);
    }

    /**
     * @notice True once an emergency shutdown has carried.
     */
    bool internal isShutdown;

    /**
     * @notice Thrown when the system has been shut down by participant vote.
     */
    error EmergencyShutdown();

    /**
     * @notice Votes for an emergency shutdown of the system.
     * @dev The tally is kept by the factory, weighted by what each account paid, and
     *      stands until it is withdrawn. Only the execution is here, because this is
     *      where the money is: the vote that crosses the threshold is the one that
     *      drains the pool, in the same call.
     */
    function voteShutdown() external nonReentrant onlyLatestWindow {
        if (isShutdown) revert EmergencyShutdown();
        bool carried = factory.recordShutdownVote(msg.sender);
        if (carried) _shutdown();
        emit ShutdownVoteCast(msg.sender, carried);
    }

    /**
     * @notice Empties the system into the contract provider and closes it for good.
     * @dev Reached only from {voteShutdown}, on the vote that crosses the threshold.
     *      Sweeps the weekly pools first, then this window's own USDT and native balance.
     */
    function _shutdown() internal {
        isShutdown = true;
        _closeWindow();
        address provider = factory.getContractProvider();
        // The weekly pool is part of the system's funds, so a shutdown has to empty it
        // as well — otherwise it would sit in a window whose payout can never complete.
        _drainWeeklyWindows(provider);
        uint256 stableAmount = stableToken.balanceOf(address(this));
        uint256 nativeAmount = address(this).balance;
        if (stableAmount != 0) stableToken.safeTransfer(provider, stableAmount);
        if (nativeAmount != 0) payable(provider)._sendValue(nativeAmount);
        emit SystemShutdown(roundId, provider, stableAmount, nativeAmount);
    }

    /**
     * @notice Sweeps every weekly window that could still be holding funds.
     * @dev Empties the weekly windows that can still be holding funds: the one currently
     *      collecting, and the week before it if its payout never ran.
     *
     *      Older weeks are not walked. Weeks are settled as they end, so anything further
     *      back has already been paid out and swept, and an unbounded loop over every
     *      week the system has ever seen is not something a shutdown should depend on.
     * @param to Where the funds go.
     */
    function _drainWeeklyWindows(address to) internal {
        ISmartContract _factory = factory;
        address current = _factory.weeklyWindow();
        if (current == address(0)) return;
        WeeklyWindow(current).drain(to);

        uint256 week = WeeklyWindow(current).weekId();
        if (week == 0) return;
        address previous = _factory.weekToWindow(week - 1);
        if (previous != address(0) && previous != current) {
            WeeklyWindow(previous).drain(to);
        }
    }
    /**
     * @notice Closes the caller's account and pays out the assurance it is owed.
     * @dev The ledger side reverts unless the account is actually insured and has held
     *      its place for the full commitment period, so the transfer below only ever
     *      runs on an eligible account.
     *
     *      `nonReentrant` even though the ledger side is already single-shot — it clears
     *      the account's insurance slot, so a second pass reverts with
     *      `NotInAssuranceList` before it could pay twice. The guard is here because
     *      "the callee happens to be idempotent" is a property of another contract that
     *      this one would otherwise silently depend on, and because an external call sits
     *      ahead of a transfer, which is the shape worth refusing on principle.
     */
    function terminateAccount() external nonReentrant {
        address userAddr = msg.sender;
        uint256 _assurance = factory.terminateAccount(userAddr);
        // An empty assurance pool pays nothing; skip the transfer rather than move zero.
        if (_assurance != 0) stableToken.safeTransfer(userAddr, _assurance);
        emit AccountTerminated(userAddr, _assurance);
    }
}
