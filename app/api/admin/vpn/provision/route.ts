import { NextResponse } from "next/server";
import { NodeSSH } from "node-ssh";

import { verifyAdminSignature } from "@/lib/vpn/adminAuth";
import { getVpnConfig, isServerConfigured } from "@/lib/vpn/config";
import { findByTxHash, markProvisioned } from "@/lib/vpn/store";

export const runtime = "nodejs";

const WALLET_RE = /^0x[0-9a-fA-F]{40}$/;
const TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { address, timestamp, signature, txHash } = (body ?? {}) as {
    address?: unknown;
    timestamp?: unknown;
    signature?: unknown;
    txHash?: unknown;
  };

  if (typeof address !== "string" || typeof timestamp !== "number" || typeof signature !== "string") {
    return NextResponse.json({ error: "Missing admin auth fields" }, { status: 400 });
  }
  const auth = await verifyAdminSignature({ address, timestamp, signature: signature as `0x${string}` });
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  if (typeof txHash !== "string" || !TX_HASH_RE.test(txHash)) {
    return NextResponse.json({ error: "Invalid txHash" }, { status: 400 });
  }

  const subscription = await findByTxHash(txHash);
  if (!subscription) return NextResponse.json({ error: "No subscription found for this txHash" }, { status: 404 });
  if (subscription.status !== "pending_provisioning") {
    return NextResponse.json({ error: `Subscription is already ${subscription.status}` }, { status: 409 });
  }
  if (!WALLET_RE.test(subscription.walletAddress)) {
    return NextResponse.json({ error: "Stored wallet address looks invalid" }, { status: 500 });
  }

  const config = getVpnConfig();
  if (!isServerConfigured(config)) {
    return NextResponse.json(
      { error: "VPN server is not configured yet - set VPN_SERVER_HOST / _SSH_USER / _SSH_KEY_PATH." },
      { status: 503 },
    );
  }

  const ssh = new NodeSSH();
  try {
    await ssh.connect({
      host: config.server.host!,
      port: config.server.port,
      username: config.server.username!,
      privateKeyPath: config.server.privateKeyPath!,
    });

    // The peer-provisioning script lives on the VPN server itself (see
    // scripts/vpn/add-peer.sh in this repo for what to install there) - this
    // route only ever calls it with a wallet address already validated
    // against WALLET_RE above.
    const result = await ssh.execCommand(
      `sudo /opt/dravon-vpn/add-peer.sh "${subscription.walletAddress}" "${subscription.tier}"`,
    );

    if (result.code !== 0) {
      return NextResponse.json(
        { error: `Provisioning script failed: ${result.stderr || result.stdout}` },
        { status: 502 },
      );
    }

    await markProvisioned(txHash);
    return NextResponse.json({ ok: true, wireguardConfig: result.stdout });
  } catch (error) {
    return NextResponse.json(
      { error: `Could not reach VPN server: ${error instanceof Error ? error.message : "unknown error"}` },
      { status: 502 },
    );
  } finally {
    ssh.dispose();
  }
}
