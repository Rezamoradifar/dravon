# v7.4 dapp changes

What the front end has to change for contract v7.4. It builds on `v7-dapp.md` and assumes a
dapp that already works against v7.1. Written from the contract side — none of it assumes
anything about how the dapp is built.

v7.4 is live and migrated. **Change the address first**, then fix the debt copy and add the
new $55 payoff. No function the dapp calls changed its signature.

---

## 1. The address

| | address |
|---|---|
| **SmartContract (v7.4) — the only one that goes in config** | `0x344438c4d038Ccd30104a64FF51DD07AC223795E` |
| v7.1 — shut down, do not point at it | `0x4c7c8060580b6b5Eb50dA04Ad06Fb26B4E7159C3` |

As before, read the round window from the factory with `getLatestWindow()` and the weekly
window with `weeklyWindow()`. Neither goes in config: the round window changes every twelve
hours.

v7.1 is shut down. Its views still answer, but every write reverts with `WindowClosed()`, so
a dapp left on it shows old numbers and fails every transaction.

**If the config address is cached anywhere on the client** (localStorage, a service worker,
a remote config), change the cache key too. Otherwise returning visitors keep the old address
and quietly stay on v7.1. Our dapp moved its key from `smartcontract_dapp_cfg_v7` to
`smartcontract_dapp_cfg_v7_4` for this reason.

---

## 2. What changed underneath

### Accounts in debt are now paid their direct bonuses

`v7-dapp.md` said an $11 installment account had *every* payout withheld against its $44
debt. That is no longer true:

- **Direct bonuses are paid to the wallet in full**, debt or not. They still draw down the
  account's earnable ($306 at entry), as for anyone else.
- **Binary payouts are still withheld** against the debt until it reaches zero.
- Weekly points are still **0** while the debt stands.

Any copy saying "your earnings go to your debt first" is now wrong for directs. Ours reads:

> You still owe $X on your entry. Direct bonuses are paid to your wallet in full; binary
> earnings go to that balance first until it clears. You can also clear it at once with a
> $55 payment from the Top Up tab.

### New: an account in debt can pay it off for $55

`chargeAccount(50)` used to always revert. It now works for exactly one kind of account:

**`getUserData(id).entrance == 50` and `userDebt(id) > 0`**

For every other account, `chargeAccount(50)` (and every `chargeAccount(10)`) still reverts
with `InvalidTopupTarget()`. Only offer the option when both conditions hold.

What the payoff does:

| | |
|---|---|
| price | **$55, always** — even if binary payouts already repaid part of the $44. Paid like any top-up: 55 USDT via `transferFrom`, or BNB through the swap |
| debt | cleared to 0 |
| earnable | **set to $350** — a reset, not an addition |
| flashed | cleared |
| weekly points | resume (cap 1/week, as for any $55 box) |
| vote weight | 10 → 50 |
| tree | uplines get the 5 leg units of a $55 entry |
| direct bonus | **none** — nobody's direct earns from it |

It can only happen once: afterwards the account is an ordinary $55 box and its only top-up
is $110.

Suggested UI: in the Top Up tab, show two choices to accounts in debt: "Pay off installment —
$55" and "Upgrade to Pro — $110". Everyone else sees only $110, as before.

### Unchanged, but easy to get wrong

- Topping up to **$110 while still in debt** sets earnable to a flat **$1,050** and **the debt
  stays**. It is still withheld from binary afterwards. A $110 account in debt cannot use the
  $55 payoff.
- Only the $110 box can renew itself, with at most two renewals between flashes
  (`_userTopupsSinceFlash`).

### `roundsLeft` in the week view is correct now

`getWeekBulkInfo()` on the round window returns `roundsLeft`. **On v7.1 this number was
wrong**: it ignored `weekPhase` and reported the boundary days late. At the moment of the
switch v7.1 showed 8 rounds left when the true value was 14.

If the dapp worked around it by computing the countdown itself, keep that; both now agree:

```js
roundsLeft = WEEK_ROUNDS - ((realRound + weekPhase) % WEEK_ROUNDS)   // WEEK_ROUNDS = 14
weekClosesAt = startTime + (realRound + roundsLeft) * 12h
```

If it read `roundsLeft` straight from the contract, it is right from v7.4 on.

### Round and week numbering restarted

