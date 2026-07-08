import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, fallback } from "wagmi";
import {
  mainnet,
  bsc,
  polygon,
  arbitrum,
  optimism,
  base,
  type Chain,
} from "wagmi/chains";
import { CHAIN_ID } from "@/contracts/addresses";

const SUPPORTED_CHAINS = [mainnet, bsc, polygon, arbitrum, optimism, base] as const;

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

export const wagmiConfig = getDefaultConfig({
  appName: "Round Dashboard",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains: orderedChains,
  transports: Object.fromEntries(
    orderedChains.map((chain) => [
      chain.id,
      chain.id === CHAIN_ID && customRpcUrl
        ? fallback([http(customRpcUrl), http()])
        : http(),
    ]),
  ),
  ssr: true,
});

export const PRIMARY_CHAIN_ID = CHAIN_ID;
