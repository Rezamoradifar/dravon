// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import "./DataStorage.sol";
import "./WindowFactory.sol";

/**
 * @title SmartContract
 * @author Obsidian
 * @notice The system's ledger and window factory. It records who is registered, mints and
 *         settles points, and opens a new window every round.
 * @dev Holds no funds. Every USDT balance in the system sits on a window, and every
 *      function here that moves the ledger is callable only by a window this contract
 *      created — see {WindowFactory-onlyLatestWindow} and
 *      {WindowFactory-onlyVerifiedWindow}. There is no owner, no pause, and no privileged
 *      setter: the stage levers are a pure table, and retuning them means deploying a new
 *      version and migrating to it.
 */
contract SmartContract is DataStorage, WindowFactory {
    /**
     * @notice Thrown when the joining address is already registered.
     * @dev Throws if the address is already registered.
     */
    error AddressAlreadyRegistered();
    /**
     * @notice Thrown when the placement address is not registered.
     * @dev Throws if the referral address does not exist.
     */
    error ReferralDoesNotExist();
    /**
     * @notice Thrown when the direct referrer is not registered.
     * @dev Throws if the direct referrer address does not exist.
     */
    error DirectDoesNotExist();
    /**
     * @notice Thrown when the placement already has both of its slots filled.
     * @dev Throws if the direct referrer has already reached their maximum number of connections.
     */
    error DirectsFull();
    /**
     * @notice Thrown when the address given is not registered.
     * @dev Throws if the participant is not registered.
     */
    error UserNotRegistered();
    /**
     * @notice Thrown when an account already holds the most earnable a box allows.
     * @dev Throws if the maximum allowable limit is reached.
     */
    error MaxReached();
    /**
     * @notice Thrown when the wallet being moved to is already registered.
     * @dev Throws if the new address provided for a wallet change is already registered.
     */
    error NewAddressRegistered();
    /**
     * @notice Thrown when a wallet change names the wallet it is already on.
     * @dev Throws if the old and new addresses provided for a wallet change are the same.
     */
    error SameAddress();
    /**
     * @notice Thrown when a top-up does not raise the account's box.
     * @dev Throws if a top-up targets the same or a lesser box than the user's current one
     *      (the $110 box is the only one allowed to renew itself).
     */
    error InvalidTopupTarget();
    /**
     * @notice Thrown when an account must flash before it may renew again.
     * @dev Throws when a participant has used every renewal this stage allows between
     *      flashes, and must earn their balance down to zero before topping up again.
     */
    error FlashRequired();
    /**
     * @notice Thrown when the predecessor still has a round in flight.
     * @dev Throws if the predecessor holds points that have not been paid out.
     */
    error PredecessorHasUnsettledEarnings();
    /**
     * @notice Deploys the ledger, carries state over from the predecessor, and opens
     *         the first round and week.
     * @dev Initializes the SmartContract contract.
     * @param previousVersion The version to migrate participants from.
     * @param _contractProvider The address of the contract provider, which manages system administration.
     * @param windowImpl The already-deployed round-window implementation to clone from.
     * @param weeklyImpl The already-deployed weekly-window implementation to clone from.
     * @dev The two implementations are deployed separately and passed in — see
     *      {WindowFactory-constructor} for why they are no longer built here.
     */
    constructor(
        address previousVersion,
        address _contractProvider,
        address windowImpl,
        address weeklyImpl
    ) payable WindowFactory(windowImpl, weeklyImpl) {
        if (_contractProvider == address(0)) revert InvalidAddress();
        startTime = (block.timestamp / HALF_DAY) * HALF_DAY;
        // Reverts on a chain whose clock is before the anchor, which is the right
        // outcome: the cadence would be meaningless and the deploy should not proceed.
        weekPhase = ((startTime - WEEK_ANCHOR) / HALF_DAY) % WEEK_ROUNDS;
        contractProvider = payable(_contractProvider);
        old = SmartContract(previousVersion);
        uint256 oldRound = old.roundCounter();
        allEnteredUSD[0] = old.getAllEnteredUSD(oldRound);
        assurance = old.assurance();

        _requirePredecessorSettled(oldRound);
        // Before the windows exist: each one snapshots the stage at creation, so the
        // stage has to be settled first or the first window would record a zero.
        _carryControllerState();

        createWindow(0, stage);
        createWeeklyWindow(0);
    }

    /**
     * @notice Refuses a predecessor with a round still in flight.
     * @dev Refuses a predecessor that still holds round or week state this migration does
     *      not carry.
     *
     *      {init} copies participants. It does not copy a round in progress — the points
     *      minted into it, its binary receiver list, or a week's accrued points and
     *      earners. Those live in per-round and per-week structures, including arrays,
     *      and reproducing them is not something a migration should attempt. Nor does it
     *      move the USDT sitting in the predecessor's windows.
     *
     *      So the requirement is that nothing is in flight — not that the predecessor
     *      has never run. It used to demand round 0, which was true of every previous
     *      migration only because each happened within hours of the deploy before it,
     *      and which no live system can ever satisfy again. Worse, it then read the
     *      points at index 0: three weeks into a running contract that is an empty slot
     *      from the past, so the check passed on exactly the state it existed to catch.
     *
     *      The index is the predecessor's own current one now, and the seam that
     *      satisfies it recurs every settlement: a round that has just closed has no
     *      points on the one that replaced it, so a predecessor caught there can be
     *      migrated from without a round's payouts going missing.
     *
     *      Two things it deliberately does not police, both because refusing on them
     *      would be worse than proceeding:
     *
     *      The week in progress. Its accrued points are genuinely not carried, but
     *      requiring an empty week would narrow the seam from twice a day to once a
     *      week — and a predecessor that has to be left running for another six days is
     *      a predecessor that can be shut down underneath the migration first, which is
     *      unrecoverable. A shut-down window can never settle another round, so its
     *      in-flight points stay above zero forever and this check would then refuse
     *      that predecessor for good. Losing a week's accrual is recoverable: it is
     *      readable off the predecessor before it closes, and its pool reaches the
     *      provider either way, so those earners can be paid by hand.
     *
     *      The week that just ended, for the same reason and one more: a shutdown marks
     *      a weekly window finished whether it was distributed or drained, so no on-chain
     *      check can tell the two apart.
     *
     *      Both are reported by scripts/deploy/v7.js before the deploy, where the
     *      operator can see what is being given up and decide.
     * @param oldRound The predecessor's current round.
     */
    function _requirePredecessorSettled(uint256 oldRound) internal view {
        if (old.roundTotalPoints(oldRound) != 0) {
            revert PredecessorHasUnsettledEarnings();
        }
    }

    /**
     * @notice Carries the stage controller across from the predecessor.
     * @dev Carries the stage controller across.
     *
     *      Deriving it instead would be wrong here. The previous version averaged the
     *      predecessor's recent rounds to seed the smoother, which works when migrating
     *      from a system that has been running — but a predecessor that has itself only
     *      just been migrated has no rounds to average, and the seed would come out at
     *      zero. A zero smoother makes the first settlements read coverage as many times
     *      its true value, and the controller would climb on a figure that was never
     *      real. The predecessor already holds a correct value; take it.
     */
    function _carryControllerState() internal {
        uint8 carriedStage = old.stage();
        // A predecessor that never set a stage reads as 0. Treat that as the floor,
        // matching {stageParams}, rather than as the most generous rung.
        stage = carriedStage == 0 ? 4 : carriedStage;
        refPoints = old.refPoints();
        goodStreak = old.goodStreak();
        lastCoverage = old.lastCoverage();
    }

    /**
     * @notice The version this deployment migrates its participants from.
     * @dev Read only during {init}; once migration finishes nothing touches it again.
     */
    SmartContract internal old;

    /**
     * @notice True once every participant has been carried over from {old}.
     */
    bool internal initiated;

    /**
     * @notice Thrown when {init} is called after the migration has already finished.
     */
    error AlreadyInitiated();

    /**
     * @notice Refuses further migration batches once the migration is complete.
     * @dev The guard is completion, not caller. {init} only ever copies the predecessor's
     *      own records across, so it has nothing to gain an attacker and running it is a
     *      service to the system rather than a privilege over it — which is why the
     *      migration is left permissionless and simply cannot be run twice.
     */
    modifier whileMigrating() {
        if (initiated) revert AlreadyInitiated();
        _;
    }

    /**
     * @notice Copies a batch of participants across from the predecessor version.
     * @dev Deliberately permissionless and batched: the whole set does not fit in one
     *      block's gas, and stopping halfway must be safe to resume. Each batch starts
     *      from {userCount} and stops at `num` accounts later, so calling it repeatedly
     *      walks the list without an index to keep.
     * @param num How many participants to carry over in this batch.
     */
    function init(uint256 num) external whileMigrating {
        uint256 oldRound = old.roundCounter();
        uint256 totalUsers = old.getUserCount(oldRound);
        uint256 start = userCount[0];
        num = start + num > totalUsers ? totalUsers - start : num;
        uint256 end = start + num;

        userCount[0] += num;
        if (end == totalUsers) initiated = true;

        for (uint48 userId = uint48(start + 1); userId <= uint48(end); ) {
            address userAddr = old.idToAddr(userId);
            if (userAddr == address(0)) {
                unchecked {
                    ++userId;
                }
                continue;
            }
            idToAddr[userId] = userAddr;
            addrToId[userAddr] = userId;
            (
                uint40 leftWorth,
                uint40 rightWorth,
                uint40 leftUsers,
                uint40 rightUsers,
                int40 variance,
                uint16 depth,
                uint8 childs,
                int8 legSide,
                uint24 entrance
            ) = old.getUserData(userId);

            _userData[userId] = NodeData(
                leftWorth,
                rightWorth,
                leftUsers,
                rightUsers,
                variance,
                depth,
                childs,
                legSide,
                entrance
            );
            (
                uint48 directId,
                uint48 uplineId,
                uint48 leftDirectId,
                uint48 rightDirectId
            ) = old.getUserInfo(userId);
            _userInfo[userId] = NodeInfo(
                directId,
                uplineId,
                leftDirectId,
                rightDirectId
            );

            // Copied rather than re-derived. Re-anchoring to the legs they arrive with
            // is what a migration from a pre-weekly version has to do, but here the
            // predecessor already holds a correct snapshot — and re-anchoring would
            // silently discard any matched volume already standing to their name.
            (
                uint16 weekId,
                uint40 legLeftAtStart,
                uint40 legRightAtStart,
                uint32 wPointsTotal
            ) = old._userWeek(userId);
            _userWeek[userId] = WeekState(
                weekId,
                legLeftAtStart,
                legRightAtStart,
                wPointsTotal
            );

            _userPeriodEarnable[userId] = old.getUserPeriodEarnable(userId);
            // Carried so an exhausted participant does not arrive looking live: an
            // unflashed user with nothing left to earn still mints points, inflating the
            // round total that coverage is measured against, only to forfeit at payout.
            _userIsFlashed[userId] = old._userIsFlashed(userId);
            _totalBinaryEarned[userId] = old.getTotalBinaryEarned(userId);
            _totalDirEarned[userId] = old.getTotalDirEarned(userId);
            // Carried as they stand. Where a participant sits in the scoring cycle, and
            // how many renewals they have had since flashing, are real state that
            // resetting or re-deriving would move.
            _userRenewalCount[userId] = old._userRenewalCount(userId);
            _userTopupsSinceFlash[userId] = old._userTopupsSinceFlash(userId);
            _totalWeekEarned[userId] = old._totalWeekEarned(userId);
            userDebt[userId] = old.userDebt(userId);

            // The $10 box does not exist in v7. Its holders are folded into a $50 box
            // owing {INSTALLMENT_DEBT}, which is the shape an $11 entry produces today.
            //
            // The cap is not handed back whole. A v6 $10 holder had entranceCap(10) =
            // $70 to draw on, so what it has already taken is that less what is left,
            // and its v7 ceiling is {INSTALLMENT_EARNABLE} less the same amount — an
            // account that drew nothing arrives at $306, one that drew all $70 at $236.
            // Anything else would pay a drained account a second time for one entry.
            //
            // The clamp holds the arithmetic to its premise: a $10 holder cannot have
            // more than $70 left. Every real predecessor satisfies that, which is
            // exactly why it is cheap to stop trusting it here.
            //
            // A reshaped account always has a live cap, so it cannot arrive flashed —
            // the flag has to agree with the balance it is describing.
            if (entrance == 10) {
                _userData[userId].entrance = 50;
                userDebt[userId] = INSTALLMENT_DEBT;

                uint256 reshaped = INSTALLMENT_EARNABLE -
                    entranceCap(10) +
                    _userPeriodEarnable[userId];
                _userPeriodEarnable[userId] = reshaped > INSTALLMENT_EARNABLE
                    ? INSTALLMENT_EARNABLE
                    : reshaped;
                _userIsFlashed[userId] = false;
            }

            // Seeded from the account as it arrives, which is the whole reason this is
            // not optional: {allEnteredUSD} carries the predecessor's lifetime total
            // across, so a denominator taken from it would open v7 with every account
            // weighing nothing against it — a shutdown arithmetically impossible from
            // day one, and an emergency exit gone without anyone noticing.
            _syncVoteWeight(userId, 0);

            uint256 insureMonth = old.userInsureMonth(userId);
            if (insureMonth != 0) {
                userInsureMonth[userId] = insureMonth;
                insuredAccounts.push(userId);
                userInsureIndex[userId] = insuredAccounts.length;
            }

            unchecked {
                ++userId;
            }
        }
    }

    /**
     * @notice Registers a new participant and places them in the structure.
     * @dev Allows a new participant to join the SmartContract system, establishing their position within the structure.
     * @param userAddr The address of the participant joining.
     * @param direct The address of the participant who directly referred `userAddr`.
     * @param referral The address of the participant under whom `userAddr` will be placed in the structure.
     * @param entrance The box paid for: 10 is the $11 installment, which is recorded as
     *        a $50 box carrying {INSTALLMENT_DEBT}. 50 and 100 are the real boxes.
     * @param enterUSD The USD value associated with this entry.
     * @return directShare The share allocated to the direct referrer.
     */
    function join(
        address userAddr,
        address direct,
        address referral,
        uint24 entrance,
        uint256 enterUSD
    ) external onlyLatestWindow returns (uint256 directShare) {
        uint48 refId = addrToId[referral];
        uint48 dirId = addrToId[direct];

        _checkRegisteration(userAddr, dirId, refId);
        _placeNewUser(userAddr, dirId, refId, entrance, enterUSD);

        roundEnteredUSD[roundCounter] += enterUSD;
        allEnteredUSD[roundCounter] += enterUSD;

        // Flat 15%, at every stage. The other half of the old 30% direct share now goes
        // to the weekly window, transferred by the window itself in `begin()`.
        return _settleDirect(direct, dirId, (enterUSD * 15) / 100);
    }

    /**
     * @notice Creates a participant and credits their entry up the tree.
     * @dev Creates the participant, links them into the tree and credits their leg
     *      units upward. Split out of {join} to keep that function's stack shallow.
     * @param userAddr The address of the participant joining.
     * @param dirId The ID of the direct referrer.
     * @param refId The ID of the participant they are placed under.
     * @param entrance The box paid for, where 10 is the $11 installment.
     * @param enterUSD The USD value of the entry.
     */
    function _placeNewUser(
        address userAddr,
        uint48 dirId,
        uint48 refId,
        uint24 entrance,
        uint256 enterUSD
    ) internal {
        // The $10 box is gone. What the window still calls box 10 is the installment:
        // the same $11 and the same split at entry, but the account is a $50 box entrant
        // from the first block, owing the other $44 out of its own future payouts.
        bool installment = entrance == 10;

        uint48 userId = _createNewUser(
            userAddr,
            dirId,
            refId,
            installment ? 50 : entrance,
            installment
        );
        _setChildren(userId, refId);

        // Leg units come from what was actually paid, not from the box recorded against
        // the account: 1 / 5 / 10 for $10 / $50 / $100. Deriving them from `entrance`
        // would credit an installment entrant the full 5 units of the box it is booked
        // as, which is the whole point of the $11 tier being worth one.
        _updateReferralStructure(
            userId,
            refId,
            uint40(enterUSD / 1e19),
            true,
            (1 << 9)
        );
        if (entrance == 100) _joinAssurance(userId, 5e18);
    }

    /**
     * @notice Routes a direct referral bonus.
     * @dev Routes a direct referral bonus against the referrer's earnable budget.
     *
     *      The installment debt is not withheld here: a direct still owing its $44 is
     *      paid its direct bonus in cash like anyone else. Only the binary route repays
     *      the debt — see {_processBinaryTeamBonus}.
     * @param direct The referrer's address.
     * @param dirId The referrer's ID.
     * @param bonus The bonus owed to the referrer.
     * @return directShare What the window should transfer to the referrer.
     */
    function _settleDirect(
        address direct,
        uint48 dirId,
        uint256 bonus
    ) internal returns (uint256 directShare) {
        if (!_userIsFlashed[dirId])
            directShare = _processDirectReferralBonus(direct, bonus);
    }

    /**
     * @notice Refuses a registration that the structure cannot accept.
     * @dev Internal function to perform checks before registering a new participant.
     * @param userAddr The address of the participant to be registered.
     * @param dirId The ID of the direct referrer.
     * @param refId The ID of the referral participant.
     */
    function _checkRegisteration(
        address userAddr,
        uint48 dirId,
        uint48 refId
    ) internal view {
        if (userAddrExists(userAddr)) revert AddressAlreadyRegistered();
        if (refId == 0) revert ReferralDoesNotExist();
        if (dirId == 0) revert DirectDoesNotExist();
        if (_userData[refId].childs >= 2) revert DirectsFull();
    }

    /**
     * @notice Assigns an id to a new participant and records their opening state.
     * @dev Internal function to create a new participant in the system.
     * @param userAddr The address of the new participant.
     * @param dirId The ID of the direct referrer.
     * @param upId The ID of the upline participant.
     * @param entrance The box recorded against the participant.
     * @param installment Whether this is an $11 entry, which is booked as a $50 box
     *        carrying {INSTALLMENT_DEBT} and a correspondingly lower cap.
     * @return userId The ID assigned to the newly created participant.
     */
    function _createNewUser(
        address userAddr,
        uint48 dirId,
        uint48 upId,
        uint24 entrance,
        bool installment
    ) internal returns (uint48 userId) {
        uint256 round = roundCounter;
        unchecked {
            userId = uint48(++userCount[round]);
        }
        bool legSide;
        unchecked {
            legSide = _userData[upId].childs++ == 0;
        }
        idToAddr[userId] = userAddr;
        addrToId[userAddr] = userId;
        _userData[userId] = NodeData(
            0,
            0,
            0,
            0,
            0,
            _userData[upId].depth + 1,
            0,
            legSide ? -1 : int8(1),
            entrance
        );
        _userInfo[userId] = NodeInfo(dirId, upId, 0, 0);

        if (installment) {
            userDebt[userId] = INSTALLMENT_DEBT;
            _userPeriodEarnable[userId] = INSTALLMENT_EARNABLE;
        } else {
            _userPeriodEarnable[userId] = entranceCap(entrance);
        }

        // The account joins the shutdown vote's denominator at whatever it is worth.
        _syncVoteWeight(userId, 0);
    }

    /**
     * @notice Links a new participant into their upline's free slot.
     * @dev Internal function to set the child relationships for a new participant.
     * @param userId The ID of the new participant.
     * @param upId The ID of the upline participant.
     */
    function _setChildren(uint48 userId, uint48 upId) internal {
        if (_userData[userId].legSide < 0) {
            _userInfo[upId].leftDirectId = userId;
        } else {
            _userInfo[upId].rightDirectId = userId;
            _leaveAssurance(upId);
        }
    }

    /**
     * @notice Credits an entry up the tree, minting points where legs match.
     * @dev Internal function to update the referral structure after a new participant joins or an existing one tops up.
     * @param userId The ID of the participant whose structure is being updated.
     * @param upId The ID of the participant's upline.
     * @param directUp A boolean indicating if direct uplines should also be considered for structure updates.
     * @param userUp A boolean indicating if user counts should be updated.
     * @param maxDepth The maximum depth to traverse in the structure.
     */
    function _updateReferralStructure(
        uint48 userId,
        uint48 upId,
        uint40 directUp,
        bool userUp,
        uint256 maxDepth
    ) internal {
        uint256 round = roundCounter;
        uint48[] storage binaryReceivers = _binaryReceivers[round];
        uint256 depth = _userData[userId].depth;
        uint40 points;
        uint256 _totalPoints;
        int256 weight = int256(uint256(directUp));
        // One SLOAD for the whole walk, not one per upline.
        (, uint16 pointCeiling, ) = stageParams(stage);
        unchecked {
            depth = depth <= maxDepth ? depth : maxDepth;
            uint256 i = 1;
            uint16 week = uint16(weekOf(round));
            do {
                NodeData storage upData = _userData[upId];
                // Snapshot before the leg worth below moves, or the entry that opened
                // this upline's week would be lost from their matched total.
                _rollWeek(upId, week);
                int256 LR = int256(_userData[userId].legSide);
                if (userUp) LR < 0 ? upData.leftUsers++ : upData.rightUsers++;
                uint256 legUp = LR < 0
                    ? upData.leftWorth += directUp
                    : upData.rightWorth += directUp;
                _accrueWeekPoints(upId);
                int256 variance = upData.variance;
                bool vim = (-LR * variance) > 0;
                upData.variance = int40(variance + (LR * weight));
                if (vim) {
                    uint40 oldVar = variance < 0
                        ? uint40(uint256(-variance))
                        : uint40(uint256(variance));

                    uint40 vimPoint = directUp < oldVar ? directUp : oldVar;

                    // The ceiling bites strictly top-down: it chops the 300/200/150
                    // tiers first, so the largest earners give up income before the
                    // base tier feels anything.
                    uint256 maxPoint = calculateMaxPoints(legUp);
                    if (maxPoint > pointCeiling) maxPoint = pointCeiling;
                    points = _roundPoints[round][upId];
                    if (!_userIsFlashed[upId] && points < maxPoint) {
                        uint256 restBefore = ((
                            variance < 0 ? upData.rightWorth : upData.leftWorth
                        ) - directUp) % 6;
                        uint256 vimed = restBefore + vimPoint;
                        vimPoint = uint40(
                            ((vimed / 6) * 5 + (vimed % 6)) - restBefore
                        );

                        uint40 allowedPoints = uint40(maxPoint - points);

                        uint40 actualAdd = vimPoint > allowedPoints
                            ? allowedPoints
                            : vimPoint;

                        if (actualAdd != 0) {
                            if (points == 0) binaryReceivers.push(upId);
                            _roundPoints[round][upId] = points + actualAdd;
                            _totalPoints += actualAdd;
                        }
                    }
                }
                userId = upId;
                upId = _userInfo[upId].uplineId;
                ++i;
            } while (i < depth);
            roundTotalPoints[round] += _totalPoints;
        }
    }

    /**
     * @notice Raises an existing participant to a higher box, or renews the top one.
     * @dev Allows an existing participant to increase their contribution in the SmartContract system.
     * @param userAddr The address of the participant topping up.
     * @param entrance The additional value associated with this top-up.
     * @param enterUSD The USD value associated with this top-up.
     * @return directAddr The address of the direct referrer.
     * @return directShare The share allocated to the direct referrer.
     */
    function topUp(
        address userAddr,
        uint24 entrance,
        uint256 enterUSD
    )
        external
        onlyLatestWindow
        returns (address directAddr, uint256 directShare)
    {
        uint48 userId = addrToId[userAddr];
        if (userId == 0) revert UserNotRegistered();
        uint48 upId = _userInfo[userId].uplineId;

        // Every top-up that lands on the $110 box advances the 4-slot scoring cycle,
        // including the first arrival there. That first arrival always scores — a user's
        // climb to the $55 box and their first $110 are never withheld — but it consumes
        // slot 0, so the renewal after it starts at slot 1 and is subject to the stage's
        // schedule. At the floor that means $55 -> $110 scores and the $110 -> $110 after
        // it does not. Top-ups below the top box never touch the cycle at all.
        // Read before _upgradeUserLevel raises `entrance`, so this still sees the old box.
        // `toTopBox` is false only for an installment payoff — a $50 box still owing its
        // debt paying $55 to clear it (see {_payOffInstallment}). Every other top-up
        // below $110 is refused by {_upgradeUserLevel} a few lines down. The payoff
        // scores its 5 leg units like a $55 entry, and leaves the cycle alone: renewals
        // of the top box are what the cycle counts, not arrivals at a lower one.
        bool toTopBox = entrance == 100;
        bool isRenewal = toTopBox && _userData[userId].entrance == 100;
        bool scores = true;
        if (toTopBox) {
            uint256 slot = _userRenewalCount[userId]++;
            scores = !isRenewal || renewalScores(stage, slot);
        }
        // Validate and raise the level first. Every rejection a top-up can hit lives in
        // _upgradeUserLevel, and FlashRequired is a routine outcome rather than an edge
        // case, so the upline walk must not run ahead of it — otherwise a blocked top-up
        // pays for a traversal whose result is thrown away. Safe to reorder: the walk
        // reads only `depth` and `legSide`, and both `toTopBox` and `isRenewal` were
        // captured above from the pre-upgrade entrance.
        _upgradeUserLevel(userId, entrance);
        if (scores)
            _updateReferralStructure(
                userId,
                upId,
                uint40(enterUSD / 1e19),
                false,
                (1 << 9)
            );
        roundEnteredUSD[roundCounter] += enterUSD;
        allEnteredUSD[roundCounter] += enterUSD;
        return (address(0), 0);
    }

    /**
     * @notice Raises an account's box and its earnable budget with it.
     * @dev Internal function to upgrade a participant's level and adjust their period-earnable balance.
     * @param userId The ID of the participant to upgrade.
     * @param entrance The additional value associated with this upgrade.
     */
    function _upgradeUserLevel(uint48 userId, uint24 entrance) internal {
        uint24 currentEntrance = _userData[userId].entrance;
        if (entrance == 50 && currentEntrance == 50 && userDebt[userId] != 0) {
            _payOffInstallment(userId);
            return;
        }
        bool isRenewal = currentEntrance == 100 && entrance == 100;
        if (entrance <= currentEntrance && !isRenewal)
            revert InvalidTopupTarget();

        uint256 currentEarnable = _userPeriodEarnable[userId];
        if (isRenewal) {
            // A genuine upgrade to a strictly higher box is already guarded against
            // duplicate resubmission above (the second call would see currentEntrance
            // already raised). This only has independent work to do for a duplicate
            // $110 renewal, where repeating the same box is otherwise allowed.
            // Since renewal only ever succeeds from below entranceCap(100)=$1000,
            // periodEarnable can never reach $2000 — the 20x ceiling.
            if (currentEarnable >= entranceCap(currentEntrance))
                revert MaxReached();

            // Second guard: how many renewals may run between one flash and the next.
            // See {TOPUPS_PER_FLASH} for what it is holding shut.
            if (_userTopupsSinceFlash[userId] >= TOPUPS_PER_FLASH)
                revert FlashRequired();

            unchecked {
                ++_userTopupsSinceFlash[userId];
            }
        }

        uint256 weightBefore = _voteWeightOf(userId);
        unchecked {
            _userData[userId].entrance = entrance;
        }
        _syncVoteWeight(userId, weightBefore);
        // An account still owing its installment does not get a whole entranceCap added
        // on top of what it is holding: it would walk away with $1,306 of earnable while
        // still owing $44, having paid $121 for it. It is assigned a flat ceiling
        // instead. The debt itself survives the top-up and keeps being withheld.
        _userPeriodEarnable[userId] = userDebt[userId] != 0
            ? DEBT_TOPUP_EARNABLE
            : currentEarnable + entranceCap(entrance);
        _userIsFlashed[userId] = false;
    }

    /**
     * @notice Erases an installment account's debt for a cash $55 top-up.
     * @dev Reached through `chargeAccount(50)`, which is otherwise unreachable: every
     *      account already holds the $50 or $100 box. Only a $50 box still carrying debt
     *      qualifies — an indebted account that has since climbed to $110 holds
     *      {DEBT_TOPUP_EARNABLE}, and resetting it to $350 would take from it.
     *
     *      The $55 is the full price whatever is left of the debt: the account is booked
     *      from here on exactly as a one-shot $55 entrant, with the whole
     *      `entranceCap(50)` to earn rather than what remained of its installment cap.
     *      The window treats it as any other top-up — $5 dev, the stage's weekly share,
     *      no direct bonus — and {topUp} credits the uplines the same 5 leg units a $55
     *      entry does. Any of the dev's $4 the debt had not yet repaid is not routed
     *      separately; the $5 on this payment is the dev's share.
     *
     *      Neither the scoring cycle nor the flash counter moves: this is not a renewal
     *      of the top box.
     * @param userId The indebted $50 box account paying off its installment.
     */
    function _payOffInstallment(uint48 userId) internal {
        delete userDebt[userId];
        // Weight goes from the installment's 10 to the $50 box it now owns outright.
        _syncVoteWeight(userId, INSTALLMENT_VOTE_WEIGHT);
        _userPeriodEarnable[userId] = entranceCap(50);
        _userIsFlashed[userId] = false;
    }

    /**
     * @notice Works out what one participant is owed from a round's pool.
     * @dev Processes the distribution of binary team rewards for a specific participant in a given round.
     * @param roundId The ID of the round for which payouts are being processed.
     * @param index The index of the participant in the binary receivers list for the specified round.
     * @param pointValue The value assigned to each point for this payout.
     * @return userAddr The address of the participant who received the payout.
     * @return amount The amount of the payout distributed.
     * @return devShare Debt this payout cleared that belongs to the dev, for the window
     *         to route. It is withheld from `amount`, not added to it.
     */
    function processBinaryTeamPayout(
        uint256 roundId,
        uint256 index,
        uint256 pointValue
    )
        external
        onlyVerifiedWindow
        returns (address userAddr, uint256 amount, uint256 devShare)
    {
        uint48 userId = _binaryReceivers[roundId][index];
        uint256 points = _roundPoints[roundId][userId];

        (amount, devShare) = _processBinaryTeamBonus(
            userId,
            (points * pointValue),
            roundId
        );
        userAddr = idToAddr[userId];
    }

    /**
     * @notice The size of a round's payout list and the points it must cover.
     * @dev Retrieves the total points and number of binary receivers for a specific round.
     * @param roundId The ID of the round.
     * @return users The total number of binary receivers in the round.
     * @return points The total points accumulated in the round.
     */
    function roundData(
        uint256 roundId
    ) external view returns (uint256 users, uint256 points) {
        return (_binaryReceivers[roundId].length, roundTotalPoints[roundId]);
    }

    /**
     * @notice Works out what one participant is owed from a week's pool.
     * @dev Pays one participant their share of a week's pool.
     * @param week The week being settled.
     * @param index Position in that week's receiver list.
     * @param pointValue Value of one raw weekly point, frozen by the weekly window.
     * @return userAddr The participant being paid.
     * @return amount What their period-earnable budget could absorb.
     */
    function processWeeklyPayout(
        uint256 week,
        uint256 index,
        uint256 pointValue
    ) external onlyVerifiedWindow returns (address userAddr, uint256 amount) {
        uint48 userId = _weekReceivers[week][index];
        // Only the credited points are paid. The rest of the raw points keep their share
        // in the window, which is swept to the round window when the week closes.
        uint256 credited = _weekEarn[week][userId].credited;

        return (
            idToAddr[userId],
            _processWeeklyBonus(userId, (credited * pointValue), week)
        );
    }

    /**
     * @notice Moves a participant's account to a different wallet.
     * @dev Allows a participant to change their associated wallet address within the system.
     * @param oldAddr The current wallet address of the participant.
     * @param newAddr The new wallet address for the participant.
     */
    function changeWalletAddress(
        address oldAddr,
        address newAddr
    ) external onlyLatestWindow {
        uint48 userId = addrToId[oldAddr];
        if (userId == 0) revert UserNotRegistered();
        // Nobody controls the zero address, so this is never a wallet a participant
        // meant to move to. Worse, it leaves them with no payable address: the round
        // payout would try to transfer to it, revert, and take the whole batch with it —
        // and since the batch cursor only advances on success, the round could never be
        // distributed at all.
        if (newAddr == address(0)) revert InvalidAddress();
        if (userAddrExists(newAddr)) revert NewAddressRegistered();
        if (newAddr == oldAddr) revert SameAddress();
        addrToId[newAddr] = userId;
        idToAddr[userId] = newAddr;
        delete addrToId[oldAddr];
    }

    /**
     * @notice Closes the current round and opens the next one.
     * @dev Increments the round counter and creates a new window for the next round.
     *      This function also copies relevant data from the current round to the new round.
     * @return The address of the newly created window contract.
     */
    function roundIncrement(
        uint256 newAssurance,
        uint256 freeAfter,
        uint256 roundPoints
    ) external onlyLatestWindow returns (address) {
        uint256 current = roundCounter;
        uint256 real = realRound();
        uint256 currentUserCount = userCount[current];
        userCount[real] = currentUserCount;
        allEnteredUSD[real] = allEnteredUSD[current];
        roundCounter = real;
        assurance = newAssurance;
        _updateStage(freeAfter, roundPoints);
        // A new week opens its own window. Weeks are only rolled here, so a week that
        // passes without a settlement never gets one — nothing was collected into it.
        if (weekOf(real) != weekOf(current)) createWeeklyWindow(weekOf(real));
        return createWindow(real, stage);
    }

    /**
     * @notice Advances the pool stage from the settlement snapshot.
     * @dev Advances the pool stage from the settlement snapshot. Runs exactly once per
     *      round, so the stage a round is played under is fixed before anyone enters it.
     *
     *      Worsening is immediate and may skip stages; improving takes one step at a time
     *      and only after {CONFIRM_ROUNDS} consecutive rounds above 1.5x the target
     *      stage's own floor. The wide band is what stops the controller oscillating
     *      across a boundary every 12 hours, and holding it for four rounds — two days —
     *      is what stops a single inflow spike from buying an upgrade.
     * @param freeAfter Reserve left once this round's payout and assurance are set aside.
     * @param roundPoints Points minted in the round that just settled.
     */
    function _updateStage(uint256 freeAfter, uint256 roundPoints) internal {
        uint40 ref = uint40((uint256(refPoints) * 7 + roundPoints) / 8);
        refPoints = ref;

        // No smoothed points means there is nothing to measure coverage against, and
        // treating that as unbounded coverage is actively dangerous: a dormant pool
        // holding nothing at all would climb to the most generous stage over a handful
        // of empty settlements, then meet the first real round with no reserve behind
        // it. A round that carries no information holds the stage and drops any
        // part-built streak instead. `lastCoverage` keeps its previous reading rather
        // than reporting a coverage figure that was never measured.
        if (ref == 0) {
            goodStreak = 0;
            return;
        }

        // Coverage: how many more rounds the free reserve could pay at the peg.
        uint256 coverage = (freeAfter * COVERAGE_SCALE) /
            (POINT_PEG * uint256(ref));
        lastCoverage = coverage;

        uint8 current = stage;
        uint8 next = current;
        uint8 implied = stageFor(coverage);

        if (implied > current) {
            // Worsening is immediate, and drops straight to the implied stage however
            // many rungs down that is.
            next = implied;
            goodStreak = 0;
        } else if (current > 1) {
            if (coverage >= (stageHold(current - 1) * 3) / 2) {
                uint8 streak = goodStreak + 1;
                if (streak >= CONFIRM_ROUNDS) {
                    unchecked {
                        next = current - 1;
                    }
                    streak = 0;
                }
                goodStreak = streak;
            } else {
                goodStreak = 0;
            }
        }

        if (next != current) {
            stage = next;
            emit StageChanged(current, next, coverage);
        }
    }

    /**
     * @notice Thrown when an account votes for a shutdown twice.
     * @dev Throws if an account votes for a shutdown twice.
     */
    error AlreadyVoted();

    /**
     * @notice Emitted when an account votes for an emergency shutdown.
     * @param userId The account that voted.
     * @param weight What it was counted for.
     * @param standing Total weight behind a shutdown after the vote.
     */
    event ShutdownVoted(uint48 indexed userId, uint256 weight, uint256 standing);

    /**
     * @notice Casts one account's vote for an emergency shutdown.
     * @dev Records an account's vote for an emergency shutdown.
     *
     *      The tally lives here rather than on the window because a window is cloned
     *      every round: on the window a vote expired after twelve hours, which made any
     *      threshold worth having unreachable. Here it stands until it is withdrawn.
     *
     *      Weight, not headcount. Counting accounts made a shutdown — which empties the
     *      pool — cost an attacker one cheap account per nine real participants. Counting
     *      what each account paid makes it cost a ninth of everyone's stake.
     *
     *      A vote is final. There is no way to take one back, and none to revalue one:
     *      an account counts for what it was worth the moment it voted, whatever it is
     *      worth later.
     * @param userAddr The voter.
     * @return reached Whether the weight behind a shutdown now crosses the threshold.
     */
    function recordShutdownVote(
        address userAddr
    ) external onlyLatestWindow returns (bool reached) {
        uint48 userId = addrToId[userAddr];
        if (userId == 0) revert UserNotRegistered();
        // Keyed on the id, not the wallet: changing wallet address keeps the id, so a
        // participant cannot vote twice by moving their account.
        if (shutdownVoteWeight[userId] != 0) revert AlreadyVoted();

        uint256 weight = _voteWeightOf(userId);
        shutdownVoteWeight[userId] = weight;
        uint256 standing = shutdownWeight + weight;
        shutdownWeight = standing;

        emit ShutdownVoted(userId, weight, standing);
        return standing > (totalVoteWeight * SHUTDOWN_PCT) / 100;
    }

    /**
     * @notice Where the emergency shutdown vote stands.
     * @dev Exposed because the threshold is a moving target: the denominator counts
     *      every account that ever registered, including those long dormant, so the
     *      share of *live* stake a shutdown needs drifts upward over the system's life.
     *      That drift is tolerable — it stays near the nominal 10% until a large
     *      fraction of all stake goes dormant — but it should be visible on chain
     *      rather than discovered by the people who need the exit.
     * @return voted Weight standing behind a shutdown.
     * @return total Weight of every registered account.
     * @return needed Further weight required to trigger one, or 0 if it is reached.
     */
    function shutdownStatus()
        external
        view
        returns (uint256 voted, uint256 total, uint256 needed)
    {
        voted = shutdownWeight;
        total = totalVoteWeight;
        uint256 threshold = (total * SHUTDOWN_PCT) / 100;
        needed = voted > threshold ? 0 : threshold - voted + 1;
    }

    /**
     * @notice Closes an account and releases whatever assurance it is owed.
     * @dev Callable only by the latest window, which pays the returned amount out.
     *      Reverts inside {_payAssurance} unless the account is actually insured and has
     *      held its place for the full commitment period.
     * @param userAddr The account being closed.
     * @return payout The assurance value for the window to transfer.
     */
    function terminateAccount(
        address userAddr
    ) external onlyLatestWindow returns (uint256 payout) {
        uint48 userId = addrToId[userAddr];
        _setFlashed(userId);
        delete _userPeriodEarnable[userId];
        return _payAssurance(userId);
    }
}
