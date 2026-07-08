import { bsc } from "wagmi/chains";
import type { Address } from "viem";

export const PANCAKE_ROUTER_V2: Address = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
export const WBNB_ADDRESS: Address = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

export const SWAP_SUPPORTED_CHAIN_ID = bsc.id;

export interface SwapToken {
  symbol: string;
  name: string;
  address: Address | "native";
  decimals: number;
  logoColor: string;
}

/** Curated, well-known BEP20 mainnet token addresses. Native BNB routes via WBNB_ADDRESS. */
export const SWAP_TOKENS: SwapToken[] = [
  { symbol: "BNB", name: "BNB (native)", address: "native", decimals: 18, logoColor: "#F0B90B" },
  { symbol: "WBNB", name: "Wrapped BNB", address: WBNB_ADDRESS, decimals: 18, logoColor: "#F0B90B" },
  {
    symbol: "BUSD",
    name: "Binance USD",
    address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    decimals: 18,
    logoColor: "#F0B90B",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x55d398326f99059fF775485246999027B3197955",
    decimals: 18,
    logoColor: "#26A17B",
  },
  {
    symbol: "CAKE",
    name: "PancakeSwap Token",
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    decimals: 18,
    logoColor: "#D1884F",
  },
];

export function tokenPathAddress(token: SwapToken): Address {
  return token.address === "native" ? WBNB_ADDRESS : token.address;
}
