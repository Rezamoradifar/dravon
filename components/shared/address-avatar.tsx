"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { identiconDataUri } from "@/lib/identicon";
import { cn } from "@/lib/utils";

export function AddressAvatar({
  address,
  size = 40,
  className,
}: {
  address?: string;
  size?: number;
  className?: string;
}) {
  return (
    <Avatar className={cn("ring-1 ring-border", className)} style={{ width: size, height: size }}>
      {address && <AvatarImage src={identiconDataUri(address, size)} alt="" />}
      <AvatarFallback className="text-xs">?</AvatarFallback>
    </Avatar>
  );
}
