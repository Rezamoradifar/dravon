"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/language-context";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm,
  isLoading,
  destructive,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  destructive?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            {t("sharedComponents.cancel")}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={isLoading}
            onClick={async () => {
              await onConfirm();
              setOpen(false);
            }}
          >
            {isLoading ? t("sharedComponents.processing") : confirmLabel ?? t("sharedComponents.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
