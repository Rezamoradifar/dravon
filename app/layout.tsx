import type { Metadata, Viewport } from "next";
import { Inter, Vazirmatn } from "next/font/google";

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
