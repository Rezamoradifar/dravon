import { Orbitron } from "next/font/google";

import { AuthProvider } from "@/lib/onchainBackgammon/auth";
import { OnchainBackgammonSubNav } from "@/components/onchainBackgammon/sub-nav";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-gaming", display: "swap" });

/**
 * Wraps only this feature's subtree with its own SIWE-style session
 * (nonce + signature -> JWT against the separately-hosted backend, see
 * lib/onchainBackgammon/auth.tsx) - wagmi/RainbowKit themselves come from
 * the root layout's existing Providers, shared with the rest of the
 * dashboard, not duplicated here. The gaming display font is scoped to
 * this subtree only (via the --font-gaming CSS variable), not applied
 * dashboard-wide.
 */
export default function OnchainBackgammonLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className={orbitron.variable}>
        <OnchainBackgammonSubNav />
        {children}
      </div>
    </AuthProvider>
  );
}
