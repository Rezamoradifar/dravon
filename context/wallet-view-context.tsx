"use client";

import * as React from "react";
import { isAddress, type Address } from "viem";
import { useAccount } from "wagmi";

interface WalletViewContextValue {
  /** Wallet currently being inspected across User Dashboard / Round History / Genealogy. */
  viewedAddress: Address | undefined;
  /** Explicit search override; empty string falls back to the connected wallet. */
  searchedAddress: string;
  setSearchedAddress: (address: string) => void;
}

const WalletViewContext = React.createContext<WalletViewContextValue | null>(null);

export function WalletViewProvider({ children }: { children: React.ReactNode }) {
  const { address: connectedAddress } = useAccount();
  const [searchedAddress, setSearchedAddress] = React.useState("");

  const viewedAddress = React.useMemo(() => {
    const candidate = searchedAddress || connectedAddress || "";
    return isAddress(candidate) ? candidate : undefined;
  }, [searchedAddress, connectedAddress]);

  const value = React.useMemo(
    () => ({ viewedAddress, searchedAddress, setSearchedAddress }),
    [viewedAddress, searchedAddress],
  );

  return <WalletViewContext.Provider value={value}>{children}</WalletViewContext.Provider>;
}

export function useWalletView() {
  const ctx = React.useContext(WalletViewContext);
  if (!ctx) throw new Error("useWalletView must be used within a WalletViewProvider");
  return ctx;
}
