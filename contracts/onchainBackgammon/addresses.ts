import { bscTestnet } from "wagmi/chains";
import type { Address } from "viem";

/**
 * The on-chain Backgammon feature (app/games/backgammon-onchain) is a
 * separate deployment from this dashboard's own round-window contract - see
 * github.com/Rezamoradifar/backgammon- for the contracts/backend source.
 * These default to the current BSC Testnet deployment; override via env if
 * it's ever redeployed.
 */
export const ONCHAIN_BACKGAMMON_CHAIN_ID = bscTestnet.id;

export const GAME_MANAGER_ADDRESS = (process.env.NEXT_PUBLIC_ONCHAIN_GAME_MANAGER_ADDRESS ??
  "0x2d2c6450ffae4f76d90215ae5a3d3e8fb5e1ce18") as Address;

export const PLAYER_REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_ONCHAIN_PLAYER_REGISTRY_ADDRESS ??
  "0x73d9b06f77521aa0ff5e04c3593bc2ba821a1868") as Address;

/** A 6-decimal ERC-20 test token standing in for USDT on BSC Testnet (no
 * canonical testnet Tether deployment exists) - the only token currently
 * allowlisted as a GameManager stake option besides native BNB. Has a public
 * `faucet(uint256 wholeTokens)` anyone can call to mint themselves test
 * funds. Never use this address on mainnet - point at the real USDT
 * contract for the target chain there instead. */
export const MOCK_USDT_ADDRESS = (process.env.NEXT_PUBLIC_ONCHAIN_MOCK_USDT_ADDRESS ??
  "0xc097fe10fcd9bf1728390cf742e2a835900929b9") as Address;

/** The already-deployed backend on Railway - auth, matchmaking/live-game
 * relay, and the contract event indexer all live there, not in dravon. */
export const ONCHAIN_BACKGAMMON_API_URL =
  process.env.NEXT_PUBLIC_ONCHAIN_API_URL ?? "https://backgammon-production-d36d.up.railway.app";
export const ONCHAIN_BACKGAMMON_WS_URL =
  process.env.NEXT_PUBLIC_ONCHAIN_WS_URL ?? "wss://backgammon-production-d36d.up.railway.app";
