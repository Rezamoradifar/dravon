# DravonUSD (DUSD)

A standard, independent BEP-20 token for BNB Smart Chain. **DravonUSD is not
Tether/USDT, is not pegged to any asset, and is not affiliated with Tether
Limited in any way.** The name, symbol, and logo here are original and
deliberately distinct from Tether's branding.

## Contract

- `contracts/DravonUSD.sol` - OpenZeppelin-based ERC20 (BEP-20), with:
  - Name: `DravonUSD`, Symbol: `DUSD`, Decimals: `18`
  - Fixed initial supply minted to the deployer at deploy time (amount set via `INITIAL_SUPPLY`)
  - `mint(address,uint256)` - owner-only, for any future supply increases
  - `burn` / `burnFrom` - from OpenZeppelin's `ERC20Burnable`

No reward-distribution, auto-payout, or "daily percentage to wallets" logic
is included. If you need scheduled payouts to a fixed set of addresses, that
must be a separate, clearly-documented contract - not bundled into the token
itself.

## Setup

```bash
cd token
npm install
cp .env.example .env
```

Fill in `.env`:

- `PRIVATE_KEY` - use a **dedicated deployment wallet**, funded with only
  enough BNB to cover gas. Never reuse a wallet that holds significant funds,
  and never share or paste this key anywhere outside your local `.env`.
- `BSC_RPC_URL` / `BSC_TESTNET_RPC_URL` - public defaults are provided.
- `BSCSCAN_API_KEY` - optional, only needed for `verify`.
- `INITIAL_SUPPLY` - total supply to mint at deploy time (whole tokens).

## Deploy

Always test on BSC Testnet first:

```bash
npm run deploy:testnet
```

Get free testnet BNB from the [BNB Chain testnet faucet](https://www.bnbchain.org/en/testnet-faucet).

Once verified working, deploy to BNB Smart Chain mainnet:

```bash
npm run deploy:mainnet
```

This runs locally, from your own machine, using your own funded key - deploying a real
contract to mainnet is irreversible and costs real BNB gas, so double-check
`INITIAL_SUPPLY` and the network before running it.

## Verify on BscScan

```bash
npm run verify:mainnet -- <DEPLOYED_ADDRESS> <INITIAL_SUPPLY_IN_WEI> <OWNER_ADDRESS>
```

## Logo

`assets/logo.svg` - an original mark (purple/indigo circular badge with a
"D"), unrelated to any existing token's branding.
