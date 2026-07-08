import { mainnet, bsc, polygon, arbitrum, optimism, base } from "wagmi/chains";
import type { Address } from "viem";

export interface NativePriceFeed {
  /** Chainlink `AggregatorV3Interface` price feed for this chain's native token, in USD. */
  chainlinkFeed: Address;
  /** CoinGecko coin id used for USD price, 24h change and sparkline history. */
  coingeckoId: string;
  /** Native currency symbol, for display. */
  symbol: string;
}

export const NATIVE_PRICE_FEEDS: Record<number, NativePriceFeed> = {
  [bsc.id]: {
    chainlinkFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
    coingeckoId: "binancecoin",
    symbol: "BNB",
  },
  [mainnet.id]: {
    chainlinkFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    coingeckoId: "ethereum",
    symbol: "ETH",
  },
  [polygon.id]: {
    chainlinkFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
    coingeckoId: "matic-network",
    symbol: "MATIC",
  },
  [arbitrum.id]: {
    chainlinkFeed: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
    coingeckoId: "ethereum",
    symbol: "ETH",
  },
  [optimism.id]: {
    chainlinkFeed: "0x13e3Ee699D1909E989722E753853AE30b17e08c5",
    coingeckoId: "ethereum",
    symbol: "ETH",
  },
  [base.id]: {
    chainlinkFeed: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
    coingeckoId: "ethereum",
    symbol: "ETH",
  },
};
