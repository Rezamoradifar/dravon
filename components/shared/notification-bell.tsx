"use client";

import { Bell, Gift, Users, CheckCircle2, XCircle } from "lucide-react";
import { useAccount } from "wagmi";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";
import { useTranslation } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import type { NotificationKind } from "@/lib/notifications";

const ICONS: Record<NotificationKind, typeof Gift> = {
  reward: Gift,
  referral: Users,
  "tx-confirmed": CheckCircle2,
  "tx-failed": XCircle,
};

export function NotificationBell() {
  const { address } = useAccount();
  const { entries, unreadCount, markAllRead } = useNotifications(address);
  const { t } = useTranslation();

  if (!address) return null;

  return (
    <DropdownMenu onOpenChange={(open) => open && markAllRead()}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative" aria-label={t("notifications.title")}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{t("notifications.title")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {entries.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">{t("notifications.empty")}</p>
        ) : (
          <div className="max-h-80 space-y-1 overflow-y-auto p-1">
            {entries.map((entry) => {
              const Icon = ICONS[entry.kind];
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-start gap-2 rounded-md p-2 text-sm",
                    !entry.read && "bg-accent/50",
                  )}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="font-medium">{t(entry.titleKey)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t(entry.bodyKey, entry.bodyParams)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
