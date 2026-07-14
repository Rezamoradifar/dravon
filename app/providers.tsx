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

function RainbowKitWithTheme({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  return (
    <RainbowKitProvider
      theme={
        resolvedTheme === "dark"
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
