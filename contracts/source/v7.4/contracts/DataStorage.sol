// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

/**
 * @title DataStorage
 * @author Obsidian
 * @notice The system's ledger: who is registered, where they sit in the structure, what
 *         they have earned and what they may still earn.
 * @dev An abstract base for {SmartContract}. It holds state and the pure and view helpers
 *      that read it; the functions that move money live on the windows, and the functions
 *      that mutate this state are guarded there.
 *
 *      Storage layout is load-bearing. This contract is inherited first, so its slots are
 *      laid out before {WindowFactory}'s, and a new version that reorders or removes a
 *      declaration here cannot migrate from an older one. Fields are appended, never
 *      rearranged.
 */
abstract contract DataStorage {
    /**
     * @notice Everything about where a participant sits in the structure.
     * @dev Structure to store comprehensive data for each participant in the system.
     * @param leftWorth The total value attributed to the left branch of the participant's associated structure.
     * @param rightWorth The total value attributed to the right branch of the participant's associated structure.
     * @param leftUsers The number of participants in the left branch of the participant's associated structure.
     * @param rightUsers The number of participants in the right branch of the participant's associated structure.
     * @param variance The difference between left and right worth, indicating structural balance.
     * @param depth The depth of the participant in the overall system structure.
     * @param childs The number of direct connections the participant has (0, 1, or 2).
     * @param legSide Indicates if the participant is on the left (-1) or right (1) side of their upline, or 0 if a root participant.
     * @param entrance The initial value associated with the participant's entry in a specific round.
     */
    struct NodeData {
        uint40 leftWorth;
        uint40 rightWorth;
        uint40 leftUsers;
        uint40 rightUsers;
        int40 variance;
        uint16 depth;
        uint8 childs;
        int8 legSide;
        uint24 entrance;
    }

    /**
     * @notice A participant's links to the participants around them.
     * @dev Structure to store relational information for each participant.
     * @param directId The ID of the participant's direct referrer.
     * @param uplineId The ID of the participant's upline (parent) in the structure.
     * @param leftDirectId The ID of the participant directly placed on the left side.
     * @param rightDirectId The ID of the participant directly placed on the right side.
     */
    struct NodeInfo {
        uint48 directId;
        uint48 uplineId;
        uint48 leftDirectId;
        uint48 rightDirectId;
    }

    /**
     * @notice Whether each participant has exhausted their earnable budget.
     * @dev Mapping to track if a participant's period-earnable balance has been reset (reached zero).
     */
    mapping(uint48 userId => bool status) public _userIsFlashed;
    /**
     * @notice What each participant may still earn before they flash.
     * @dev Mapping to store the amount a participant can receive in the current period.
     */
    mapping(uint48 userId => uint256 amount) public _userPeriodEarnable;
    /**
     * @notice Binary team rewards each participant has received in total.
     * @dev Mapping to store the total binary rewards for each participant.
     */
    mapping(uint48 userId => uint256 amount) public _totalBinaryEarned;
    /**
     * @notice Direct referral rewards each participant has received in total.
     * @dev Mapping to store the total direct rewards for each participant.
     */
    mapping(uint48 userId => uint256 amount) public _totalDirEarned;

    /**
     * @notice Renewals each participant has made since they last flashed.
     * @dev Renewals a participant has made since they last flashed. Reset by
     *      {_setFlashed}, so it counts one flash cycle and no more. See {stageParams}.
     */
    mapping(uint48 userId => uint256 counter) public _userTopupsSinceFlash;

    /**
     * @notice Each participant's position in the 4-slot scoring cycle for the top box.
     * @dev Position in the 4-slot scoring cycle for the $110 box. Advanced by every
     *      top-up that lands on that box, the first arrival included, so an upgrade
     *      into $110 consumes slot 0 and the renewal after it starts at slot 1.
     *      Top-ups to the $11 or $55 box never touch it. See {stageParams}.
     */
    mapping(uint48 userId => uint256 counter) public _userRenewalCount;

    /**
     * @notice Structural data for each participant.
     * @dev Mapping to store detailed structural data for each participant.
     */
    mapping(uint48 userId => NodeData data) public _userData;
    /**
     * @notice Relational information for each participant.
     * @dev Mapping to store relational information for each participant.
     */
    mapping(uint48 userId => NodeInfo info) public _userInfo;
    /**
     * @notice The wallet each participant id currently pays out to.
     * @dev Mapping to link participant IDs to their wallet addresses.
     */
    mapping(uint48 userId => address userAddr) public idToAddr;
    /**
     * @notice The participant id each wallet belongs to.
     * @dev Mapping to link participant wallet addresses to their IDs.
     */
    mapping(address userAddr => uint48 userId) public addrToId;
    /**
     * @notice Total points minted in each round.
     * @dev Mapping to store the total points accumulated in a specific round.
     */
    mapping(uint256 theRound => uint256 points) public roundTotalPoints;
    /**
     * @notice USD that entered in each round.
     * @dev Mapping to store the total USD value contributed into a specific round.
     */
    mapping(uint256 theRound => uint256 amount) public roundEnteredUSD;
    /**
     * @notice How many participants the system held as of each round.
     * @dev Mapping to store the count of participants in a specific round.
     */
    mapping(uint256 theRound => uint256 counter) public userCount;
    /**
     * @notice Cumulative USD that had entered as of each round.
     * @dev Mapping to store the cumulative USD value contributed across all rounds.
     */
    mapping(uint256 theRound => uint256 amount) public allEnteredUSD;

    /**
     * @notice The revenue split that receives the dev share of every entry.
     * @dev Also where an emergency shutdown sends the whole pool. Set once at
     *      construction and never moved; there is no setter.
     */
    address internal contractProvider;

    /**
     * @notice The lifetime earnable cap a box grants.
     * @dev Returns the earnable cap for a given entrance box (net USD, 18 decimals).
     *      The $110 box (entrance == 100) caps at 10x its net value; the $55 box at 7x.
     *
     *      10 is no longer a box any account holds — an $11 entry is booked as a $50
     *      box carrying {INSTALLMENT_DEBT}. It still answers for 10, at the $70 the v6
     *      box capped at, because the migration needs that figure to work out how much
     *      a legacy holder had already drawn.
     * @param entrance The entrance box value (50 or 100; 10 for a v6 holder).
     * @return The maximum period-earnable amount for that box.
     */
    function entranceCap(uint24 entrance) public pure returns (uint256) {
        uint256 multiplier = entrance == 100 ? 10 : 7;
        return uint256(entrance) * multiplier * 1e18;
    }

    // ---------------------------------------------------------------------
    // Weekly window
    // ---------------------------------------------------------------------

    /**
     * @notice How many rounds make up a week.
     * @dev Rounds in a week. At 12h a round that is 7 days.
     */
    uint256 public constant WEEK_ROUNDS = 14;
    /**
     * @notice Matched leg worth that earns one weekly point.
     * @dev Matched leg worth that earns one weekly point. Leg worth is carried in units
     *      of `enterUSD / 10`, so 50 units is $500 a side — five $110 boxes.
     */
    uint256 public constant WEEK_MATCH_UNIT = 50;
    /**
     * @notice How many of every {WEEK_CYCLE} weekly points are actually paid.
     * @dev Weekly points credited out of every {WEEK_CYCLE}. The rest stays in the weekly
     *      window and is swept to the round window, lifting the round point value.
     */
    uint256 internal constant WEEK_KEEP = 3;
    uint256 internal constant WEEK_CYCLE = 4;

    /**
     * @notice The most raw weekly points one account may hold in a week, by its box.
     * @dev Raw weekly points one account may earn in one week, by the box it paid for.
     *
     *      Round points are capped per account per round, by {calculateMaxPoints} and
     *      the stage's `pointCeiling`. Weekly points had no ceiling at all, which is the
     *      one place a stuffed tree could still mint without limit. The principle is the
     *      same as everywhere else in v7: what an account can take is bounded by what it
     *      paid. At {WEEK_MATCH_UNIT} — $500 a side — the $110 cap is reached at $2,000
     *      matched per side and the $55 cap at $500.
     */
    uint256 internal constant WEEK_POINT_CAP_TOP = 4;
    uint256 internal constant WEEK_POINT_CAP_BASE = 1;

    /**
     * @notice A participant's position in the weekly race.
     * @dev A participant's position in the weekly race.
     * @param weekId The week the snapshot below belongs to.
     * @param legLeftAtStart Left leg worth when that week opened.
     * @param legRightAtStart Right leg worth when that week opened.
     * @param wPointsTotal Weekly points ever earned. Anchors the 3-of-4 cycle, so it
     *        carries across week boundaries and a participant can lose their fourth
     *        point in a different week from the one that earned it.
     */
    struct WeekState {
        uint16 weekId;
        uint40 legLeftAtStart;
        uint40 legRightAtStart;
        uint32 wPointsTotal;
    }

    /**
     * @notice What a participant earned in one week.
     * @dev What a participant earned in one week.
     * @param raw Points actually matched. Counted in the week's divisor.
     * @param credited Points after the 3-of-4 cut. Only these are paid out.
     */
    struct WeekEarn {
        uint32 raw;
        uint32 credited;
    }

    /**
     * @notice Each participant's weekly snapshot and lifetime weekly point total.
     */
    mapping(uint48 userId => WeekState state) public _userWeek;

    /**
     * @notice What each participant earned in a given week, raw and credited.
     */
    mapping(uint256 week => mapping(uint48 userId => WeekEarn)) public _weekEarn;

    /**
     * @notice Weekly rewards a participant forfeited in a week, for want of budget.
     */
    mapping(uint256 week => mapping(uint48 userId => uint256)) public _weekFlash;

    /**
     * @notice Weekly rewards a participant has actually received, across all weeks.
     */
    mapping(uint48 userId => uint256 amount) public _totalWeekEarned;
    /**
     * @notice Raw weekly points earned in a week.
     * @dev Raw weekly points for a week — the divisor its pool is split by.
     */
    mapping(uint256 week => uint256 points) public weekTotalPoints;
    /**
     * @notice The participants owed a payout from each week's pool, in scoring order.
     */
    mapping(uint256 week => uint48[] userId) internal _weekReceivers;

    /**
     * @notice The week a round belongs to.
     * @dev The week a round belongs to.
     */
    function weekOf(uint256 round) public view returns (uint256) {
        return (round + weekPhase) / WEEK_ROUNDS;
    }

    /**
     * @notice The instant the weekly cadence is aligned to.
     * @dev A Monday at 12:00 UTC
     *
     *      Any Monday noon would do; this is 2024-01-01, chosen because it is recent
     *      enough to read as a date rather than an arbitrary number.
     */
    uint256 internal constant WEEK_ANCHOR = 1704110400;

    /**
     * @notice Rounds of offset between {startTime} and the weekly cadence.
     * @dev The week used to turn over every fourteenth round counted from deployment,
     *      which put the boundary wherever the deploy happened to land. This shifts the
     *      count so it lands on {WEEK_ANCHOR}'s weekday and hour instead, whenever the
     *      contract is deployed.
     *
     *      Rounds are already on the right grid: {startTime} is floored to a 12-hour
     *      boundary, and 12-hour boundaries from the Unix epoch fall at 00:00 and 12:00
     *      UTC, so Monday 12:00 is always the start of some round. Only the phase of the
     *      week needed fixing.
     *
     *      The cost is that week 0 is short — it runs from deployment to the first
     *      Monday rather than a full fourteen rounds — and its pool is correspondingly
     *      smaller. Every week after it is exactly seven days.
     */
    uint256 public immutable weekPhase;

    /**
     * @notice How many participants are owed a payout from a week's pool.
     * @dev Number of participants owed a payout from a week's pool.
     */
    function getWeekReceiversLength(
        uint256 week
    ) external view returns (uint256) {
        return _weekReceivers[week].length;
    }

    /**
     * @notice A participant's standing in a week.
     * @dev A participant's standing in the current week: matched volume so far and the
     *      points it has earned. `matched` is in leg-worth units; multiply by 10 for USD.
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
        )
    {
        WeekState storage s = _userWeek[userId];
        NodeData storage d = _userData[userId];
        // A stale snapshot means the participant has had no activity since the week
        // opened, so nothing of theirs has accrued into it.
        if (s.weekId == week) {
            left = d.leftWorth - s.legLeftAtStart;
            right = d.rightWorth - s.legRightAtStart;
            matched = left < right ? left : right;
        }
        WeekEarn storage e = _weekEarn[week][userId];
        return (left, right, matched, e.raw, e.credited);
    }

    /**
     * @notice Rolls a participant into the current week.
     * @dev Opens a participant's week if the snapshot is stale. Must run before the leg
     *      worth is added to, or the entry that rolled the week would be lost.
     */
    function _rollWeek(uint48 userId, uint16 week) internal {
        WeekState storage s = _userWeek[userId];
        if (s.weekId != week) {
            NodeData storage d = _userData[userId];
            s.weekId = week;
            s.legLeftAtStart = d.leftWorth;
            s.legRightAtStart = d.rightWorth;
        }
    }

    /**
     * @notice Credits any weekly points newly earned by matched volume.
     * @dev Credits any weekly points the participant's matched volume has newly crossed.
     *      Called after the leg worth has been added to.
     */
    function _accrueWeekPoints(uint48 userId) internal {
        // The referral walk reaches id 0 when the root itself tops up. It has no address,
        // so letting it into a receiver list would revert every payout batch for that
        // week and strand the pool. Today its legs can never match, but that is an
        // accident of the root's leg side rather than a guarantee.
        if (userId == 0) return;

        WeekState storage s = _userWeek[userId];
        NodeData storage d = _userData[userId];

        uint256 left = d.leftWorth - s.legLeftAtStart;
        uint256 right = d.rightWorth - s.legRightAtStart;
        uint256 matched = left < right ? left : right;
        uint256 earned = matched / WEEK_MATCH_UNIT;

        // The cap lands on the raw count rather than on the payout, so the points it
        // removes never reach {weekTotalPoints} and the participants who did earn are
        // not diluted by points that were never going to be paid.
        uint256 cap = _weekPointCap(userId);
        if (earned > cap) earned = cap;

        uint256 week = s.weekId;
        WeekEarn storage e = _weekEarn[week][userId];
        uint256 already = e.raw;
        if (earned <= already) return;

        uint256 delta = earned - already;
        if (already == 0) _weekReceivers[week].push(userId);

        // 3 of every 4, anchored on the lifetime total so the cycle spans weeks.
        uint256 restBefore = uint256(s.wPointsTotal) % WEEK_CYCLE;
        uint256 vimed = restBefore + delta;
        uint256 credited = ((vimed / WEEK_CYCLE) *
            WEEK_KEEP +
            (vimed % WEEK_CYCLE)) - restBefore;

        e.raw = uint32(earned);
        e.credited += uint32(credited);
        s.wPointsTotal += uint32(delta);
        weekTotalPoints[week] += delta;
    }

    /**
     * @notice The weekly point cap this account is subject to.
     * @dev Raw weekly points this account may hold for one week.
     *
     *      An account still owing its installment earns none: it has not finished paying
     *      for the box it is sitting in, and the weekly pool is the one route that would
     *      otherwise pay it before the debt is settled.
     * @param userId The participant to bound.
     * @return The account's cap on {WeekEarn.raw} for a week.
     */
    function _weekPointCap(uint48 userId) internal view returns (uint256) {
        if (userDebt[userId] != 0) return 0;
        return
            _userData[userId].entrance == 100
                ? WEEK_POINT_CAP_TOP
                : WEEK_POINT_CAP_BASE;
    }

    /**
     * @notice Draws a weekly bonus against a participant's earnable budget.
     * @dev Pays a weekly bonus against the shared period-earnable budget. Anything the
     *      budget cannot cover is forfeited rather than shared out — it stays in the
     *      weekly window and is swept to the round window when the week completes.
     */
    function _processWeeklyBonus(
        uint48 userId,
        uint256 amountIn,
        uint256 week
    ) internal returns (uint256 amountOut) {
        uint256 earnable = _userPeriodEarnable[userId];

        if (earnable == 0) {
            _weekFlash[week][userId] += amountIn;
            _setFlashed(userId);
            return 0;
        }

        amountOut = (amountIn < earnable) ? amountIn : earnable;

        if (amountIn > earnable) {
            _weekFlash[week][userId] += (amountIn - earnable);
            _setFlashed(userId);
        }

        if (amountOut <= DUST_THRESHOLD) return 0;

        _userPeriodEarnable[userId] -= amountOut;
        _totalWeekEarned[userId] += amountOut;

        return amountOut;
    }

    // ---------------------------------------------------------------------
    // Pool stage controller
    // ---------------------------------------------------------------------

    /**
     * @notice The current pool stage, 1 (healthiest) to 4 (floor).
     * @dev The current pool stage, 1 (healthiest) to 4 (floor). Fixed for the whole
     *      round: it is only ever written at settlement, inside {roundIncrement}.
     */
    uint8 public stage;
    /**
     * @notice Smoothed round points, the denominator reserve coverage is measured against.
     * @dev Smoothed round points, refPoints = (refPoints * 7 + P_r) / 8. Used as the
     *      coverage denominator so a single quiet round cannot buy a stage upgrade.
     */
    uint40 public refPoints;
    /**
     * @notice Consecutive rounds that have cleared the stage upgrade band.
     * @dev Consecutive rounds clearing the upgrade band. Reset on any round that misses it.
     */
    uint8 public goodStreak;
    /**
     * @notice Reserve coverage as measured at the last settlement.
     * @dev Coverage measured at the last settlement, in hundredths of a round.
     *      Exposed so the reserve gauge is visible rather than the stage just changing.
     */
    uint256 public lastCoverage;

    /**
     * @notice Fixed-point scale for coverage, where 100 is one round of runway.
     * @dev Coverage is denominated in rounds of full-price payout; this is the fixed
     *      point scale, so 100 == one round of runway.
     */
    uint256 internal constant COVERAGE_SCALE = 100;
    /**
     * @notice The point value the pool aims to pay.
     * @dev The point value the pool tries to hold, and the anchor coverage is measured against.
     */
    uint256 internal constant POINT_PEG = 3e18;
    /**
     * @notice Renewals of the top box allowed between one flash and the next.
     * @dev Renewals of the $110 box allowed between one flash and the next.
     *
     *      Without a limit a participant sits between $999 and $1,999 forever, topping up
     *      just before the balance empties, and so never forfeits a payout, never pauses
     *      their points, and never stops drawing direct bonuses. Two renewals forces a
     *      flash on the third.
     *
     *      This used to be a per-stage lever, exempt at the floor on the grounds that
     *      stage 4 was temporary and the pool needed the cash more than the discipline.
     *      v7 closed that exemption — with the ladder 4-7x harder the floor is where the
     *      system normally sits, so the exemption would have been permanent — which left
     *      the same value at all four stages. A number that does not vary by stage is a
     *      constant, and reads better as one than as a column that implies it varies.
     *
     *      Must be nonzero. Zero would not lift the limit, it would block every renewal.
     */
    uint8 internal constant TOPUPS_PER_FLASH = 2;

    /**
     * @notice Consecutive good rounds required before the stage improves.
     * @dev Consecutive rounds above the upgrade band required to improve one stage.
     *
     *      Four rounds is two days. Coverage reacts to a deposit the moment it lands,
     *      but {refPoints} smooths over about eight rounds, so a large enough deposit
     *      moves coverage well before it moves the denominator — long enough to buy an
     *      upgrade by parking money for a day at two rounds. Four makes that twice as
     *      expensive to fake, and costs nothing on the way down: worsening is still
     *      immediate and unconfirmed.
     */
    uint8 internal constant CONFIRM_ROUNDS = 4;

    /**
     * @notice Emitted whenever the stage changes at settlement.
     * @param oldStage The stage that just ended.
     * @param newStage The stage that applies from the next round.
     * @param coverage Coverage at settlement, in hundredths of a round.
     */
    event StageChanged(uint8 oldStage, uint8 newStage, uint256 coverage);

    /**
     * @notice The coverage a stage must keep clearing in order to hold.
     * @dev The coverage a stage must keep clearing to hold. Below it, the stage drops
     *      in the same round. Stage 4 is the floor and returns 0, so it always holds.
     * @param s The stage to query.
     * @return Coverage floor in hundredths of a round.
     */
    function stageHold(uint8 s) public pure returns (uint256) {
        if (s == 1) return 4900; // 49 rounds — 24.5 days
        if (s == 2) return 2100; // 21 rounds — 10.5 days
        if (s == 3) return 700; // 7 rounds — 3.5 days
        // Stage 4 is the terminal floor and never falls further. Stage 0 lands here too,
        // matching {stageParams}, so an unset stage reads as the floor from both.
        return 0;
    }

    /**
     * @notice The stage a given coverage implies on its own.
     * @dev The stage a given coverage implies on its own: the least-bad stage whose
     *      hold threshold that coverage still clears. This is the ladder itself, with
     *      no timing rules — {_updateStage} layers the hysteresis on top.
     * @param coverage Coverage in hundredths of a round.
     */
    function stageFor(uint256 coverage) public pure returns (uint8) {
        if (coverage >= stageHold(1)) return 1;
        if (coverage >= stageHold(2)) return 2;
        if (coverage >= stageHold(3)) return 3;
        return 4;
    }

    /**
     * @notice The lever settings in force for the current round.
     * @dev The lever settings in force for the current round. Saves callers reading
     *      {stage} and {stageParams} as two separate calls.
     */
    function currentStageParams()
        external
        view
        returns (uint8 weeklyPct, uint16 pointCeiling, uint8 renewalScoreMask)
    {
        return stageParams(stage);
    }

    /**
     * @notice The lever settings for a given stage.
     * @dev The per-stage lever settings. A `pure` table means retuning needs a redeploy,
     *      which is the same path the version migration already walks, rather than a
     *      privileged setter able to move everyone's payout rate.
     * @param s The stage to query.
     * @return weeklyPct Percent of a top-up's `enterUSD` routed to the weekly window.
     * @return pointCeiling Upper bound applied on top of {calculateMaxPoints}.
     * @return renewalScoreMask Which slots of each 4-renewal cycle mint points, as a bitmask
     *         over `renewalCount % 4`. The mask spreads the scoring slots rather than
     *         front-loading them, so 2-of-4 alternates (yes, no, yes, no).
     */
    function stageParams(
        uint8 s
    )
        public
        pure
        returns (uint8 weeklyPct, uint16 pointCeiling, uint8 renewalScoreMask)
    {
        // renewalScoreMask, bit i set == the renewal at cycle position i scores:
        //   0xF == 1111  every renewal
        //   0x7 == 0111  three of four, matching the pre-stage behaviour
        //   0x5 == 0101  two of four, alternating
        //   0x1 == 0001  one of four
        if (s == 1) return (15, 300, 0xF);
        if (s == 2) return (10, 200, 0x7);
        if (s == 3) return (5, 150, 0x5);
        // s >= 4, and also s == 0. An unset stage must read as the floor, not as the
        // most generous rung: a future version that forgets to seed `stage` should fail
        // conservative rather than hand out stage 1 settings until the first settlement.
        return (0, 100, 0x1);
    }

    /**
     * @notice Marks a participant as flashed.
     * @dev Marks a participant as flashed and opens a fresh top-up cycle for them.
     *      Every path that flashes a user goes through here, so the per-cycle counter
     *      can never drift out of step with the flag it is keyed to.
     * @param userId The participant being flashed.
     */
    function _setFlashed(uint48 userId) internal {
        _userIsFlashed[userId] = true;
        delete _userTopupsSinceFlash[userId];
    }

    /**
     * @notice Whether a renewal at a given cycle position mints points.
     * @dev Whether a renewal at the given cycle position mints points for the uplines.
     * @param s The stage to evaluate under.
     * @param renewalCount The user's renewal count before this renewal.
     */
    function renewalScores(
        uint8 s,
        uint256 renewalCount
    ) public pure returns (bool) {
        (, , uint8 mask) = stageParams(s);
        return (mask >> (renewalCount % 4)) & 1 == 1;
    }

    /**
     * @notice Runs the body only for an address that is registered.
     * @dev Modifier to ensure that a given user address already exists in the system.
     * @param userAddr The address to check.
     */
    modifier checkId(address userAddr) {
        if (userAddrExists(userAddr)) _;
    }

    /**
     * @notice Whether an address is registered as a participant.
     * @dev Checks if a given address is already registered as a participant in the system.
     * @param userAddr The address to check for existence.
     * @return status True if the user address exists, false otherwise.
     */
    function userAddrExists(
        address userAddr
    ) public view returns (bool status) {
        return addrToId[userAddr] != 0;
    }

    /**
     * @notice The two participants placed directly under a given one.
     * @dev Retrieves the addresses of the direct left and right connections for a given participant.
     * @param userAddr The address of the participant.
     * @return left The address of the participant's left direct connection.
     * @return right The address of the participant's right direct connection.
     */
    function userChilds(
        address userAddr
    ) external view checkId(userAddr) returns (address left, address right) {
        uint48 userId = addrToId[userAddr];
        left = idToAddr[_userInfo[userId].leftDirectId];
        right = idToAddr[_userInfo[userId].rightDirectId];
    }

    /**
     * @notice A participant's binary tree as a breadth-first list of addresses.
     * @dev Retrieves a participant's binary tree as a breadth-first list of addresses.
     *      Index 0 is the given participant, and the children of index `n` sit at
     *      indices `2n + 1` and `2n + 2`. Empty slots are returned as the zero address.
     * @param addr The address of the participant at the root of the returned tree.
     * @param len The number of nodes to expand below the root.
     * @return addrList The breadth-first list of addresses making up the tree.
     */
    function getUserTree(
        address addr,
        uint256 len
    ) external view returns (address[] memory addrList) {
        addrList = new address[](len + 1 + (len % 2));
        addrList[0] = addr;
        uint256 i;
        uint256 j;
        while (i < len) {
            // Unregistered slots resolve to id 0, whose children are the zero address.
            uint48 userId = addrToId[addrList[j++]];
            addrList[++i] = idToAddr[_userInfo[userId].leftDirectId];
            addrList[++i] = idToAddr[_userInfo[userId].rightDirectId];
        }
    }

    /**
     * @notice The best placement under a referrer for a new participant.
     * @dev Determines the most suitable participant for new placement based on structural balance.
     * @param direct The address of the starting participant for the search.
     * @return referral The address of the participant recommended for new placement.
     */
    function getBestReferralForPlacement(
        address direct
    ) public view checkId(direct) returns (address referral) {
        uint48 userId = addrToId[direct];
        if (_userData[userId].childs != 2) {
            return direct;
        } else {
            uint48 refId = _userData[userId].variance < 0
                ? _userInfo[userId].rightDirectId
                : _userInfo[userId].leftDirectId;

            while (_userData[refId].childs != 0) {
                refId = _userData[refId].variance <= 0
                    ? _userInfo[refId].leftDirectId
                    : _userInfo[refId].rightDirectId;
            }
            return idToAddr[refId];
        }
    }

    /**
     * @notice The participant a given one is placed under.
     * @dev Retrieves the upline ID for a given participant ID.
     * @param userId The ID of the participant.
     * @return upId The ID of the participant's upline.
     */
    function getUserUplineId(uint48 userId) public view returns (uint256 upId) {
        return _userInfo[userId].uplineId;
    }

    /**
     * @notice Draws a direct referral bonus against a participant's earnable budget.
     * @dev Processes and distributes direct referral rewards to a participant.
     * @param userAddr The address of the participant receiving the reward.
     * @param amountIn The total amount available for direct rewards.
     * @return amountOut The actual amount distributed to the participant after accounting for period limits.
     */
    function _processDirectReferralBonus(
        address userAddr,
        uint256 amountIn
    ) internal returns (uint256 amountOut) {
        uint256 round = roundCounter;
        uint48 userId = addrToId[userAddr];
        uint256 earnable = _userPeriodEarnable[userId];
        _leaveAssurance(userId);

        amountOut = (amountIn < earnable) ? amountIn : earnable;

        if (amountOut != 0) {
            _userPeriodEarnable[userId] -= amountOut;
            _roundDirEarned[round][userId] += amountOut;
            _totalDirEarned[userId] += amountOut;
        }

        if (amountIn > amountOut) {
            _roundDirFlash[round][userId] += (amountIn - amountOut);
        }

        if (earnable == 0 || amountOut == earnable) {
            _setFlashed(userId);
        }

        return amountOut;
    }

    /**
     * @notice Outstanding installment debt, withheld from a participant's payouts.
     * @dev Mapping of outstanding debt a participant must pay off before receiving
     *      binary rewards. Only the binary route is withheld into it until it reaches
     *      zero; direct bonuses are paid to an indebted account in full.
     *
     *      Populated by the $11 installment: an account may enter for $11 and owe the
     *      contract {INSTALLMENT_DEBT}, repaid out of what it would otherwise have been
     *      paid. The one cash route is a $55 top-up, which erases it whole — see
     *      {SmartContract-_payOffInstallment}. Nothing else writes it.
     */
    mapping(uint48 userId => uint256 amount) public userDebt;

    /**
     * @notice What an $11 installment entrant owes.
     * @dev What an $11 installment entrant owes. $11 buys the same split as the old $10
     *      box; the account is recorded as a $50 box entrant carrying the rest as debt.
     */
    uint256 internal constant INSTALLMENT_DEBT = 44e18;

    /**
     * @notice The earnable budget an installment entrant starts with.
     * @dev Earnable granted to an installment entrant at entry: {entranceCap} of the $50
     *      box less the debt, not the full $350.
     *
     *      The netting in {_processBinaryTeamBonus} takes the debt out of an incoming
     *      amount before {_userPeriodEarnable} is touched, so the debt does not consume
     *      the cap on its own. Setting the cap lower at entry is what makes "deduct the
     *      $44 from both the debt and the period earnable" true, and it leaves the
     *      netting untouched. The account earns $350 across its life, $44 is withheld,
     *      and it receives $306.
     */
    uint256 internal constant INSTALLMENT_EARNABLE = 306e18;

    /**
     * @notice The debt level at which the dev's share has been paid in full.
     * @dev The debt level at which the dev's share has been paid in full.
     *
     *      The first $4 cleared by the binary route goes to the dev, so the dev ends up with
     *      $5 from an installment account — the same as a $55 entry. No counter is
     *      needed: the debt starts at {INSTALLMENT_DEBT} and only falls, so "the first
     *      $4" is whatever brings it from $44 down to $40.
     */
    uint256 internal constant DEBT_DEV_PAID_AT = 40e18;

    /**
     * @notice The earnable budget a still-indebted account gets on topping up.
     * @dev Earnable an account still carrying debt is left with after topping up to the
     *      $110 box.
     *
     *      {_upgradeUserLevel} otherwise adds a whole {entranceCap} on top of what is
     *      already there, so an installment account could top up and hold $1,306 of
     *      earnable while still owing $44. This is assigned instead of accumulated.
     */
    uint256 internal constant DEBT_TOPUP_EARNABLE = 1050e18;

    // ---------------------------------------------------------------------
    // Emergency shutdown vote
    // ---------------------------------------------------------------------

    /**
     * @notice Sum of every account's vote weight. The denominator of the shutdown vote.
     * @dev Maintained incrementally by {_syncVoteWeight}, and equal at all times to the
     *      sum of {_voteWeightOf} over every registered account — an invariant the tests
     *      check directly, which is the reason weight is derived from state the contract
     *      already holds rather than accumulated in a per-account counter. An
     *      accumulated total is true by definition, so a call site that forgot to add to
     *      it could never be caught.
     */
    uint256 public totalVoteWeight;

    /**
     * @notice Weight standing behind an emergency shutdown right now.
     */
    uint256 public shutdownWeight;

    /**
     * @notice Weight each voter is counted for, and the record that they voted at all.
     * @dev Nonzero means voted, so one slot does both jobs. It holds the weight as of
     *      the moment they voted, and it is never revised: an account whose weight rises
     *      later keeps counting for what it was worth when it voted, permanently.
     */
    mapping(uint48 userId => uint256 weight) public shutdownVoteWeight;

    /**
     * @notice The share of total weight a shutdown needs, as a percentage.
     * @dev Percent of {totalVoteWeight} that must stand behind a shutdown to trigger it.
     */
    uint256 internal constant SHUTDOWN_PCT = 10;

    /**
     * @notice The vote weight an account still owing its installment carries.
     * @dev What an account still owing its installment is counted for: the $10 net that
     *      actually entered the contract, not the $50 box it is booked as.
     *
     *      This is what makes the vote Sybil-resistant rather than merely weighted.
     *      Counting an unpaid installment as its box would sell 50 units of voting
     *      weight for $11 against $110 for 100 — a five-fold discount, and the cheapest
     *      route to a shutdown by a wide margin. Discounted, weight costs $1.10 a unit
     *      whichever box it is bought through.
     */
    uint256 internal constant INSTALLMENT_VOTE_WEIGHT = 10;

    /**
     * @notice An account's weight in the emergency shutdown vote.
     * @dev An account's vote weight: the box it holds, once it has paid for it.
     *
     *      Not cumulative. A participant who renews the $110 box twenty times still
     *      weighs 100, because the denominator is meant to describe the stake standing
     *      in the system now rather than everything ever spent — a measure that would
     *      inflate with every renewal and make the exit progressively harder to reach.
     * @param userId The account to weigh.
     * @return Its weight, in the same net-USD units as `entrance`.
     */
    function _voteWeightOf(uint48 userId) internal view returns (uint256) {
        if (userDebt[userId] != 0) return INSTALLMENT_VOTE_WEIGHT;
        return _userData[userId].entrance;
    }

    /**
     * @notice Folds a change in one account's weight into the running total.
     * @dev Folds a change in one account's weight into {totalVoteWeight}.
     *
     *      Every path that can move a weight — a new account, a top-up, a debt reaching
     *      zero — reads the old value first and calls this after. Weight only ever
     *      rises: `entrance` cannot fall and `userDebt` cannot grow, so the difference
     *      is never negative and this cannot underflow.
     * @param userId The account whose weight may have moved.
     * @param previous Its weight before the change, or 0 for a new account.
     */
    function _syncVoteWeight(uint48 userId, uint256 previous) internal {
        uint256 current = _voteWeightOf(userId);
        if (current != previous) {
            unchecked {
                totalVoteWeight += current - previous;
            }
        }
    }

    /**
     * @notice Withholds a payout against a participant's installment debt.
     * @dev Withholds `amount` against a participant's debt.
     *
     *      Repayment here is a withholding: the contract simply keeps what it would have
     *      paid out. (Paying the debt off in cash does not come through here.) The caller
     *      is responsible for not paying the `applied` portion onward.
     * @param userId The participant whose debt is being cleared.
     * @param amount The payout being withheld from.
     * @return applied How much of `amount` went to the debt.
     * @return devShare The part of `applied` that belongs to the dev — see
     *         {DEBT_DEV_PAID_AT}. The caller has to route it; it is included in
     *         `applied` and must not be paid to the participant.
     */
    function _clearDebt(
        uint48 userId,
        uint256 amount
    ) internal returns (uint256 applied, uint256 devShare) {
        uint256 debt = userDebt[userId];
        if (debt == 0 || amount == 0) return (0, 0);

        applied = amount < debt ? amount : debt;
        uint256 left = debt - applied;
        userDebt[userId] = left;
        // Clearing the last of it promotes the account from the installment weight to
        // its box. Nothing else here can move a weight, so the sync only matters on the
        // payout that finishes the debt.
        if (left == 0) _syncVoteWeight(userId, INSTALLMENT_VOTE_WEIGHT);

        if (debt > DEBT_DEV_PAID_AT) {
            uint256 stop = left > DEBT_DEV_PAID_AT ? left : DEBT_DEV_PAID_AT;
            devShare = debt - stop;
        }
    }

    /**
     * @notice The payout below which a transfer costs more than it is worth.
     * @dev Binary payouts at or below this amount aren't worth the transfer gas.
     *      {_processBinaryTeamBonus} leaves them undeducted (not credited as earned)
     *      so they aren't silently forfeited from the participant's cap; see
     *      {SmartContractWindow.distributeMatchingBonuses}, which relies on this
     *      function only ever returning 0 or an amount above this threshold.
     */
    uint256 internal constant DUST_THRESHOLD = 1e16;

    /**
     * @notice Draws a binary team bonus against a participant's earnable budget.
     * @dev Processes and distributes binary team rewards to a participant.
     * @param userId The ID of the participant receiving the reward.
     * @param amountIn The total amount available for binary team rewards.
     * @param round The current round number.
     * @return amountOut The actual amount distributed to the participant after accounting for period limits.
     * @return devShare The dev's cut of any debt this payout cleared, for the caller to route.
     */
    function _processBinaryTeamBonus(
        uint48 userId,
        uint256 amountIn,
        uint256 round
    ) internal returns (uint256 amountOut, uint256 devShare) {
        if (amountIn == 0) return (0, 0);

        uint256 applied;
        (applied, devShare) = _clearDebt(userId, amountIn);
        amountIn -= applied;
        if (amountIn == 0) return (0, devShare);

        uint256 earnable = _userPeriodEarnable[userId];

        if (earnable == 0) {
            _roundBinaryFlash[round][userId] += amountIn;
            _setFlashed(userId);
            return (0, devShare);
        }

        amountOut = (amountIn < earnable) ? amountIn : earnable;

        if (amountIn > earnable) {
            _roundBinaryFlash[round][userId] += (amountIn - earnable);
            _setFlashed(userId);
        }

        if (amountOut <= DUST_THRESHOLD) return (0, devShare);

        _userPeriodEarnable[userId] -= amountOut;
        _totalBinaryEarned[userId] += amountOut;
        _roundBinaryEarned[round][userId] += amountOut;

        return (amountOut, devShare);
    }

    /**
     * @notice The most points one account can hold in a round, by its smaller leg.
     * @dev Calculates the maximum points attainable based on the value of the smaller leg in a participant's structure.
     * @param minLeg The value of the smaller leg.
     * @return maxPoint The calculated maximum points.
     */
    function calculateMaxPoints(
        uint256 minLeg
    ) public pure returns (uint256 maxPoint) {
        return
            minLeg < 1000
                ? 50
                : minLeg < 5000
                    ? 100
                    : minLeg < 10000
                        ? 150
                        : minLeg < 15000
                            ? 200
                            : 300;
    }

    /**
     * @notice Points each participant minted in each round.
     * @dev Mapping to store points accumulated by each participant in a specific round.
     */
    mapping(uint256 theRound => mapping(uint48 userId => uint40 counter))
        internal _roundPoints;
    /**
     * @notice Direct rewards each participant received in each round.
     * @dev Mapping to store direct rewards earned by each participant in a specific round.
     */
    mapping(uint256 theRound => mapping(uint48 userId => uint256 amount))
        internal _roundDirEarned;
    /**
     * @notice Direct rewards each participant forfeited in each round.
     * @dev Mapping to store any direct reward amounts that exceeded the participant's period-earnable limit for a specific round.
     */
    mapping(uint256 theRound => mapping(uint48 userId => uint256 amount))
        internal _roundDirFlash;
    /**
     * @notice Binary team rewards each participant received in each round.
     * @dev Mapping to store binary team rewards earned by each participant in a specific round.
     */
    mapping(uint256 theRound => mapping(uint48 userId => uint256 amount))
        internal _roundBinaryEarned;
    /**
     * @notice Binary team rewards each participant forfeited in each round.
     * @dev Mapping to store any binary team reward amounts that exceeded the participant's period-earnable limit for a specific round.
     */
    mapping(uint256 theRound => mapping(uint48 userId => uint256 amount))
        internal _roundBinaryFlash;
    /**
     * @notice The participants owed a payout from each round's pool, in scoring order.
     * @dev Array to store IDs of participants eligible for binary rewards in a specific round.
     */
    mapping(uint256 theRound => uint48[] userId) public _binaryReceivers;

    /**
     * @notice The round the ledger is currently accounting to.
     * @dev Counter for the current operational round of the system.
     */
    uint256 public roundCounter;
    /**
     * @notice The timestamp the system started at, floored to a 12-hour boundary.
     * @dev The timestamp when the system started its operation, set upon deployment.
     */
    uint256 public immutable startTime;
    /**
     * @notice How long one round lasts.
     * @dev Constant representing half a day in seconds, used for round duration calculations.
     */
    uint256 internal constant HALF_DAY = 12 hours;

    /**
     * @notice The round the clock says it is.
     * @dev Calculates the current real-time round based on the contract's start time and half-day periods.
     * @return The current real-time round number.
     */
    function realRound() public view returns (uint256) {
        return (block.timestamp - startTime) / HALF_DAY;
    }

    /**
     * @notice The addresses owed a payout from a past round's pool.
     * @dev Retrieves a list of addresses of participants who were binary reward receivers for a specified number of rounds ago.
     * @param roundsAgo The number of rounds in the past to look up (0 for current round, 1 for previous, etc.).
     * @return addr An array of addresses of the binary reward receivers.
     */
    function binaryReceivers(
        uint256 roundsAgo
    ) public view returns (address[] memory addr) {
        uint256 round = roundCounter - roundsAgo;
        uint256 len = _binaryReceivers[round].length;
        addr = new address[](len);
        uint48[] storage _dR = _binaryReceivers[round];

        unchecked {
            for (uint256 i; i < len; ++i) {
                addr[i] = idToAddr[_dR[i]];
            }
        }
    }

    /**
     * @notice How many participants the system held as of a given round.
     * @dev Retrieves the count of participants for a given round.
     * @param round The round number.
     * @return The number of participants in the specified round.
     */
    function getUserCount(uint256 round) external view returns (uint256) {
        return userCount[round];
    }
    /**
     * @notice USD that entered in one round.
     * @dev Retrieves the total USD value contributed in a specific round.
     * @param round The round number.
     * @return The total USD value contributed in the specified round.
     */
    function getRoundEnteredUSD(uint256 round) external view returns (uint256) {
        return roundEnteredUSD[round];
    }
    /**
     * @notice USD that has entered across the system's whole life.
     * @dev Retrieves the cumulative USD value contributed across all rounds up to a specific round.
     * @param round The round number.
     * @return The cumulative USD value contributed.
     */
    function getAllEnteredUSD(uint256 round) external view returns (uint256) {
        return allEnteredUSD[round];
    }
    /**
     * @notice Total points minted in one round.
     * @dev Retrieves the total points accumulated in a specific round.
     * @param round The round number.
     * @return The total points for the specified round.
     */
    function getRoundTotalPoints(
        uint256 round
    ) external view returns (uint256) {
        return roundTotalPoints[round];
    }

    /**
     * @notice A participant's structural data.
     * @dev Retrieves the detailed structural data for a specific participant.
     * @param userId The ID of the participant.
     * @return leftWorth The total value attributed to the left branch.
     * @return rightWorth The total value attributed to the right branch.
     * @return leftUsers The number of participants in the left branch.
     * @return rightUsers The number of participants in the right branch.
     * @return variance The structural balance variance.
     * @return depth The depth of the participant.
     * @return childs The number of direct connections.
     * @return legSide The side of the upline the participant is on.
     * @return entrance The initial entry value.
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
        )
    {
        NodeData memory data = _userData[userId];
        return (
            data.leftWorth,
            data.rightWorth,
            data.leftUsers,
            data.rightUsers,
            data.variance,
            data.depth,
            data.childs,
            data.legSide,
            data.entrance
        );
    }

    /**
     * @notice A participant's links to the participants around them.
     * @dev Retrieves the relational information for a specific participant.
     * @param userId The ID of the participant.
     * @return directId The ID of the participant's direct referrer.
     * @return uplineId The ID of the participant's upline (parent).
     * @return leftDirectId The ID of the participant directly placed on the left side.
     * @return rightDirectId The ID of the participant directly placed on the right side.
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
        )
    {
        NodeInfo memory info = _userInfo[userId];
        return (
            info.directId,
            info.uplineId,
            info.leftDirectId,
            info.rightDirectId
        );
    }

    /**
     * @notice What a participant may still earn before they flash.
     * @dev Retrieves the period-earnable amount for a specific participant.
     * @param userId The ID of the participant.
     * @return The amount the participant can earn in the current period.
     */
    function getUserPeriodEarnable(
        uint48 userId
    ) external view returns (uint256) {
        return _userPeriodEarnable[userId];
    }

    /**
     * @notice Points a participant minted in one round.
     * @dev Retrieves the points accumulated by a participant in a specific round.
     * @param round The round number.
     * @param userId The ID of the participant.
     * @return The points for the specified participant and round.
     */
    function getRoundPoints(
        uint256 round,
        uint48 userId
    ) external view returns (uint40) {
        return _roundPoints[round][userId];
    }

    /**
     * @notice Direct referral rewards a participant received in one round.
     * @dev Retrieves the direct rewards earned by a participant in a specific round.
     * @param round The round number.
     * @param userId The ID of the participant.
     * @return The direct rewards for the specified participant and round.
     */
    function getRoundDirEarned(
        uint256 round,
        uint48 userId
    ) external view returns (uint256) {
        return _roundDirEarned[round][userId];
    }

    /**
     * @notice Binary team rewards a participant received in one round.
     * @dev Retrieves the binary team rewards earned by a participant in a specific round.
     * @param round The round number.
     * @param userId The ID of the participant.
     * @return The binary team rewards for the specified participant and round.
     */
    function getRoundBinaryEarned(
        uint256 round,
        uint48 userId
    ) external view returns (uint256) {
        return _roundBinaryEarned[round][userId];
    }

    /**
     * @notice Direct referral rewards a participant has received in total.
     * @dev Retrieves the total direct rewards earned by a specific participant across all rounds.
     * @param userId The ID of the participant.
     * @return The total direct rewards earned.
     */
    function getTotalDirEarned(uint48 userId) external view returns (uint256) {
        return _totalDirEarned[userId];
    }

    /**
     * @notice Binary team rewards a participant has received in total.
     * @dev Retrieves the total binary team rewards earned by a specific participant across all rounds.
     * @param userId The ID of the participant.
     * @return The total binary team rewards earned.
     */
    function getTotalBinaryEarned(
        uint48 userId
    ) external view returns (uint256) {
        return _totalBinaryEarned[userId];
    }

    /**
     * @notice The revenue split that receives the dev share of every entry.
     * @dev Retrieves the address of the contract provider.
     * @return The address of the contract provider.
     */
    function getContractProvider() external view returns (address) {
        return contractProvider;
    }

    /**
     * @notice How many participants are owed a payout from a round's pool.
     * @dev Retrieves the number of binary receivers for a specific round.
     * @param round The round number.
     * @return The length of the binary receivers array for the specified round.
     */
    function getBinaryReceiversLength(
        uint256 round
    ) external view returns (uint256) {
        return _binaryReceivers[round].length;
    }

    /**
     * @notice One entry of a round's payout list.
     * @dev Retrieves a specific binary receiver by round and index.
     * @param round The round number.
     * @param index The index of the binary receiver in the array.
     * @return The ID of the binary receiver.
     */
    function getBinaryReceiver(
        uint256 round,
        uint256 index
    ) external view returns (uint48) {
        return _binaryReceivers[round][index];
    }

    /**
     * @notice Whether a participant has exhausted their earnable budget.
     * @dev Checks if a participant's period-earnable balance has been reset.
     * @param userId The ID of the participant.
     * @return True if the user is flashed, false otherwise.
     */
    function getIsFlashed(uint48 userId) external view returns (bool) {
        return _userIsFlashed[userId];
    }

    /**
     * @notice Direct rewards a participant forfeited in one round.
     * @dev Retrieves the direct reward flash amount for a participant in a specific round.
     * @param round The round number.
     * @param userId The ID of the participant.
     * @return The direct reward flash amount.
     */
    function getRoundDirFlash(
        uint256 round,
        uint48 userId
    ) external view returns (uint256) {
        return _roundDirFlash[round][userId];
    }

    /**
     * @notice Binary rewards a participant forfeited in one round.
     * @dev Retrieves the binary team reward flash amount for a participant in a specific round.
     * @param round The round number.
     * @param userId The ID of the participant.
     * @return The binary team reward flash amount.
     */
    function getRoundBinaryFlash(
        uint256 round,
        uint48 userId
    ) external view returns (uint256) {
        return _roundBinaryFlash[round][userId];
    }

    /**
     * @notice USD held back to back pending assurance payouts.
     * @dev Total USD reserved to back pending assurance payouts (see {_joinAssurance}).
     *      Carried over between rounds via {SmartContract.roundIncrement}.
     */
    uint256 public assurance;
    /**
     * @notice The participants currently covered by the assurance safety net.
     * @dev IDs of participants currently covered by the assurance safety net, i.e.
     *      $110-box entrants who haven't started earning yet (see {_leaveAssurance}).
     */
    uint48[] public insuredAccounts;
    /**
     * @notice Where each insured participant sits in {insuredAccounts}.
     * @dev 1-based index of a participant within {insuredAccounts}; 0 means not insured.
     */
    mapping(uint48 userId => uint256 insureIndex) public userInsureIndex;
    /**
     * @notice The month each participant joined the assurance list.
     * @dev The month (see {currentMonth}) a participant joined the assurance list,
     *      used to enforce the minimum commitment period before {_payAssurance}.
     */
    mapping(uint48 userId => uint256 insureMonth) public userInsureMonth;
    /**
     * @notice Thrown when an account that is not insured tries to claim assurance.
     */
    error NotInAssuranceList();

    /**
     * @notice Thrown when an insured account claims before its commitment period is up.
     */
    error UnderCommitmentTime();

    /**
     * @notice How many participants are currently covered by assurance.
     * @dev Number of participants currently covered by assurance.
     */
    function insuredAccountsCount() public view returns (uint256) {
        return insuredAccounts.length;
    }

    /**
     * @notice The current 30-day epoch.
     * @dev The current 30-day epoch, used to measure assurance commitment time.
     */
    function currentMonth() public view returns (uint256) {
        return block.timestamp / 30 days;
    }

    /**
     * @notice What an insured participant would currently be paid.
     * @dev The USD payout an insured participant would currently receive: the
     *      assurance pool split evenly among all insured accounts, capped at $85.
     */
    function currentAssuranceValue() public view returns (uint256 value) {
        uint256 denom = insuredAccounts.length;
        if (denom == 0) denom = 1;

        value = assurance / denom;
        if (value > 85e18) value = 85e18;
    }

    /**
     * @notice Pays a participant their assurance and removes them from the list.
     * @dev Pays out and removes a participant from the assurance list. Reverts if the
     *      participant isn't insured, or hasn't held their spot for the required
     *      4-month commitment period.
     */
    function _payAssurance(uint48 userId) internal returns (uint256 payout) {
        if (userInsureIndex[userId] == 0) revert NotInAssuranceList();

        if ((currentMonth() - userInsureMonth[userId]) < 4)
            revert UnderCommitmentTime();

        payout = currentAssuranceValue();
        _leaveAssurance(userId);
        assurance -= payout;
    }

    /**
     * @notice Enrolls a participant in the assurance safety net.
     * @dev Enrolls a participant in the assurance safety net and funds the pool by
     *      `insuredAmount`. No-op if already enrolled. Only called for $110-box entries
     *      (see {SmartContract.join}), since that's the only tier that funds assurance.
     */
    function _joinAssurance(uint48 userId, uint256 insuredAmount) internal {
        if (userInsureIndex[userId] != 0) return;

        assurance += insuredAmount;

        insuredAccounts.push(userId);
        userInsureIndex[userId] = insuredAccounts.length;
        userInsureMonth[userId] = currentMonth();
    }

    /**
     * @notice Removes a participant from the assurance list without paying out.
     * @dev Removes a participant from the assurance list without paying out, e.g. once
     *      they start earning normally and no longer need the safety net. Swaps the
     *      removed slot with the last entry to keep {insuredAccounts} packed.
     */
    function _leaveAssurance(uint48 userId) internal {
        uint256 index = userInsureIndex[userId];
        if (index == 0) return;

        uint256 valueIndex = index - 1;
        uint256 lastIndex = insuredAccounts.length - 1;

        if (valueIndex != lastIndex) {
            uint48 lastUserId = insuredAccounts[lastIndex];
            insuredAccounts[valueIndex] = lastUserId;
            userInsureIndex[lastUserId] = valueIndex + 1;
        }

        insuredAccounts.pop();
        delete userInsureIndex[userId];
    }

    /**
     * @notice A participant's assurance standing.
     * @dev Reports a participant's assurance state: 0 if never insured, 1 if still
     *      within the commitment period, or the current payout value once eligible.
     */
    function insuranceStatus(
        uint48 userId
    ) public view returns (uint256 amount) {
        if (userInsureIndex[userId] == 0) return 0;

        return
            (currentMonth() - userInsureMonth[userId]) < 4
                ? 1
                : currentAssuranceValue();
    }
}
