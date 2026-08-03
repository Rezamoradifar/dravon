import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Full-site lockdown, used while a major contract-migration update is being
// prepared. Off by default now that the migration (stage controller + weekly
// window) has shipped - everything except the maintenance page itself (and
// the API route it posts feedback to) would otherwise get transparently
// served the maintenance page instead, with the original URL left untouched
// in the address bar. Set MAINTENANCE_MODE=true (see .env.example) and
// redeploy to lock the site again for a future migration - no code changes
// needed.
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";

const ALLOWED_PATHS = ["/maintenance", "/api/feedback"];

export function middleware(request: NextRequest) {
  if (!MAINTENANCE_MODE) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (ALLOWED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/maintenance";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (build assets)
     * - favicon.ico and other common static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
