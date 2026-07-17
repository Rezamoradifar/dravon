/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Static pages otherwise ship `Cache-Control: s-maxage=31536000` (meant for
  // shared/CDN caches). Some wallet in-app browsers misread that as their own
  // long-lived cache, so after a rebuild they keep replaying an old HTML shell
  // that references deleted _next/static asset hashes - 404s on those either
  // leave the page unstyled or break hydration entirely. Force revalidation on
  // every document request; the hashed static assets below are still cached
  // for a year since their filename changes whenever their content does.
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon.ico).*)",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
