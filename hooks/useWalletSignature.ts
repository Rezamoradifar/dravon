"use client";

import { useSignMessage } from "wagmi";

/** Client-side counterpart to lib/vpn/walletAuth.ts's message format. */
function walletAuthMessage(timestamp: number): string {
  return `NodeShield VPN (smartchainnetwork.online) account action:${timestamp}`;
}

/** Signs a short, timestamped proof-of-wallet-control message - used for
 * both the admin panel and a regular account's own "my VPN" panel, since
 * both are gated the same way (see lib/vpn/walletAuth.ts). */
export function useWalletSignature() {
  const { signMessageAsync } = useSignMessage();

  async function signWalletAction() {
    const timestamp = Date.now();
    const signature = await signMessageAsync({ message: walletAuthMessage(timestamp) });
    return { timestamp, signature };
  }

  return { signWalletAction };
}
