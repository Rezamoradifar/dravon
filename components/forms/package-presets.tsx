"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, PencilLine, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { shortenAddress } from "@/lib/format";
import type { RegisterPreset } from "@/hooks/useSavedPresets";

export function PackagePresets({
  presets,
  selectedIndex,
  onSelect,
  onApply,
  onRename,
}: {
  presets: RegisterPreset[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onApply: (preset: RegisterPreset) => void;
  onRename: (index: number, name: string) => void;
}) {
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        These are your own saved shortcuts (stored in this browser only) - not package data from the
        contract, which has no package/price registry. Fill the form, then &quot;Save as preset&quot;.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {presets.map((preset, index) => {
          const isConfigured = Boolean(preset.startBox && preset.valueBnb);
          const isSelected = selectedIndex === index;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
            >
              <Card
                role="button"
                tabIndex={0}
                onClick={() => {
                  onSelect(index);
                  if (isConfigured) onApply(preset);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSelect(index);
                    if (isConfigured) onApply(preset);
                  }
                }}
                className={cn(
                  "card-glow relative cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5",
                  isSelected && "ring-2 ring-primary",
                )}
              >
                {index === 1 && (
                  <span className="absolute right-3 top-3 z-10">
                    <Badge className="gap-1">
                      <Sparkles className="h-3 w-3" /> Popular slot
                    </Badge>
                  </span>
                )}
                <CardContent className="space-y-3 p-5">
                  {editingIndex === index ? (
                    <Input
                      autoFocus
                      defaultValue={preset.name}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={(e) => {
                        onRename(index, e.target.value || preset.name);
                        setEditingIndex(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold">{preset.name}</h3>
                      <button
                        type="button"
                        aria-label="Rename preset"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingIndex(index);
                        }}
                      >
                        <PencilLine className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {isConfigured ? (
                    <div className="space-y-1 text-sm">
                      <p className="text-2xl font-semibold">
                        {preset.valueBnb} <span className="text-sm text-muted-foreground">native</span>
                      </p>
                      <p className="text-xs text-muted-foreground">Start box #{preset.startBox}</p>
                      {preset.direct && (
                        <p className="text-xs text-muted-foreground">
                          Direct sponsor {shortenAddress(preset.direct)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Not configured yet - fill the form below and save it here.
                    </p>
                  )}

                  <Button
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className="w-full gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(index);
                      if (isConfigured) onApply(preset);
                    }}
                  >
                    {isSelected && <CheckCircle2 className="h-4 w-4" />}
                    {isConfigured ? "Use this preset" : "Select as save target"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
