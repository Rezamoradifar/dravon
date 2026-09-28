// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import "./IWindowFactory.sol";

/**
 * @title ISmartContract
 * @author Obsidian
 * @notice The surface the round and weekly windows call on the main contract.
 * @dev The windows hold the money and the main contract holds the ledger, so every entry,
 *      payout and settlement crosses this boundary. It is deliberately wider than a
 *      minimal interface: the bulk view functions on the windows read most of the
 *      ledger's getters so a dapp can render a whole screen from one window call.
 */
interface ISmartContract is IWindowFactory {
    /**
     * @notice The timestamp the system started at, floored to a 12-hour boundary.
     * @dev The anchor every round number is derived from. See {realRound}.
     * @return The start timestamp, in seconds.
     */
    function startTime() external view returns (uint256);

    /**
     * @notice Registers a new participant and places them in the structure.
     * @dev Callable only by the latest window, which has already taken payment.
     * @param userAddr The address of the participant joining.
     * @param direct The address of the participant who directly referred `userAddr`.
     * @param referral The address of the participant under whom `userAddr` is placed.
     * @param entrance The box paid for: 10 is the $11 installment, 50 and 100 the real boxes.
     * @param enterUSD The USD value associated with this entry.
     * @return directShare The share the window should transfer to the direct referrer.
     */
    function join(
        address userAddr,
        address direct,
        address referral,
        uint24 entrance,
        uint256 enterUSD
    ) external returns (uint256 directShare);

    /**
     * @notice Raises an existing participant to a higher box, or renews the top one.
     * @dev Callable only by the latest window. Reverts if the target box is not strictly
     *      above the current one, the $110 box renewing itself excepted.
     * @param userAddr The address of the participant topping up.
     * @param entrance The box being topped up to.
     * @param enterUSD The USD value associated with this top-up.
     * @return directAddr The address of the direct referrer.
     * @return directShare The share allocated to the direct referrer.
     */
    function topUp(
        address userAddr,
        uint24 entrance,
        uint256 enterUSD
    ) external returns (address directAddr, uint256 directShare);

    /**
     * @notice Works out what one participant is owed from a round's pool.
     * @dev Callable only by a window this contract created. Updates the ledger and
     *      returns the figures for the window to transfer; it moves no funds itself.
     * @param roundId The round being settled.
     * @param index The participant's position in that round's binary receiver list.
     * @param pointValue The value assigned to each point for this payout.
     * @return userAddr The participant to pay.
     * @return amount What their period-earnable budget could absorb.
     * @return devShare Debt this payout cleared that belongs to the dev. Withheld from
     *         `amount`, not added to it.
     */
    function processBinaryTeamPayout(
        uint256 roundId,
        uint256 index,
        uint256 pointValue
    ) external returns (address userAddr, uint256 amount, uint256 devShare);

    /**
     * @notice Casts one account's vote for an emergency shutdown.
     * @dev Callable only by the latest window. Weighted by what the account paid, not by
     *      headcount, and final once cast. Reverts if the account has already voted.
     * @param userAddr The voter.
     * @return reached Whether the weight behind a shutdown now crosses the threshold.
     */
    function recordShutdownVote(
        address userAddr
    ) external returns (bool reached);

    /**
     * @notice Moves a participant's account to a different wallet.
     * @dev Callable only by the latest window. The participant keeps their id, so their
     *      position, balances and shutdown vote all follow the move.
     * @param oldAddr The current wallet address of the participant.
     * @param newAddr The new wallet address for the participant.
     */
    function changeWalletAddress(address oldAddr, address newAddr) external;

    /**
     * @notice Closes an account and releases whatever assurance it is owed.
     * @dev Callable only by the latest window. Flashes the account and clears its
     *      period-earnable budget; the window pays out the returned amount.
     * @param userAddr The account being closed.
     * @return payout The assurance value to transfer to the participant.
     */
    function terminateAccount(
        address userAddr
    ) external returns (uint256 payout);