v7.4 started at **round 0 and week 0** on **Monday 28 Sep 2026, 12:00 UTC** (15:30 Tehran). It
launched exactly on the Monday boundary, so `weekPhase() == 0` and, unlike v7, the first week
is a full fourteen rounds. The week still turns over on Monday 12:00 UTC.

Accounts, earnings totals, tree and debt all migrated. **Per-round history did not**: rounds
before 28 Sep live only on v7.1.

**Watch out if the dapp shows history.** The history views compute
`roundCounter - roundsAgo`, and that reverts (arithmetic underflow) when you ask for more
rounds back than exist:

- `getMainBulkInfo(roundsAgo)` — safe only for `roundsAgo <= roundCounter()`
- `getUserRoundInfo(user, fromRoundsAgo, RoundsAgo)` — safe only for `fromRoundsAgo <= roundCounter()`

Clamp to `roundCounter()` for the first days, or catch and show "no history yet".
`getMainBulkInfo(0)` is always safe.

### Stage carried over

The stage controller continues from v7.1: v7.4 opened at **stage 2**, not the stage 4 a
fresh system starts at. Nothing to change if the stage is read from `getMainBulkInfo` /
`stage()`. Just don't hard-code "stage 4 at launch" anywhere.

---

## 3. ABI

**No function the dapp calls changed its signature.** `begin`, `chargeAccount`,
`changeWalletAddress`, `voteShutdown`, `terminateAccount`, `distributeMatchingBonuses` and all
the views keep their v7.1 fragments. We checked all 37 fragments in our dapp against the v7.4
build and ran the reads against the live contract.

One correction to `v7-dapp.md`: `_userTopupsSinceFlash(uint48)` returns **`uint256`**, not
`uint8`. A `uint8` fragment happens to decode because the values are tiny, but fix it.

### New events — optional, useful for history and indexing

Instead of polling, the round window now logs every user action. These are on each round
window (`getLatestWindow()`), so filter by the addresses in `roundToWindow(round)`, not by the
factory.

```
event Entered(address indexed userAddr, address indexed direct, uint24 box, uint256 enterUSD)
event ToppedUp(address indexed userAddr, uint24 box, uint256 enterUSD)
event WalletChanged(address indexed from, address indexed to)
event ShutdownVoteCast(address indexed voter, bool carried)
event AccountTerminated(address indexed userAddr, uint256 payout)
event RoundPriced(uint256 indexed round, uint256 pointValue, uint256 assuranceHeld)
event RoundBatchPaid(uint256 indexed round, uint256 from, uint256 to, bool complete)
event WindowClosedEvent(uint256 indexed round)
event SystemShutdown(uint256 indexed round, address indexed provider, uint256 stableAmount, uint256 nativeAmount)
event WindowInitialized(address indexed factoryAddr, uint256 indexed round, uint8 roundStage)
```

On the weekly window: `event WeekOpened(address indexed factoryAddr, uint256 indexed week)`.
On the factory, as before: `ShutdownVoted`, `StageChanged`.

A payoff logs as `ToppedUp(user, 50, 50e18)`. A $110 top-up logs as
`ToppedUp(user, 100, 100e18)`.

---

## 4. Checklist

1. Config address → `0x344438c4d038Ccd30104a64FF51DD07AC223795E`, and bump any client-side
   cache key.
2. Debt callout: directs paid in full, binary withheld.
3. Top Up: offer `chargeAccount(50)` ("Pay off installment — $55") only when
   `entrance == 50 && userDebt > 0`, beside the $110 upgrade.
4. Week countdown: either source is fine now. Drop any comment saying the contract's value is
   wrong.
5. History views: clamp `roundsAgo` to `roundCounter()`.
6. `_userTopupsSinceFlash` fragment → `returns (uint256)`.
7. Don't show "stage 4" as a launch assumption.

To test the debt screens, account **id 1107** (`0x8f5364a62e8D8B5253CE8A3472F418863A7647c0`)
migrated with $44 of debt and $306 earnable. It can be read without its wallet.

---

Contract v7.4 at `0x344438c4d038Ccd30104a64FF51DD07AC223795E`, migrated from v7.1 at round 62
with 2,215 accounts. Our own dapp (smartcontract-bsc on Netlify and Surge) already carries
every change above, so it is a working reference. Anything ambiguous here should come back to
the contract side rather than be guessed at.
