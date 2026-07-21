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
  "0xeb4c47679557ccd57c0a985cb5785adf61aa7633") as Address;

export const PLAYER_REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_ONCHAIN_PLAYER_REGISTRY_ADDRESS ??
  "0xcab3b98f2853e7c4f79a38eac6a90732eecc9a09") as Address;

/** The already-deployed backend on Railway - auth, matchmaking/live-game
 * relay, and the contract event indexer all live there, not in dravon. */
export const ONCHAIN_BACKGAMMON_API_URL =
  process.env.NEXT_PUBLIC_ONCHAIN_API_URL ?? "https://backgammon-production-d36d.up.railway.app";
export const ONCHAIN_BACKGAMMON_WS_URL =
  process.env.NEXT_PUBLIC_ONCHAIN_WS_URL ?? "wss://backgammon-production-d36d.up.railway.app";