    /**
     * @notice Closes the current round and opens the next one.
     * @dev Callable only by the latest window, at settlement. Advances the stage
     *      controller and opens a new weekly window if the week has turned over.
     * @param newAssurance Assurance to carry into the new round.
     * @param freeAfter Reserve left once this round's payout and assurance are set aside.
     * @param roundPoints Points minted in the round that just settled.
     * @return The address of the newly created window.
     */
    function roundIncrement(
        uint256 newAssurance,
        uint256 freeAfter,
        uint256 roundPoints
    ) external returns (address);

    /**
     * @notice The current pool stage, 1 (healthiest) to 4 (floor).
     * @dev Fixed for a whole round: only ever written at settlement.
     * @return The current stage.
     */
    function stage() external view returns (uint8);

    /**
     * @notice The lever settings for a given stage.
     * @dev A pure table, so retuning it needs a redeploy rather than a privileged setter.
     * @param s The stage to query.
     * @return weeklyPct Percent of a top-up's `enterUSD` routed to the weekly window.
     * @return pointCeiling Upper bound applied on top of the max-points tiers.
     * @return renewalScoreMask Which slots of each 4-renewal cycle mint points.
     */
    function stageParams(
        uint8 s
    )
        external
        pure
        returns (uint8 weeklyPct, uint16 pointCeiling, uint8 renewalScoreMask);

    /**
     * @notice The lever settings in force for the current round.
     * @dev Saves callers reading {stage} and {stageParams} as two separate calls.
     * @return weeklyPct Percent of a top-up's `enterUSD` routed to the weekly window.
     * @return pointCeiling Upper bound applied on top of the max-points tiers.
     * @return renewalScoreMask Which slots of each 4-renewal cycle mint points.
     */
    function currentStageParams()
        external
        view
        returns (uint8 weeklyPct, uint16 pointCeiling, uint8 renewalScoreMask);

    /**
     * @notice The stage a given reserve coverage implies on its own.
     * @dev The ladder with no timing rules; the hysteresis is layered on at settlement.
     * @param coverage Coverage in hundredths of a round.
     * @return The implied stage.
     */
    function stageFor(uint256 coverage) external pure returns (uint8);

    /**
     * @notice The weekly window currently collecting.
     * @dev Also what a weekly window checks to learn whether its own week has ended.
     * @return The address of the collecting weekly window.
     */
    function weeklyWindow() external view returns (address);

    /**
     * @notice Whether an address is a window this contract created.
     * @dev The access check behind every payout path.
     * @param window The address to test.
     * @return True if the address is a window of this system.
     */
    function windowIsVerified(address window) external view returns (bool);

    /**
     * @notice The window that collected and pays out a given week.
     * @dev Returns the zero address for a week that never saw any activity.
     * @param week The week to look up.
     * @return The address of that week's window.
     */
    function weekToWindow(uint256 week) external view returns (address);

    /**
     * @notice The week a round belongs to.
     * @dev Offset by the deployment's week phase so weeks land on Monday 12:00 UTC.
     * @param round The round to look up.
     * @return The week number.
     */
    function weekOf(uint256 round) external view returns (uint256);

    /**
     * @notice Raw weekly points earned in a week.
     * @dev The divisor that week's pool is split by.
     * @param week The week to look up.
     * @return The total raw points.
     */
    function weekTotalPoints(uint256 week) external view returns (uint256);

    /**
     * @notice How many participants are owed a payout from a week's pool.
     * @dev The bound the weekly payout batches against.
     * @param week The week to look up.
     * @return The number of receivers.
     */
    function getWeekReceiversLength(
        uint256 week
    ) external view returns (uint256);

    /**
     * @notice A participant's standing in a week.
     * @dev Reads zero for a stale snapshot, which means no activity since the week opened.
     * @param userId The participant to look up.
     * @param week The week to look up.
     * @return left Left leg volume accrued this week, in leg-worth units.
     * @return right Right leg volume accrued this week, in leg-worth units.
     * @return matched The smaller of the two — what actually earns points.
     * @return raw Points matched, counted in the week's divisor.
     * @return credited Points after the 3-of-4 cut. Only these are paid.
     */
    function getWeekProgress(
        uint48 userId,
        uint256 week
    )
        external
        view
        returns (
            uint256 left,
            uint256 right,
            uint256 matched,
            uint256 raw,
            uint256 credited
        );

