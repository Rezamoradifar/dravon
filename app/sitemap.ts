import type { MetadataRoute } from "next";

const ROUTES = [
  "",
  "/register",
  "/charge",
  "/statistics",
  "/user",
  "/history",
  "/genealogy",
  "/swap",
  "/learn",
  "/learn/flash-loans",
  "/learn/arbitrage",
  "/learn/mev",
  "/learn/cross-chain-arbitrage",
  "/learn/dex-arbitrage",
  "/learn/simulator",
  "/products",
  "/account",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  return ROUTES.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
}
