import { bsc, bscTestnet } from "wagmi/chains";

/** Public BSC RPC endpoints, tried in order. wagmi's fallback() transport automatically
 * moves to the next entry when one fails or times out. */
export const RPC_ENDPOINTS: Record<number, string[]> = {
  [bsc.id]: [
    "https://bsc-dataseed.binance.org/",
    "https://rpc.ankr.com/bsc",
    "https://bsc.publicnode.com",
    "https://1rpc.io/bnb",
    "https://binance.llamarpc.com",
  ],
  // BSC Testnet - only used by the on-chain Backgammon feature.
  [bscTestnet.id]: [
    "https://bsc-testnet-rpc.publicnode.com",
    "https://data-seed-prebsc-1-s1.binance.org:8545",
    "https://data-seed-prebsc-2-s1.binance.org:8545",
  ],
};