    /**
     * @notice Works out what one participant is owed from a week's pool.
     * @dev Callable only by a window this contract created. Updates the ledger and
     *      returns the figure for the weekly window to transfer.
     * @param week The week being settled.
     * @param index The participant's position in that week's receiver list.
     * @param pointValue Value of one raw weekly point, frozen by the weekly window.
     * @return userAddr The participant to pay.
     * @return amount What their period-earnable budget could absorb.
     */
    function processWeeklyPayout(
        uint256 week,
        uint256 index,
        uint256 pointValue
    ) external returns (address userAddr, uint256 amount);

    /**
     * @notice A participant's weekly snapshot and lifetime weekly point total.
     * @dev The lifetime total anchors the 3-of-4 cycle across week boundaries.
     * @param userId The participant to look up.
     * @return weekId The week the snapshot belongs to.
     * @return legLeftAtStart Left leg worth when that week opened.
     * @return legRightAtStart Right leg worth when that week opened.
     * @return wPointsTotal Weekly points ever earned.
     */
    function _userWeek(
        uint48 userId
    )
        external
        view
        returns (
            uint16 weekId,
            uint40 legLeftAtStart,
            uint40 legRightAtStart,
            uint32 wPointsTotal
        );

    /**
     * @notice Matched leg worth that earns one weekly point.
     * @dev In leg-worth units, which are `enterUSD / 10`. Multiply by 10 for dollars.
     * @return The match unit.
     */
    function WEEK_MATCH_UNIT() external view returns (uint256);

    /**
     * @notice How many rounds make up a week.
     * @dev Fourteen, which at a 12-hour round is seven days.
     * @return The number of rounds.
     */
    function WEEK_ROUNDS() external view returns (uint256);

    /**
     * @notice Rounds of offset between the deployment and the weekly cadence.
     * @dev Fixed at construction so that week boundaries land on the {WEEK_ANCHOR}
     *      weekday and hour whenever the system is deployed. Anything measuring a
     *      distance to a week boundary has to carry this, exactly as {weekOf} does.
     * @return The phase offset, in rounds.
     */
    function weekPhase() external view returns (uint256);

    /**
     * @notice The best placement under a referrer for a new participant.
     * @dev Walks down the lighter leg until it finds a free slot, so the tree stays balanced.
     * @param direct The referrer to place under.
     * @return The address of the recommended placement.
     */
    function getBestReferralForPlacement(
        address direct
    ) external view returns (address);

    /**
     * @notice The round the ledger is currently accounting to.
     * @dev Lags {realRound} until someone settles; the difference is what closes a window.
     * @return The current round number.
     */
    function roundCounter() external view returns (uint256);

    /**
     * @notice The round the clock says it is.
     * @dev Derived from {startTime}; advances every 12 hours whether or not anyone settles.
     * @return The current real-time round number.
     */
    function realRound() external view returns (uint256);

    /**
     * @notice The size of a round's payout list and the points it must cover.
     * @dev Read together because the point value is one divided by the other.
     * @param roundId The round to look up.
     * @return users The number of binary receivers in the round.
     * @return points The total points accumulated in the round.
     */
    function roundData(
        uint256 roundId
    ) external view returns (uint256 users, uint256 points);

    /**
     * @notice How many participants the system held as of a given round.
     * @dev Only written on rounds that saw activity, so an empty round reads zero.
     * @param round The round to look up.
     * @return The participant count.
     */
    function getUserCount(uint256 round) external view returns (uint256);

    /**
     * @notice USD that entered in one round.
     * @dev Entries and top-ups both count, at their net value.
     * @param round The round to look up.
     * @return The USD value, with 18 decimals.
     */
    function getRoundEnteredUSD(uint256 round) external view returns (uint256);

    /**
     * @notice USD that has entered across the system's whole life.
     * @dev Carries the predecessor's lifetime total across a migration.
     * @param round The round to look up.
     * @return The cumulative USD value, with 18 decimals.
     */
    function getAllEnteredUSD(uint256 round) external view returns (uint256);

    /**
     * @notice Total points minted in one round.
     * @dev The denominator the round's point value is computed from.
     * @param round The round to look up.
     * @return The total points.
     */
    function getRoundTotalPoints(uint256 round) external view returns (uint256);

