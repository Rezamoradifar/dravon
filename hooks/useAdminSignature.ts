"use client";

import { useSignMessage } from "wagmi";

/** Client-side counterpart to lib/vpn/adminAuth.ts's message format. */
function adminAuthMessage(timestamp: number): string {
  return `dravon-vpn-admin-action:${timestamp}`;
}

export function useAdminSignature() {
  const { signMessageAsync } = useSignMessage();

  async function signAdminAction() {
    const timestamp = Date.now();
    const signature = await signMessageAsync({ message: adminAuthMessage(timestamp) });
    return { timestamp, signature };
  }

  return { signAdminAction };
}
