// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

/// @title TransparentStaking
/// @notice Fixed-term ERC20 (e.g. USDT) staking with fully-collateralized, auditable rewards.
///
/// Economic model (the part that matters):
/// -----------------------------------------------------------------------
/// Every stake's *entire* promised reward is checked against a pre-funded
/// `rewardReserve` at the moment the stake is created. The contract tracks
/// `pendingRewardObligation`, the sum of (promised - already paid) reward
/// across every active stake, and enforces the invariant
///
///     rewardReserve >= pendingRewardObligation
///
/// on every new stake. Concretely: if the protocol has not deposited enough
/// funding to cover a promised payout, the stake simply reverts. New
/// deposits are never used to pay existing depositors - rewards can only
/// ever come out of the dedicated, pre-funded reserve. This removes the
/// Ponzi dynamic (paying old depositors from new deposits) by construction,
/// not by policy.
///
/// Owner powers are intentionally minimal and bounded on-chain:
///  - `pause()` only blocks *new* stakes. It can never block an existing
///    depositor's `claim()` or `withdraw()` - user funds can never be frozen.
///  - `withdrawExcessRewardReserve()` can only ever move
///    `rewardReserve - pendingRewardObligation`, i.e. funds that are not
///    backing any live promise. It is mathematically impossible for the
///    owner to touch principal or already-promised rewards.
///  - There is no owner-only "trading", "arbitrage" or sweep function of any
///    kind, no blacklist, and no privileged fund-splitting "emergency" path.
///  - Plan terms (duration + rate) are immutable once created; the owner can
///    only disable a plan for *future* stakes, never alter the terms of a
///    stake that already exists.
///
/// Emergency council (disaster recovery, not an owner backdoor):
/// -----------------------------------------------------------------------
/// A fixed set of 10 council addresses is set once in the constructor and
/// can never be changed afterwards by anyone, including the owner - so the
/// council can never be quietly repacked. If 6-of-10 vote
/// `voteEmergencyWithdraw()`, the contract is paused (new stakes only - all
/// `claim()`/`withdraw()` calls stay open) and a 72-hour timelock starts.
/// Only after the timelock elapses can anyone call `executeEmergencyWithdraw()`,
/// which sweeps the full token balance to `emergencyRecipient` - a single
/// address fixed at deploy time. The council members are never the
/// recipient; they only hold the trigger, never the payout, which is what
/// stops a colluding majority from simply voting themselves the funds. The
/// 72-hour window is the real user protection: it exists so every depositor
/// has time to self-withdraw before a sweep executes. Cancelling an
/// in-progress emergency also requires a 6-of-10 vote, so neither the owner
/// nor a single council member can unilaterally start or stop it.
contract TransparentStaking is ReentrancyGuard, Pausable, Ownable2Step {
    using SafeERC20 for IERC20;

    // ============ IMMUTABLE CONFIG ============

    /// @notice The ERC20 token users stake (e.g. USDT). Fixed at deploy time.
    IERC20 public immutable asset;

    /// @notice Where protocol fees and early-exit fees are sent. Fixed at deploy time
    /// (not owner-updatable) so it cannot be silently redirected after launch.
    address public immutable treasury;

    uint16 public constant BPS_DENOM = 10_000;

    /// @notice Fee taken out of each claimed reward, in bps. Hard-capped at 10% and
    /// immutable - it can never be raised after deployment.
    uint16 public immutable claimFeeBps;

    /// @notice Maximum early-exit fee (bps of principal), linearly decaying to 0 as the
    /// stake approaches maturity. Hard-capped at 15% and immutable.
    uint16 public immutable maxEarlyExitFeeBps;

    /// @notice One-level referral bonus, in bps of the referred principal, paid
    /// immediately and only if the dedicated referral reserve can cover it.
    /// Hard-capped at 5% and immutable.
    uint16 public immutable referralBps;

    // ============ EMERGENCY COUNCIL ============

    uint256 public constant COUNCIL_SIZE = 10;
    uint256 public constant EMERGENCY_QUORUM = 6;
    uint256 public constant EMERGENCY_TIMELOCK = 72 hours;

    /// @notice The 10 council addresses. Set once in the constructor - there is no
    /// function anywhere in this contract that can add, remove or replace a member,
    /// so the council can never be repacked after deployment, not even by the owner.
    address[COUNCIL_SIZE] public council;

    /// @notice Sole destination of an executed emergency withdrawal. Fixed at deploy
    /// time and immutable. Deliberately never one of the council members themselves -
    /// the council can only trigger the sweep, never receive it, so a colluding
    /// majority cannot simply vote themselves the funds.
    address public immutable emergencyRecipient;

    mapping(address => bool) public emergencyWithdrawVotes;
    uint256 public emergencyWithdrawVoteCount;
    /// @notice Timestamp quorum was reached; 0 means no emergency withdrawal is pending.
    uint256 public emergencyApprovedAt;
    bool public emergencyExecuted;

    mapping(address => bool) public emergencyCancelVotes;
    uint256 public emergencyCancelVoteCount;

    // ============ PLANS ============

    struct Plan {
        uint256 lockDuration;  // seconds
        uint16 totalRateBps;   // TOTAL reward over the full lockDuration (not daily!), bps of principal
        uint256 minStake;
        uint256 maxStake;
        bool enabled;          // owner may disable for *future* stakes only
    }

    Plan[] public plans;

    // ============ STAKES ============

    struct StakeInfo {
        uint256 principal;
        uint256 planId;
        uint256 startTime;
        uint256 maturity;
        uint256 promisedReward;   // total reward owed if held to maturity
        uint256 claimedReward;    // reward already paid out
        uint256 lastAccrualTime;  // up to which point reward has been settled
        bool active;
    }

    mapping(address => StakeInfo) public stakes;
    mapping(address => address) public referrerOf;

    // ============ SOLVENCY ACCOUNTING ============

    /// @notice Sum of principal currently locked, owed back to depositors.
    uint256 public principalPool;

    /// @notice Funds earmarked to pay rewards. Only ever increased by
    /// `fundRewardReserve` and decreased by actual reward payouts or by the
    /// owner withdrawing the unencumbered excess.
    uint256 public rewardReserve;

    /// @notice Sum over all active stakes of (promisedReward - claimedReward).
    /// Invariant enforced on every new stake: rewardReserve >= pendingRewardObligation.
    uint256 public pendingRewardObligation;

    /// @notice Funds earmarked for one-time referral bonuses paid at stake time.
    uint256 public referralReserve;

    // ============ STATS (informational only) ============

    uint256 public totalStakedEver;
    uint256 public totalRewardsPaid;
    uint256 public totalReferralPaid;

    // ============ EVENTS ============

    event PlanAdded(uint256 indexed planId, uint256 lockDuration, uint16 totalRateBps, uint256 minStake, uint256 maxStake);
    event PlanDisabled(uint256 indexed planId);
    event RewardReserveFunded(address indexed from, uint256 amount);
    event ReferralReserveFunded(address indexed from, uint256 amount);
    event ExcessRewardReserveWithdrawn(address indexed to, uint256 amount);
    event ExcessReferralReserveWithdrawn(address indexed to, uint256 amount);
    event Staked(address indexed user, uint256 indexed planId, uint256 principal, uint256 promisedReward, address indexed referrer);
    event RewardClaimed(address indexed user, uint256 grossAmount, uint256 fee, uint256 netAmount);
    event ReferralPaid(address indexed referrer, address indexed referee, uint256 amount);
    event Withdrawn(address indexed user, uint256 principalReturned, uint256 exitFee, bool early);
    event EmergencyWithdrawVoted(address indexed voter, uint256 totalVotes);
    event EmergencyWithdrawApproved(uint256 timelockEndsAt);
    event EmergencyWithdrawCancelVoted(address indexed voter, uint256 totalVotes);
    event EmergencyWithdrawCancelled();
    event EmergencyWithdrawExecuted(address indexed recipient, uint256 amount);

    // ============ CONSTRUCTOR ============

    constructor(
        address _asset,
        address _treasury,
        uint16 _claimFeeBps,
        uint16 _maxEarlyExitFeeBps,
        uint16 _referralBps,
        address[COUNCIL_SIZE] memory _council,
        address _emergencyRecipient,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_asset != address(0) && _treasury != address(0), "zero address");
        require(_claimFeeBps <= 1_000, "claim fee too high");        // hard cap 10%
        require(_maxEarlyExitFeeBps <= 1_500, "exit fee too high");  // hard cap 15%
        require(_referralBps <= 500, "referral too high");           // hard cap 5%
        require(_emergencyRecipient != address(0), "zero emergency recipient");

        for (uint256 i = 0; i < COUNCIL_SIZE; i++) {
            require(_council[i] != address(0), "zero council member");
            require(_council[i] != _emergencyRecipient, "council cannot be recipient");
            for (uint256 j = 0; j < i; j++) {
                require(_council[i] != _council[j], "duplicate council member");
            }
        }

        asset = IERC20(_asset);
        treasury = _treasury;
        claimFeeBps = _claimFeeBps;
        maxEarlyExitFeeBps = _maxEarlyExitFeeBps;
        referralBps = _referralBps;
        council = _council;
        emergencyRecipient = _emergencyRecipient;
    }

    // ============ OWNER: PLAN MANAGEMENT ============

    /// @notice Add a new plan. Existing plans are immutable once created - the owner
    /// can never change the terms of a plan that already has stakes in it.
    /// @param totalRateBps TOTAL reward over the whole lockDuration, hard-capped at 50%.
    function addPlan(uint256 lockDuration, uint16 totalRateBps, uint256 minStake, uint256 maxStake) external onlyOwner {
        require(lockDuration > 0, "duration");
        require(totalRateBps > 0 && totalRateBps <= 5_000, "rate out of range"); // hard cap 50% total
        require(minStake > 0 && minStake <= maxStake, "range");
        plans.push(Plan(lockDuration, totalRateBps, minStake, maxStake, true));
        emit PlanAdded(plans.length - 1, lockDuration, totalRateBps, minStake, maxStake);
    }

    /// @notice Disable a plan for *future* stakes only. Never affects stakes already open in it.
    function disablePlan(uint256 planId) external onlyOwner {
        require(planId < plans.length, "invalid plan");
        plans[planId].enabled = false;
        emit PlanDisabled(planId);
    }

    function plansCount() external view returns (uint256) {
        return plans.length;
    }

    // ============ RESERVE FUNDING (permissionless - anyone may back the protocol) ============

    function fundRewardReserve(uint256 amount) external nonReentrant {
        require(amount > 0, "zero");
        asset.safeTransferFrom(msg.sender, address(this), amount);
        rewardReserve += amount;
        emit RewardReserveFunded(msg.sender, amount);
    }

    function fundReferralReserve(uint256 amount) external nonReentrant {
        require(amount > 0, "zero");
        asset.safeTransferFrom(msg.sender, address(this), amount);
        referralReserve += amount;
        emit ReferralReserveFunded(msg.sender, amount);
    }

    /// @notice Owner may withdraw only the portion of the reward reserve that is not
    /// backing any active stake's promised reward. Cannot touch principal or
    /// already-promised rewards - the subtraction below makes that unencumbered
    /// amount the hard on-chain ceiling.
    function withdrawExcessRewardReserve(uint256 amount) external onlyOwner nonReentrant {
        uint256 excess = rewardReserve - pendingRewardObligation;
        require(amount <= excess, "exceeds unencumbered excess");
        rewardReserve -= amount;
        asset.safeTransfer(treasury, amount);
        emit ExcessRewardReserveWithdrawn(treasury, amount);
    }

    /// @notice Referral bonuses are paid atomically at stake time (never accrue as a
    /// future obligation), so the entire referral reserve is always unencumbered.
    function withdrawExcessReferralReserve(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= referralReserve, "exceeds referral reserve");
        referralReserve -= amount;
        asset.safeTransfer(treasury, amount);
        emit ExcessReferralReserveWithdrawn(treasury, amount);
    }

    // ============ CIRCUIT BREAKER ============

    /// @notice Pausing only blocks NEW stakes. `claim()` and `withdraw()` are never
    /// gated by this - user funds can never be frozen by the owner.
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ EMERGENCY COUNCIL ============

    modifier onlyCouncil() {
        bool found = false;
        for (uint256 i = 0; i < COUNCIL_SIZE; i++) {
            if (council[i] == msg.sender) { found = true; break; }
        }
        require(found, "not council");
        _;
    }

    /// @notice Vote to approve a full emergency withdrawal to `emergencyRecipient`.
    /// Once 6 of the 10 council members have voted, the contract is paused (new
    /// stakes only) and a 72-hour timelock begins - existing depositors can still
    /// `claim()`/`withdraw()` throughout this entire window.
    function voteEmergencyWithdraw() external onlyCouncil {
        require(!emergencyExecuted, "already executed");
        require(emergencyApprovedAt == 0, "already approved");
        require(!emergencyWithdrawVotes[msg.sender], "already voted");

        emergencyWithdrawVotes[msg.sender] = true;
        emergencyWithdrawVoteCount++;
        emit EmergencyWithdrawVoted(msg.sender, emergencyWithdrawVoteCount);

        if (emergencyWithdrawVoteCount >= EMERGENCY_QUORUM) {
            emergencyApprovedAt = block.timestamp;
            if (!paused()) _pause();
            emit EmergencyWithdrawApproved(block.timestamp + EMERGENCY_TIMELOCK);
        }
    }

    /// @notice Vote to cancel a pending (not yet executed) emergency withdrawal.
    /// Also requires 6 of 10 - neither the owner nor a lone council member can
    /// unilaterally reverse a decision the council already approved.
    function voteCancelEmergencyWithdraw() external onlyCouncil {
        require(emergencyApprovedAt != 0, "not approved");
        require(!emergencyExecuted, "already executed");
        require(!emergencyCancelVotes[msg.sender], "already voted");

        emergencyCancelVotes[msg.sender] = true;
        emergencyCancelVoteCount++;
        emit EmergencyWithdrawCancelVoted(msg.sender, emergencyCancelVoteCount);

        if (emergencyCancelVoteCount >= EMERGENCY_QUORUM) {
            emergencyApprovedAt = 0;
            emergencyWithdrawVoteCount = 0;
            emergencyCancelVoteCount = 0;
            for (uint256 i = 0; i < COUNCIL_SIZE; i++) {
                emergencyWithdrawVotes[council[i]] = false;
                emergencyCancelVotes[council[i]] = false;
            }
            emit EmergencyWithdrawCancelled();
        }
    }

    /// @notice Sweep the full token balance to the fixed `emergencyRecipient` once the
    /// 72-hour timelock has elapsed. Callable by anyone (permissionless execution) -
    /// there is nothing left to gate once quorum and the timelock are satisfied.
    /// Irreversible: any depositor who has not self-withdrawn before this executes
    /// loses access to the swept funds, which is why the timelock exists.
    function executeEmergencyWithdraw() external nonReentrant {
        require(emergencyApprovedAt != 0, "not approved");
        require(!emergencyExecuted, "already executed");
        require(block.timestamp >= emergencyApprovedAt + EMERGENCY_TIMELOCK, "timelock active");

        emergencyExecuted = true;
        uint256 amount = asset.balanceOf(address(this));
        asset.safeTransfer(emergencyRecipient, amount);
        emit EmergencyWithdrawExecuted(emergencyRecipient, amount);
    }

    // ============ USER ACTIONS ============

    function stake(uint256 planId, uint256 amount, address referrer) external nonReentrant whenNotPaused {
        require(!stakes[msg.sender].active, "already staking");
        require(planId < plans.length, "invalid plan");
        Plan storage p = plans[planId];
        require(p.enabled, "plan disabled");
        require(amount >= p.minStake && amount <= p.maxStake, "amount out of range");

        uint256 promisedReward = (amount * p.totalRateBps) / BPS_DENOM;
        uint256 newObligation = pendingRewardObligation + promisedReward;
        require(rewardReserve >= newObligation, "insufficient reward reserve: staking paused until funded");
        pendingRewardObligation = newObligation;

        asset.safeTransferFrom(msg.sender, address(this), amount);
        principalPool += amount;
        totalStakedEver += amount;

        uint256 startTime = block.timestamp;
        stakes[msg.sender] = StakeInfo({
            principal: amount,
            planId: planId,
            startTime: startTime,
            maturity: startTime + p.lockDuration,
            promisedReward: promisedReward,
            claimedReward: 0,
            lastAccrualTime: startTime,
            active: true
        });

        address ref = (referrer != address(0) && referrer != msg.sender && stakes[referrer].active) ? referrer : address(0);
        if (ref != address(0)) {
            referrerOf[msg.sender] = ref;
            uint256 bonus = (amount * referralBps) / BPS_DENOM;
            if (bonus > 0 && referralReserve >= bonus) {
                referralReserve -= bonus;
                totalReferralPaid += bonus;
                asset.safeTransfer(ref, bonus);
                emit ReferralPaid(ref, msg.sender, bonus);
            }
        }

        emit Staked(msg.sender, planId, amount, promisedReward, ref);
    }

    /// @notice Claim reward accrued so far. Works before *and* after maturity, and is
    /// never blocked by `pause()`.
    function claim() external nonReentrant {
        uint256 net = _settleReward(msg.sender);
        require(net > 0, "nothing to claim");
    }

    /// @notice Withdraw principal. After maturity this returns 100% of principal with
    /// zero fee. Before maturity ("early exit") a fee applies only to principal,
    /// linearly decaying from `maxEarlyExitFeeBps` at stake time to 0 at maturity, and
    /// only the *unearned future* portion of the reward is forfeited - anything already
    /// accrued up to the moment of exit is paid out normally via `_settleReward`.
    function withdraw() external nonReentrant {
        StakeInfo storage s = stakes[msg.sender];
        require(s.active, "no active stake");

        _settleReward(msg.sender);

        uint256 principal = s.principal;
        uint256 fee = 0;
        bool early = block.timestamp < s.maturity;
        if (early) {
            uint256 duration = s.maturity - s.startTime;
            uint256 remaining = s.maturity - block.timestamp;
            fee = (principal * maxEarlyExitFeeBps * remaining) / (duration * BPS_DENOM);

            uint256 forfeited = s.promisedReward - s.claimedReward;
            if (forfeited > pendingRewardObligation) forfeited = pendingRewardObligation;
            pendingRewardObligation -= forfeited;
        }

        s.active = false;
        principalPool -= principal;

        uint256 refund = principal - fee;
        if (fee > 0) asset.safeTransfer(treasury, fee);
        asset.safeTransfer(msg.sender, refund);

        emit Withdrawn(msg.sender, refund, fee, early);
    }

    // ============ INTERNAL ============

    function _settleReward(address user) private returns (uint256 net) {
        StakeInfo storage s = stakes[user];
        require(s.principal > 0, "no stake");

        uint256 accrualEnd = block.timestamp < s.maturity ? block.timestamp : s.maturity;
        if (accrualEnd <= s.lastAccrualTime) return 0;

        uint256 duration = s.maturity - s.startTime;
        uint256 elapsed = accrualEnd - s.lastAccrualTime;
        uint256 gross = (s.promisedReward * elapsed) / duration;
        if (gross == 0) return 0;

        s.lastAccrualTime = accrualEnd;
        s.claimedReward += gross;

        rewardReserve -= gross;
        pendingRewardObligation -= gross;
        totalRewardsPaid += gross;

        uint256 fee = (gross * claimFeeBps) / BPS_DENOM;
        net = gross - fee;

        if (fee > 0) asset.safeTransfer(treasury, fee);
        asset.safeTransfer(user, net);

        emit RewardClaimed(user, gross, fee, net);
    }

    // ============ VIEWS ============

    function pendingReward(address user) external view returns (uint256) {
        StakeInfo storage s = stakes[user];
        if (!s.active) return 0;
        uint256 accrualEnd = block.timestamp < s.maturity ? block.timestamp : s.maturity;
        if (accrualEnd <= s.lastAccrualTime) return 0;
        uint256 duration = s.maturity - s.startTime;
        uint256 elapsed = accrualEnd - s.lastAccrualTime;
        return (s.promisedReward * elapsed) / duration;
    }

    /// @notice Reward reserve not currently backing any live promise - the exact
    /// ceiling on what `withdrawExcessRewardReserve` may move.
    function unencumberedRewardReserve() external view returns (uint256) {
        return rewardReserve - pendingRewardObligation;
    }

    /// @notice Whether a new stake of `amount` into `planId` could be accepted right now
    /// given current reserve funding, without actually staking. Useful for front-ends.
    function canAcceptStake(uint256 planId, uint256 amount) external view returns (bool) {
        if (planId >= plans.length) return false;
        Plan storage p = plans[planId];
        if (!p.enabled) return false;
        if (amount < p.minStake || amount > p.maxStake) return false;
        uint256 promisedReward = (amount * p.totalRateBps) / BPS_DENOM;
        return rewardReserve >= pendingRewardObligation + promisedReward;
    }

    function contractBalance() external view returns (uint256) {
        return asset.balanceOf(address(this));
    }
}