    /**
     * @notice What one point settled at in a past round.
     * @dev Read off that round's own window, so a closed round reports the terms its
     *      participants actually entered under.
     * @param round The round to look up.
     * @return The point value, with 18 decimals.
     */
    function getRoundPointValue(uint256 round) external view returns (uint256);

    /**
     * @notice The two participants placed directly under a given one.
     * @dev Either side reads as the zero address when that slot is still free.
     * @param userAddr The participant to look up.
     * @return left The address on the left.
     * @return right The address on the right.
     */
    function userChilds(
        address userAddr
    ) external view returns (address left, address right);

    /**
     * @notice A participant's binary tree as a breadth-first list.
     * @dev Index 0 is the root; the children of index `n` sit at `2n + 1` and `2n + 2`.
     *      Empty slots come back as the zero address.
     * @param addr The address of the participant at the root of the returned tree.
     * @param len The number of nodes to expand below the root.
     * @return addrList The breadth-first list of addresses.
     */
    function getUserTree(
        address addr,
        uint256 len
    ) external view returns (address[] memory addrList);

    /**
     * @notice A participant's structural data.
     * @dev Leg worth is carried in units of `enterUSD / 10`; multiply by 10 for dollars.
     * @param userId The ID of the participant.
     * @return leftWorth The total value attributed to the left branch.
     * @return rightWorth The total value attributed to the right branch.
     * @return leftUsers The number of participants in the left branch.
     * @return rightUsers The number of participants in the right branch.
     * @return variance The structural balance variance.
     * @return depth The depth of the participant.
     * @return childs The number of direct connections.
     * @return legSide The side of the upline the participant is on.
     * @return entrance The box the participant holds.
     */
    function getUserData(
        uint48 userId
    )
        external
        view
        returns (
            uint40 leftWorth,
            uint40 rightWorth,
            uint40 leftUsers,
            uint40 rightUsers,
            int40 variance,
            uint16 depth,
            uint8 childs,
            int8 legSide,
            uint24 entrance
        );

    /**
     * @notice A participant's links to the participants around them.
     * @dev All four are ids rather than addresses, so they survive a wallet change.
     * @param userId The ID of the participant.
     * @return directId The ID of the participant's direct referrer.
     * @return uplineId The ID of the participant's upline.
     * @return leftDirectId The ID of the participant placed on the left.
     * @return rightDirectId The ID of the participant placed on the right.
     */
    function getUserInfo(
        uint48 userId
    )
        external
        view
        returns (
            uint48 directId,
            uint48 uplineId,
            uint48 leftDirectId,
            uint48 rightDirectId
        );

    /**
     * @notice What a participant may still earn before they flash.
     * @dev Shared across every payout route: direct, binary and weekly all draw on it.
     * @param userId The ID of the participant.
     * @return The remaining earnable amount, with 18 decimals.
     */
    function getUserPeriodEarnable(
        uint48 userId
    ) external view returns (uint256);

    /**
     * @notice Points a participant minted in one round.
     * @dev Bounded per round by the max-points tiers and the stage's point ceiling.
     * @param round The round to look up.
     * @param userId The ID of the participant.
     * @return The points earned.
     */
    function getRoundPoints(
        uint256 round,
        uint48 userId
    ) external view returns (uint40);

    /**
     * @notice Direct referral rewards a participant received in one round.
     * @dev Excludes anything the earnable budget could not absorb; see {getRoundDirFlash}.
     * @param round The round to look up.
     * @param userId The ID of the participant.
     * @return The amount earned, with 18 decimals.
     */
    function getRoundDirEarned(
        uint256 round,
        uint48 userId
    ) external view returns (uint256);

    /**
     * @notice Binary team rewards a participant received in one round.
     * @dev Excludes anything the earnable budget could not absorb; see {getRoundBinaryFlash}.
     * @param round The round to look up.
     * @param userId The ID of the participant.
     * @return The amount earned, with 18 decimals.
     */
    function getRoundBinaryEarned(
        uint256 round,
        uint48 userId
    ) external view returns (uint256);

    /**
     * @notice Direct referral rewards a participant has received in total.
     * @dev Carried across migrations, so it spans versions rather than one deployment.
     * @param userId The ID of the participant.
     * @return The lifetime amount, with 18 decimals.
     */
    function getTotalDirEarned(uint48 userId) external view returns (uint256);

