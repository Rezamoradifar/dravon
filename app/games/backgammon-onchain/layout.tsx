import { AuthProvider } from "@/lib/onchainBackgammon/auth";
import { OnchainBackgammonSubNav } from "@/components/onchainBackgammon/sub-nav";

/**
 * Wraps only this feature's subtree with its own SIWE-style session
 * (nonce + signature -> JWT against the separately-hosted backend, see
 * lib/onchainBackgammon/auth.tsx) - wagmi/RainbowKit themselves come from
 * the root layout's existing Providers, shared with the rest of the
 * dashboard, not duplicated here.
 */
export default function OnchainBackgammonLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <OnchainBackgammonSubNav />
      {children}
    </AuthProvider>
  );
}
