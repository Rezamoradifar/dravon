import { bsc } from "wagmi/chains";

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
};
