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

    // ============ CONSTRUCTOR ============

    constructor(
        address _asset,
        address _treasury,
        uint16 _claimFeeBps,
        uint16 _maxEarlyExitFeeBps,
        uint16 _referralBps,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_asset != address(0) && _treasury != address(0), "zero address");
        require(_claimFeeBps <= 1_000, "claim fee too high");        // hard cap 10%
        require(_maxEarlyExitFeeBps <= 1_500, "exit fee too high");  // hard cap 15%
        require(_referralBps <= 500, "referral too high");           // hard cap 5%

        asset = IERC20(_asset);
        treasury = _treasury;
        claimFeeBps = _claimFeeBps;
        maxEarlyExitFeeBps = _maxEarlyExitFeeBps;
        referralBps = _referralBps;
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
