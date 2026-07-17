import type { Metadata, Viewport } from "next";
import { Inter, Vazirmatn } from "next/font/google";
import Script from "next/script";

import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTransition } from "@/components/layout/page-transition";
import { FloatingLights } from "@/components/layout/floating-lights";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const vazirmatn = Vazirmatn({ subsets: ["arabic"], variable: "--font-vazirmatn", display: "swap" });

const title = "Round Dashboard - Web3 Round Window Control Center";
const description =
  "Manage registration, top-ups, statistics, referrals and account actions for the round-window smart contract, with live on-chain data and a built-in BNB Chain swap.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#080b14" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${vazirmatn.variable} font-sans antialiased`}>
        {/*
          Some wallet in-app browsers (e.g. SafePal) crash before React ever
          finishes hydrating, so app/error.tsx and app/global-error.tsx never
          get a chance to mount - the user just sees Next's generic, detail-free
          crash banner. This vanilla-JS listener runs before hydration and
          renders the real error text as plain DOM, independent of React, so the
          actual failure is finally visible instead of a dead end.
        */}
        <Script id="crash-diagnostic" strategy="beforeInteractive">
          {`
            (function () {
              var RELOAD_KEY = '__chunk_reload_attempted';

              function isChunkLoadError(message) {
                return /loading chunk [\\w.-]+ failed|chunkloaderror/i.test(String(message || ''));
              }

              // A stale tab still holding an old build's HTML will reference a
              // _next/static chunk hash that a newer deploy has since deleted -
              // that 404s as "Loading chunk X failed". A single reload fetches
              // the current HTML (see next.config.mjs's no-cache header) with
              // correct hashes, which fixes it silently without ever showing an
              // error. Guarded by sessionStorage so a genuinely broken deploy
              // still falls through to the visible overlay instead of looping.
              function tryAutoRecover(message) {
                if (!isChunkLoadError(message)) return false;
                try {
                  if (sessionStorage.getItem(RELOAD_KEY)) return false;
                  sessionStorage.setItem(RELOAD_KEY, '1');
                } catch (e) {
                  return false;
                }
                location.reload();
                return true;
              }

              function showError(message) {
                try {
                  if (tryAutoRecover(message)) return;
                  if (document.getElementById('__crash_overlay')) return;
                  var el = document.createElement('div');
                  el.id = '__crash_overlay';
                  el.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#0b0f1a;color:#e5e7eb;padding:20px;font-family:system-ui,sans-serif;overflow:auto;direction:ltr;text-align:left;';
                  var safe = String(message || 'unknown error').replace(/[<>&]/g, function (c) {
                    return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c];
                  });
                  el.innerHTML =
                    '<h2 style="margin:0 0 12px;font-size:16px;">Real client error (debug overlay)</h2>' +
                    '<pre style="white-space:pre-wrap;word-break:break-word;background:#111827;padding:12px;border-radius:8px;font-size:12px;">' +
                    safe +
                    '</pre>' +
                    '<button onclick="location.reload()" style="margin-top:12px;padding:8px 16px;border-radius:8px;background:#6366f1;color:white;border:none;">Reload</button>';
                  (document.body || document.documentElement).appendChild(el);
                } catch (e) {}
              }
              window.addEventListener('error', function (e) {
                showError((e.error && (e.error.stack || e.error.message)) || e.message);
              });
              window.addEventListener('unhandledrejection', function (e) {
                var r = e.reason;
                showError((r && (r.stack || r.message)) || String(r));
              });
            })();
          `}
        </Script>
        <Providers>
          <FloatingLights />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex flex-1">
              <aside className="hidden w-64 shrink-0 border-r border-border/60 md:block">
                <div className="sticky top-16">
                  <Sidebar />
                </div>
              </aside>
              <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                <div className="mx-auto w-full max-w-7xl">
                  <PageTransition>{children}</PageTransition>
                </div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
