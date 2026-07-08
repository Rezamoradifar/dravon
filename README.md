# Round Dashboard

A premium Web3 dashboard for a round-based referral/matrix smart contract ("round window"), built
with Next.js 15, RainbowKit, Wagmi and Viem - plus live on-chain data, a built-in PancakeSwap trading
page, and an educational arbitrage/flash-loan learning center.

## Contracts

This app is wired to two addresses, both configured via environment variables:

- **Factory** (`NEXT_PUBLIC_FACTORY_ADDRESS`) - the `SmartContract` contract (source:
  `SmartContract.sol` + `DataStorage.sol` + `WindowFactory.sol`). Deploys/tracks round windows and
  holds per-user registration data. Read directly via `contracts/factoryAbi.ts` for registration
  status (`userAddrExists`, `addrToId`), current tier (`getUserData`), remaining earnable cap
  (`getUserPeriodEarnable`) and the tier cap formula (`entranceCap`).
- **Window** (`NEXT_PUBLIC_WINDOW_ADDRESS`) - the current/latest round window contract (source:
  `Window.sol`, deployed as `SmartContractWindow`). All the round-window reads and writes in this
  app (`begin`, `chargeAccount`, `getMainBulkInfo`, `getUserBulkInfo`, ...) target this address,
  using the ABI in `contracts/roundWindowAbi.ts`.

The window contract exposes `LatestWindow()`, which is used to detect and warn when a newer window
has been deployed than the one configured in `NEXT_PUBLIC_WINDOW_ADDRESS`.

### Note on the Admin Panel

The provided ABI has **no `owner()`/`admin()` getter**. `/admin` is therefore gated client-side by
comparing the connected wallet to `NEXT_PUBLIC_ADMIN_ADDRESS`. This is a UX convenience only, not a
security boundary - the contract itself enforces the real permission checks on
`distributeMatchingBonuses` and `init`, and will revert for unauthorized callers regardless of what
the front-end shows.

### Note on `getUserTree`

`getUserTree(addr, len)` returns a flat `address[]`. This app renders it as a complete binary tree in
breadth-first ("heap") order: index `0` is the root, and the children of node `i` are at `2i+1` and
`2i+2`. This matches the binary direct/referral placement used elsewhere in the contract.

### Note on Registration packages

