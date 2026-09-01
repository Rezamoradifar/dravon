import { createPublicClient, fallback, http } from "viem";
import { bsc } from "viem/chains";

import { RPC_ENDPOINTS } from "@/lib/rpcEndpoints";

/**
 * A standalone viem client for server-side (API route) verification -
 * wagmi's client lives in the browser only, so payment verification needs
 * its own, using the same public RPC fallback list the app already trusts.
 */
export const vpnServerPublicClient = createPublicClient({
  chain: bsc,
  transport: fallback(
    RPC_ENDPOINTS[bsc.id].map((url) => http(url, { timeout: 8_000 })),
    { rank: false },
  ),
});
