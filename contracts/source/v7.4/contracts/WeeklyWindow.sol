// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ISmartContract.sol";

/**
 * @title WeeklyWindow
 * @author Obsidian
 * @notice Holds one week's bonus pool and pays it out to the participants who balanced
 *         their legs during that week.
 *
 *         One of these is cloned per week — fourteen rounds, seven days. It is funded
 *         while its week is running by a flat 15% of every join plus a stage-dependent
 *         0-15% of every top-up, and it pays out once its week has ended.
 *
 *         Everything it does not pay out — the fourth point of every four, and any share
 *         a participant's period-earnable budget could not absorb — is swept to the
 *         latest round window, where it raises the round point value.
 * @dev An EIP-1167 clone, like the round windows, so everything that varies per week is
 *      bound in {init} and the only constructor argument is the stablecoin, which is the
 *      same for every week. It holds funds but keeps no ledger: who earned what is
 *      recorded on {SmartContract}, and this contract only moves USDT on that contract's
 *      say-so. There is no owner and no privileged setter — the payout is permissionless
 *      and the only restricted entry point is {drain}, which an emergency shutdown uses.
 */
contract WeeklyWindow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /**
     * @notice Thrown when {init} is called on a window that is already bound.
     */
    error OnlyFactory();

    /**
     * @notice Thrown when the caller is not a window the main contract created.
     */
    error OnlyVerifiedWindow();

    /**
     * @notice Thrown when a payout is attempted while the week is still collecting.
     */
    error WeekNotEnded();

    /**
     * @notice Thrown when the pool has already been paid out and swept.
     */
    error AlreadyDistributed();

    /**
     * @notice Thrown when the implementation is constructed with a zero stablecoin.
     */
    error InvalidStableToken();

    /**
     * @notice Address of the USDT stablecoin on BSC Mainnet.
     * @dev Fixed at construction and `immutable`, so there is no setter and no lever over
     *      which token the week's pool is denominated in. It is supplied as a constructor
     *      argument rather than written as a literal only so that the token is stated once
     *      at deployment; an immutable is burned into this implementation's runtime code
     *      and cannot be changed afterwards by anyone.
     */
    address internal immutable USDT;

    /**
     * @notice The main SmartContract factory.
     * @dev Storage rather than an immutable, for the same reason as
     *      {SmartContractWindow-factory}: this implementation is deployed before the
     *      factory exists and is bound in {init}.
     */
    ISmartContract public factory;

    /**
     * @notice The week this window collects for and pays out.
     */
    uint256 public weekId;

    /**
     * @notice Set once the whole pool has been distributed and swept.
     */
    bool public isFinished;

    /**
     * @notice The value of one raw weekly point, frozen at the first payout call so
     *         every batch is paid at the same rate.
     */
    uint256 public stabilizedWeekPointValue;

    /**
     * @notice How far through the receiver list the payout has reached.
     */
    uint256 public weekPayIndex;

    /**
     * @notice Emitted once the week's pool has been fully paid out and swept.
     * @param week The week that closed.
     * @param pointValue The value each raw weekly point was settled at.
     * @param sweptToRound The remainder handed back to the round window.
     */
    event WeekClosed(
        uint256 indexed week,
        uint256 pointValue,
        uint256 sweptToRound
    );

    /**
     * @notice Refuses a window that has already been bound to a factory.
     * @dev Once-only rather than caller-is-factory: a fresh clone has no factory
     *      recorded yet, and {WindowFactory-createWeeklyWindow} clones and initializes
     *      in the same call, so no one else can reach it first.
     */
    modifier initializer() {
        if (address(factory) != address(0)) revert OnlyFactory();
        _;
    }

    /**
     * @notice Emitted once, when a freshly cloned window is bound to its week.
     * @param factoryAddr The main contract that cloned and bound this window.
     * @param week The week this window collects for.
     */
    event WeekOpened(address indexed factoryAddr, uint256 indexed week);

    /**
     * @notice Deploys the implementation that every weekly window is cloned from.
     * @dev Marks the implementation itself as bound, so {init} refuses it. Clones
     *      start with empty storage and are bound by whoever clones them.
     *
     *      {USDT} is set here rather than in {init} because it is the same for every
     *      week: an immutable lives in this implementation's runtime code, and an
     *      EIP-1167 clone delegatecalls into that code, so every clone reads it without
     *      being told it again.
     * @param usdt_ The USDT stablecoin the week's pool is denominated in.
     */
    constructor(address usdt_) payable {
        if (usdt_ == address(0)) revert InvalidStableToken();
        USDT = usdt_;
        factory = ISmartContract(address(this));
    }

    /**
     * @notice Binds a freshly cloned window to its week and to its factory.
     * @dev The once-only guard lives in {initializer}.
     * @param week The week this window collects for and pays out.
     */
    function init(uint256 week) external initializer {
        factory = ISmartContract(msg.sender);
        weekId = week;
        emit WeekOpened(msg.sender, week);
    }

    /**
     * @notice True once this window's week is over and its pool can be paid out.
     * @dev Deliberately keyed on the factory having moved its pointer to the next week,
     *      not merely on the clock. A week can run out without any round settling — the
     *      round window stays open until someone distributes it — and during that gap
     *      this window is still the destination for the weekly share of every entry.
     *      Paying out then would close a window that is about to receive more money,
     *      stranding it for good. The pointer only moves at a settlement, and once it
     *      has moved nothing further can be routed here.
     */
    function hasEnded() public view returns (bool) {
        return factory.weeklyWindow() != address(this);
    }

    /**
     * @notice Pays the next batch of this week's earners, then sweeps the remainder to
     *         the round window once everyone has been paid.
     * @dev Anyone may call this, exactly like the round distribution. It is also driven
     *      from the round window so a caller can settle both in one transaction.
     * @param nodes How many earners to pay in this batch.
     */
    function distributeWeekly(uint256 nodes) external nonReentrant {
        if (isFinished) revert AlreadyDistributed();
        if (!hasEnded()) revert WeekNotEnded();
        _distribute(nodes);
    }

    /**
     * @notice Same as {distributeWeekly} but returns quietly instead of reverting when
     *         there is nothing to do.
     * @dev This is the entry point the round window uses, so passing a batch size while
     *      the week is still running simply skips the weekly half of the transaction
     *      rather than failing the round payout alongside it.
     * @param nodes How many earners to pay in this batch. Zero does nothing.
     */
    function tryDistributeWeekly(uint256 nodes) external nonReentrant {
        if (nodes == 0 || isFinished || !hasEnded()) return;
        _distribute(nodes);
    }

    /**
     * @notice Emitted when an emergency shutdown empties this window.
     * @param week The week that was drained.
     * @param amount What it was holding.
     */
    event WeekDrained(uint256 indexed week, uint256 amount);

    /**
     * @notice Hands the whole pool over during an emergency shutdown.
     * @dev Restricted to windows the factory recognises. The only path here is
     *      {SmartContractWindow._shutdown}, which a closed window cannot reach — the
     *      vote that triggers it is guarded by `onlyLatestWindow`.
     *
     *      The window is marked finished so it cannot afterwards be "distributed" at a
     *      point value of zero.
     *      `nonReentrant` for the same reason as {SmartContractWindow-terminateAccount}:
     *      the `isFinished` flag already makes a second pass a transfer of zero, but an
     *      external call to a caller-supplied address belongs behind the guard anyway.
     * @param to Where the funds go — the contract provider, matching the round window.
     */
    function drain(address to) external nonReentrant {
        if (!factory.windowIsVerified(msg.sender)) revert OnlyVerifiedWindow();
        isFinished = true;
        uint256 balance = IERC20(USDT).balanceOf(address(this));
        if (balance != 0) IERC20(USDT).safeTransfer(to, balance);
        emit WeekDrained(weekId, balance);
    }

    /**
     * @notice Everything about this week in one call, so the window itself is readable
     *         straight from a block explorer.
     * @return week The week this window holds.
     * @return pool USDT currently in the window.
     * @return points Raw weekly points earned in this week.
     * @return earners Participants owed a share.
     * @return paidSoFar How many of them have been paid.
     * @return ended Whether the week is over and the payout can run.
     * @return finished Whether the pool has been fully paid and swept.
     * @return pointValue Value of one raw point, once frozen.
     * @dev Before the first payout freezes it, `pointValue` shows what the pool would
     *      settle at right now rather than zero.
     */
    function getWeekBulkInfo()
        external
        view
        returns (
            uint256 week,
            uint256 pool,
            uint256 points,
            uint256 earners,
            uint256 paidSoFar,
            bool ended,
            bool finished,
            uint256 pointValue
        )
    {
        week = weekId;
        pool = IERC20(USDT).balanceOf(address(this));
        points = factory.weekTotalPoints(week);
        earners = factory.getWeekReceiversLength(week);
        paidSoFar = weekPayIndex;
        ended = hasEnded();
        finished = isFinished;
        // Before the first payout freezes it, show what it would settle at right now.
        pointValue = stabilizedWeekPointValue != 0
            ? stabilizedWeekPointValue
            : (points == 0 ? 0 : pool / points);
    }

    /**
     * @notice One participant's standing in this window's week.
     * @param userAddr The participant to look up.
     * @return matched Matched leg volume, in leg-worth units.
     * @return raw Weekly points earned.
     * @return credited Points that will be paid, after the 3-of-4 cut.
     * @return owed What those credited points are worth at the current rate.
     * @dev Returns zeros for an unregistered address rather than reverting, so a dapp can
     *      call it for any wallet without checking first.
     */
    function getUserWeekInfo(
        address userAddr
    )
        external
        view
        returns (
            uint256 matched,
            uint256 raw,
            uint256 credited,
            uint256 owed
        )
    {
        uint48 userId = factory.addrToId(userAddr);
        if (userId == 0) return (0, 0, 0, 0);

        uint256 week = weekId;
        (, , matched, raw, credited) = factory.getWeekProgress(userId, week);

        uint256 points = factory.weekTotalPoints(week);
        uint256 value = stabilizedWeekPointValue != 0
            ? stabilizedWeekPointValue
            : (
                points == 0
                    ? 0
                    : IERC20(USDT).balanceOf(address(this)) / points
            );
        owed = credited * value;
    }

    /**
     * @notice Pays a batch of this week's earners and finishes the week when done.
     * @dev Freezes the point value on the first batch and moves the cursor before paying
     *      anyone, so a batch can never be replayed.
     * @param nodes How many earners to pay in this batch.
     */
    function _distribute(uint256 nodes) internal {
        uint256 week = weekId;
        uint256 totalPoints = factory.weekTotalPoints(week);
        IERC20 usdt = IERC20(USDT);

        // Nobody balanced their legs this week, so the whole pool goes straight back.
        if (totalPoints == 0) {
            _finish(week, 0, usdt);
            return;
        }

        uint256 value = stabilizedWeekPointValue;
        if (value == 0) {
            // Frozen on the first batch. Recomputing per batch would pay early batches
            // more than late ones as the balance drains.
            value = usdt.balanceOf(address(this)) / totalPoints;
            stabilizedWeekPointValue = value;
        }

        uint256 index = weekPayIndex;
        uint256 receivers = factory.getWeekReceiversLength(week);
        uint256 end = index + nodes;
        if (end > receivers) end = receivers;

        // Move the cursor before paying anyone, so a batch can never be replayed.
        weekPayIndex = end;

        for (uint256 i = index; i < end; ) {
            (address userAddr, uint256 amount) = factory.processWeeklyPayout(
                week,
                i,
                value
            );
            // A zero address would revert the whole batch and strand the pool.
            if (amount != 0 && userAddr != address(0)) {
                usdt.safeTransfer(userAddr, amount);
            }
            unchecked {
                ++i;
            }
        }

        if (end == receivers) _finish(week, value, usdt);
    }

    /**
     * @notice Closes the week and hands whatever is left to the round window.
     * @dev That remainder is the fourth point of every four, every forfeited share, and
     *      any dust — none of it is shared out among the other earners, and none of it
     *      carries into next week.
     * @param week The week being closed.
     * @param value The point value it settled at.
     * @param usdt The stablecoin being swept.
     */
    function _finish(uint256 week, uint256 value, IERC20 usdt) internal {
        isFinished = true;
        uint256 remainder = usdt.balanceOf(address(this));
        if (remainder != 0) {
            usdt.safeTransfer(factory.getLatestWindow(), remainder);
        }
        emit WeekClosed(week, value, remainder);
    }
}
