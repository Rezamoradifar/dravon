"use client";

import * as React from "react";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function WalletSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (address: string) => void;
}) {
  const { address } = useAccount();
  const [draft, setDraft] = React.useState(value);

  const isValid = draft === "" || isAddress(draft);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAddress(draft)) onChange(draft);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[280px] flex-1 space-y-1.5">
        <Label htmlFor="wallet-search">Wallet address</Label>
        <Input
          id="wallet-search"
          placeholder="0x..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        {!isValid && <p className="text-xs text-destructive">Enter a valid address</p>}
      </div>
      <Button type="submit" disabled={!isAddress(draft)} className="gap-2">
        <Search className="h-4 w-4" /> Search
      </Button>
      {address && (
        <Button type="button" variant="outline" onClick={() => { setDraft(address); onChange(address); }}>
          Use my wallet
        </Button>
      )}
    </form>
  );
}
