# Round Dashboard

A Web3 dashboard for a round-based referral/matrix smart contract ("round window"), built with
Next.js 15, RainbowKit, Wagmi and Viem.

## Contracts

This app is wired to two addresses, both configured via environment variables:

- **Factory** (`NEXT_PUBLIC_FACTORY_ADDRESS`) - the contract that deploys/tracks round windows.
  Its own ABI wasn't provided, so it is only displayed/linked for reference; no calls are made to it.
- **Window** (`NEXT_PUBLIC_WINDOW_ADDRESS`) - the current/latest round window contract. All reads
  and writes in this app (`begin`, `chargeAccount`, `getMainBulkInfo`, `getUserBulkInfo`, ...) target
  this address, using the ABI in `contracts/roundWindowAbi.ts`.

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

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- RainbowKit + Wagmi + Viem
- TanStack Query
- Recharts (round history charts)
- @xyflow/react (genealogy tree graph)
- Framer Motion (animations)
- Sonner (toast notifications)
- next-themes (dark/light mode)

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

## Pages

| Route | Description |
| --- | --- |
| `/` | Dashboard: round id, latest window, point value, token addresses, contract status |
| `/register` | `begin(startBox, direct, referral)` |
| `/charge` | `chargeAccount(targetBox)` |
| `/statistics` | `getMainBulkInfo(roundsAgo)` |
| `/user` | `getUserBulkInfo(wallet)` with wallet search |
| `/history` | `getUserRoundInfo(...)` charts: points, direct/binary/flash income |
| `/genealogy` | `getUserTree(...)` rendered as a React Flow tree |
| `/account` | `voteShutdown`, `terminateAccount`, `resetWalletAddress` |
| `/admin` | Owner-gated: `distributeMatchingBonuses`, `init` |

## Project structure

```
app/            Next.js App Router pages, layout, global styles, providers
components/
  ui/           shadcn/ui primitives
  layout/       navbar, sidebar, theme toggle
  shared/       address pill, copy button, tx progress, network/latest-window banners, etc.
  forms/        write-transaction forms (register, charge, vote, terminate, reset wallet)
  admin/        admin-only forms
  dashboard/    dashboard cards
  statistics/   statistics panel
  user/         wallet search + user dashboard cards
  charts/       round history charts (recharts)
  genealogy/    tree graph (@xyflow/react)
contracts/      ABI and contract addresses
hooks/          wagmi read/write hooks wrapping the contract
lib/            wagmi config, cn(), formatting, error parsing
types/          shared TypeScript types for parsed contract structs
```

## Production build

```bash
npm run build
npm run start
```