    /**
     * @notice Binary team rewards a participant has received in total.
     * @dev Carried across migrations, so it spans versions rather than one deployment.
     * @param userId The ID of the participant.
     * @return The lifetime amount, with 18 decimals.
     */
    function getTotalBinaryEarned(
        uint48 userId
    ) external view returns (uint256);

    /**
     * @notice The most points one account can hold in a round, by its smaller leg.
     * @dev A step table, not a formula. The stage's point ceiling is applied on top.
     * @param minLeg The value of the smaller leg, in leg-worth units.
     * @return The maximum points attainable.
     */
    function calculateMaxPoints(uint256 minLeg) external pure returns (uint256);

    /**
     * @notice The participant id a wallet belongs to.
     * @dev Zero means the address is not registered.
     * @param userAddr The wallet address of the participant.
     * @return The ID of the participant.
     */
    function addrToId(address userAddr) external view returns (uint48);

    /**
     * @notice The wallet a participant id currently pays out to.
     * @dev Changes when a participant moves wallets; the id does not.
     * @param userId The ID of the participant.
     * @return The wallet address of the participant.
     */
    function idToAddr(uint48 userId) external view returns (address);

    /**
     * @notice How many participants are owed a payout from a round's pool.
     * @dev The bound the round payout batches against.
     * @param round The round to look up.
     * @return The number of receivers.
     */
    function getBinaryReceiversLength(
        uint256 round
    ) external view returns (uint256);

    /**
     * @notice One entry of a round's payout list.
     * @dev Positional; the order is the order participants first scored in that round.
     * @param round The round to look up.
     * @param index The position in the list.
     * @return The ID of the binary receiver.
     */
    function getBinaryReceiver(
        uint256 round,
        uint256 index
    ) external view returns (uint48);

    /**
     * @notice Whether a participant has exhausted their earnable budget.
     * @dev A flashed account keeps its position but stops minting and drawing until it
     *      tops up again.
     * @param userId The ID of the participant.
     * @return True if the participant is flashed.
     */
    function getIsFlashed(uint48 userId) external view returns (bool);

    /**
     * @notice Direct rewards a participant forfeited in one round.
     * @dev What the earnable budget could not absorb. It stays in the pool.
     * @param round The round to look up.
     * @param userId The ID of the participant.
     * @return The forfeited amount, with 18 decimals.
     */
    function getRoundDirFlash(
        uint256 round,
        uint48 userId
    ) external view returns (uint256);

    /**
     * @notice Binary rewards a participant forfeited in one round.
     * @dev What the earnable budget could not absorb. It stays in the pool.
     * @param round The round to look up.
     * @param userId The ID of the participant.
     * @return The forfeited amount, with 18 decimals.
     */
    function getRoundBinaryFlash(
        uint256 round,
        uint48 userId
    ) external view returns (uint256);

    /**
     * @notice The revenue split that receives the dev share of every entry.
     * @dev Also where an emergency shutdown sends the whole pool.
     * @return The address of the contract provider.
     */
    function getContractProvider() external view returns (address);

    /**
     * @notice USD held back to back pending assurance payouts.
     * @dev Set aside before a round's point value is computed, so it is never paid out
     *      as part of a round.
     * @return The reserved amount, with 18 decimals.
     */
    function assurance() external view returns (uint256);

    /**
     * @notice A participant's assurance standing.
     * @dev Zero if never insured, 1 while still inside the commitment period, and the
     *      current payout value once eligible.
     * @param userId The ID of the participant.
     * @return The status value, with 18 decimals when it is a payout figure.
     */
    function insuranceStatus(uint48 userId) external view returns (uint256);

    /**
     * @notice The lifetime earnable cap a box grants.
     * @dev 10x net value for the $110 box, 7x for the $55 box. 10 still answers, at the
     *      $70 the retired v6 box capped at, because the migration needs that figure.
     * @param entrance The entrance box value (10, 50, or 100).
     * @return The maximum period-earnable amount, with 18 decimals.
     */
    function entranceCap(uint24 entrance) external pure returns (uint256);
}
