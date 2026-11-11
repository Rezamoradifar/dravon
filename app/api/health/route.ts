// Minimal, public, secret-free readiness probe for staged VPS cutovers.
// Deliberately does not expose wallet config, RPC URLs, or process details.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { service: "smart-contract-platform", status: "ok" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
