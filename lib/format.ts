export function shortenAddress(address?: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * The contract returns several fields (pointValue_, roundEnteredUSD_, worth, etc.)
 * as pre-formatted `string` values rather than raw uint256. This only trims
 * trailing zeroes / normalizes so the UI doesn't show "12.000000" - it does not
 * invent or rescale any numbers.
 */
export function formatContractNumericString(value?: string): string {
  if (value === undefined || value === null || value === "") return "0";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  if (Number.isInteger(num)) return num.toLocaleString("en-US");
  return num.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export function explorerUrlFor(chainId: number, blockExplorerUrl?: string) {
  return process.env.NEXT_PUBLIC_EXPLORER_URL || blockExplorerUrl || "";
}

export function explorerAddressLink(chainId: number, blockExplorerUrl: string | undefined, address: string) {
  const base = explorerUrlFor(chainId, blockExplorerUrl);
  if (!base) return "";
  return `${base.replace(/\/$/, "")}/address/${address}`;
}

export function explorerTxLink(chainId: number, blockExplorerUrl: string | undefined, hash: string) {
  const base = explorerUrlFor(chainId, blockExplorerUrl);
  if (!base) return "";
  return `${base.replace(/\/$/, "")}/tx/${hash}`;
}