`begin`/`chargeAccount` only accept `startBox`/`targetBox` values of 10, 50 or 100 - `Window.sol`'s
`_calculateEntryRequirements` reverts with `InvalidStartBox` for any other value, and charges exactly
`startBox * 1.1` USDT. The three package cards (Starter $11 / Professional $55 / Enterprise $110) are
this exact formula applied to those three fixed values from the contract source - not invented
prices. Payment can be made directly in USDT (approve + the contract's `safeTransferFrom`) or in BNB
(sent as `msg.value`, swapped for the exact USDT amount via PancakeSwap V3 inside the contract, with
any unused BNB refunded automatically); the BNB amount shown is an off-chain estimate from the live
price feed plus a small buffer, since there is no on-chain quote getter to read it from directly.

Top-ups only allow real upgrades: `Window.sol`'s `_upgradeUserLevel` requires the target tier to be
strictly higher than the wallet's current tier, except the $110 tier, which may renew itself while
under its own earnable cap. The Charge Account page reads the wallet's current tier
(`factory.getUserData`) and cap (`factory.entranceCap` / `getUserPeriodEarnable`) to enable only the
tiers that would actually succeed on-chain, with the reason shown for any that are disabled.

If a wallet is already registered, `/register` automatically shows a redirect to `/charge` instead
(and vice versa if it isn't registered yet) - both checked live via `factory.userAddrExists`.

### Note on the Activity/History panel

The ABI defines no events, so there's no on-chain log to build a real transaction history from.
The Dashboard's Activity panel always shows transactions submitted from the current browser. If you
set `NEXT_PUBLIC_BSCSCAN_API_KEY` (and the app's chain is BNB Smart Chain), it additionally pulls the
connected wallet's real transaction history with the window contract from BscScan's public API,
decoded with this project's own ABI.

### Note on the Learning Center and Arbitrage Simulator

`/learn` explains flash loans, arbitrage, MEV, cross-chain and DEX arbitrage for educational purposes
only - no return promises, no investment language. `/learn/simulator` is a fully client-side
calculator: every number is a manual input, no wallet or real transaction is involved, and it does
not predict or guarantee any real-world profit.

### Note on Swap

`/swap` is a real integration with PancakeSwap's Router V2 contract on BNB Smart Chain (quotes via
`getAmountsOut`, execution via `swapExactETHForTokens` / `swapExactTokensForETH` /
`swapExactTokensForTokens`). Unlike the Learning Center, this executes real trades with real funds -
the page carries an explicit warning to that effect.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives) with a glassmorphism visual system
- RainbowKit + Wagmi + Viem
- TanStack Query
- Recharts (round history, network growth, price sparkline, simulator charts)
- @xyflow/react (genealogy tree graph)
- Framer Motion (page transitions, animated counters, staggered reveals)
- Sonner (toast notifications)
- next-themes (dark/light mode)
- qrcode.react (referral link QR code)

## Getting started

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID and NEXT_PUBLIC_ADMIN_ADDRESS
npm run dev
```

Open http://localhost:3000.

## Environment variables

See `.env.example` for the full list. At minimum you need:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - get one for free at https://cloud.reown.com
- `NEXT_PUBLIC_FACTORY_ADDRESS` / `NEXT_PUBLIC_WINDOW_ADDRESS` - already pre-filled with the
  addresses this project was built for, override if you redeploy.
- `NEXT_PUBLIC_CHAIN_ID` - defaults to BNB Smart Chain (56).
- `NEXT_PUBLIC_ADMIN_ADDRESS` - wallet address that should see `/admin` (optional).
- `NEXT_PUBLIC_BSCSCAN_API_KEY` - enables real wallet transaction history on the dashboard (optional).
- `NEXT_PUBLIC_SITE_URL` - used to build `sitemap.xml` (optional).

Live native-token pricing uses CoinGecko's public API (client-side, no key needed) with an on-chain
Chainlink price feed as a fallback/cross-check. RPC reads automatically fail over across multiple
public BNB Smart Chain endpoints (`lib/rpcEndpoints.ts`) if one is slow or unavailable.

## Pages

| Route | Description |
| --- | --- |
| `/` | Dashboard: round id, latest window, point value, token addresses, contract status, live price ticker, network growth chart, recent activity |
| `/register` | Starter/Professional/Enterprise packages ($11/$55/$110, real `startBox` 10/50/100), USDT or BNB payment, `begin(startBox, direct, referral)`, referral-link auto-fill, auto-redirects to Charge Account if already registered |
| `/charge` | Only shows valid on-chain upgrade tiers for the wallet's current package, `chargeAccount(targetBox)`, USDT or BNB payment |
| `/statistics` | `getMainBulkInfo(roundsAgo)` |
| `/user` | `getUserBulkInfo(wallet)` with wallet search |
| `/history` | `getUserRoundInfo(...)` charts: points, direct/binary/flash income |
| `/genealogy` | `getUserTree(...)` tree graph, referral link + QR code, per-wallet activity chart |
| `/swap` | Real PancakeSwap Router V2 trading (BNB/BEP20) |
| `/learn` | Educational Learning Center (flash loans, arbitrage, MEV, cross-chain/DEX arbitrage, AMMs, liquidity, PancakeSwap, Uniswap, smart contract risk, wallet security) |
| `/learn/simulator` | Fully simulated borrow/swap/repay profit calculator |
| `/products` | Honest status overview of every module in this app, plus educational-only entries (no pricing, no purchase flow) |
| `/news` | Real changelog of shipped features (not market/investment news), with a clearly-labeled "coming soon" video slot |
| `/contract-actions` | Every write function on the window contract in one BscScan-style console: params, gas estimate, live tx status, explorer link |
| `/account` | `voteShutdown`, `terminateAccount`, `resetWalletAddress` |
| `/admin` | Owner-gated: `distributeMatchingBonuses`, `init`, wallet lookup, CSV export, analytics |

## Project structure

```
app/            Next.js App Router pages, layout, global styles, providers
components/
  ui/           shadcn/ui primitives
  layout/       navbar, sidebar, theme toggle, page transitions, floating background lights
  shared/       address pill, copy button, tx progress, price ticker, network/latest-window banners, etc.
  forms/        write-transaction forms (register, charge, vote, terminate, reset wallet, presets)
  admin/        admin-only forms, user lookup, CSV export
  dashboard/    dashboard cards, network growth chart, activity panel
  statistics/   statistics panel
  user/         wallet search + user dashboard cards
  charts/       round history charts (recharts)
  genealogy/    tree graph (@xyflow/react), referral link + QR, growth chart
  swap/         token select, swap card (PancakeSwap Router V2)
  learn/        risk badge, workflow diagram
  news/         announcement slider
context/        WalletViewProvider - shares the currently-viewed wallet across pages
contracts/      ABIs (round window, ERC20, Chainlink aggregator, PancakeSwap router) and addresses
hooks/          wagmi read/write hooks, live price/gas/network status, activity log, saved presets
lib/            wagmi config + multi-RPC fallback, cn(), formatting, error parsing, CSV export, learning/product/news content
types/          shared TypeScript types for parsed contract structs
```

## Production build

```bash
npm run build
npm run start
```
