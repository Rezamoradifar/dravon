"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { zeroAddress } from "viem";

import { shortenAddress } from "@/lib/format";
import { CopyButton } from "@/components/shared/copy-button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/language-context";

export type GenealogyNodeData = {
  address: string;
  isRoot: boolean;
};

export function GenealogyTreeNode({ data }: NodeProps) {
  const { address, isRoot } = data as unknown as GenealogyNodeData;
  const { t } = useTranslation();
  const isEmpty = !address || address.toLowerCase() === zeroAddress;

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-xs shadow-sm",
        isRoot
          ? "border-primary bg-primary/10 font-semibold"
          : isEmpty
            ? "border-dashed border-border/60 bg-muted/30 text-muted-foreground"
            : "border-border bg-card",
      )}
      style={{ width: 168 }}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      {isEmpty ? (
        <span>{t("treeNode.emptySlot")}</span>
      ) : (
        <div className="flex items-center gap-1 font-mono">
          {shortenAddress(address)}
          <CopyButton value={address} />
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
}
