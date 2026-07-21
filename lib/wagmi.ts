import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, fallback } from "wagmi";
import {
  mainnet,
  bsc,
  bscTestnet,
  polygon,
  arbitrum,
  optimism,
  base,
  type Chain,
} from "wagmi/chains";
import { CHAIN_ID } from "@/contracts/addresses";
import { RPC_ENDPOINTS } from "@/lib/rpcEndpoints";

// bscTestnet is here only for the on-chain Backgammon feature
// (contracts/onchainBackgammon/addresses.ts) - the rest of the dashboard
// only ever targets mainnet chains via CHAIN_ID above.
const SUPPORTED_CHAINS = [mainnet, bsc, bscTestnet, polygon, arbitrum, optimism, base] as const;

function orderByPrimary(chains: readonly Chain[], primaryId: number) {
  const primary = chains.find((chain) => chain.id === primaryId);
  const rest = chains.filter((chain) => chain.id !== primaryId);
  return primary ? ([primary, ...rest] as const) : chains;
}

export const orderedChains = orderByPrimary(SUPPORTED_CHAINS, CHAIN_ID) as unknown as readonly [
  Chain,
  ...Chain[],
];

const customRpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

function transportForChain(chainId: number) {
  const urls = [
    ...(chainId === CHAIN_ID && customRpcUrl ? [customRpcUrl] : []),
    ...(RPC_ENDPOINTS[chainId] ?? []),
  ];

  if (urls.length === 0) return http();

  // wagmi's fallback() transport automatically retries the next URL in order
  // when one fails or times out - this is the "automatic RPC fallback".
  return fallback(
    urls.map((url) => http(url, { timeout: 8_000 })),
    { rank: false },
  );
}

export const wagmiConfig = getDefaultConfig({
  appName: "Round Dashboard",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains: orderedChains,
  transports: Object.fromEntries(orderedChains.map((chain) => [chain.id, transportForChain(chain.id)])),
  ssr: true,
});

export const PRIMARY_CHAIN_ID = CHAIN_ID;
