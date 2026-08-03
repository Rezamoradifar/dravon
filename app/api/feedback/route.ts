import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Node runtime (not edge) - this route needs filesystem access to persist
// submissions. There's no database in this project yet, so entries are
// appended as JSON Lines to a file on the server's own disk; that's fine
// for a temporary maintenance-mode feedback box and needs no extra
// infrastructure to stand up.
export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data");
const FEEDBACK_FILE = path.join(DATA_DIR, "site-feedback.jsonl");

const MAX_MESSAGE_LENGTH = 4000;
const MAX_CONTACT_LENGTH = 200;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message, contact, walletAddress } = (body ?? {}) as {
    message?: unknown;
    contact?: unknown;
    walletAddress?: unknown;
  };

  if (typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "message is too long" }, { status: 400 });
  }
  if (contact !== undefined && (typeof contact !== "string" || contact.length > MAX_CONTACT_LENGTH)) {
    return NextResponse.json({ error: "invalid contact" }, { status: 400 });
  }
  if (walletAddress !== undefined && typeof walletAddress !== "string") {
    return NextResponse.json({ error: "invalid walletAddress" }, { status: 400 });
  }

  const entry = {
    message: message.trim(),
    contact: typeof contact === "string" ? contact.trim() : undefined,
    walletAddress: typeof walletAddress === "string" ? walletAddress : undefined,
    submittedAt: new Date().toISOString(),
  };

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(FEEDBACK_FILE, `${JSON.stringify(entry)}\n`, "utf8");
  } catch (error) {
    console.error("Failed to persist feedback", error);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
