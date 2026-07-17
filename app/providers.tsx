"use client";

import * as React from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ThemeProvider, useTheme } from "next-themes";

import { wagmiConfig } from "@/lib/wagmi";
import { Toaster } from "@/components/ui/sonner";
import { WalletViewProvider } from "@/context/wallet-view-context";
import { LanguageProvider } from "@/contexts/language-context";
import { NotificationWatchers } from "@/components/shared/notification-watchers";

/**
 * next-themes only knows the real resolvedTheme after mount (it can't know the
 * user's stored/system preference during SSR or the first client render), so
 * reading it here immediately - before mount - made RainbowKitProvider pick a
 * different theme (and emit a different <style> block) on the server vs. the
 * client's very first paint. That's a hydration mismatch (React error #418) -
 * some browsers silently recover from it, others (several wallet in-app
 * browsers, confirmed) hard-crash. Default to the dark theme (matching
 * ThemeProvider's defaultTheme="dark") until mounted, then switch to the real
 * resolved theme - identical on server and first client render either way.
 */
function RainbowKitWithTheme({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme === "dark";

  return (
    <RainbowKitProvider
      theme={
        isDark
          ? darkTheme({ accentColor: "hsl(245 83% 67%)", borderRadius: "medium" })
          : lightTheme({ accentColor: "hsl(244 75% 59%)", borderRadius: "medium" })
      }
      modalSize="compact"
    >
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <LanguageProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitWithTheme>
              <WalletViewProvider>
                <NotificationWatchers />
                {children}
                <Toaster position="top-right" richColors closeButton />
              </WalletViewProvider>
            </RainbowKitWithTheme>
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
