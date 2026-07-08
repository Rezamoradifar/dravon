"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SWAP_TOKENS, type SwapToken } from "@/lib/pancakeswap";

export function TokenSelect({
  value,
  onChange,
  exclude,
}: {
  value: SwapToken;
  onChange: (token: SwapToken) => void;
  exclude?: SwapToken;
}) {
  return (
    <Select
      value={value.symbol}
      onValueChange={(symbol) => {
        const token = SWAP_TOKENS.find((t) => t.symbol === symbol);
        if (token) onChange(token);
      }}
    >
      <SelectTrigger className="w-32 shrink-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SWAP_TOKENS.filter((t) => t.symbol !== exclude?.symbol).map((token) => (
          <SelectItem key={token.symbol} value={token.symbol}>
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: token.logoColor }}
              />
              {token.symbol}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
