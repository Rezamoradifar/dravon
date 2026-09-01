import { NextResponse } from "next/server";

import { verifyAdminSignature } from "@/lib/vpn/adminAuth";
import { listPending } from "@/lib/vpn/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { address, timestamp, signature } = (body ?? {}) as {
    address?: unknown;
    timestamp?: unknown;
    signature?: unknown;
  };

  if (typeof address !== "string" || typeof timestamp !== "number" || typeof signature !== "string") {
    return NextResponse.json({ error: "Missing admin auth fields" }, { status: 400 });
  }
  const auth = await verifyAdminSignature({ address, timestamp, signature: signature as `0x${string}` });
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  return NextResponse.json({ ok: true, pending: await listPending() });
}
