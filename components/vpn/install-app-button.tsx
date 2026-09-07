"use client";

import * as React from "react";
import { Download, Share } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/language-context";

/**
 * "Install app" affordance for the NodeShield PWA (see public/manifest.webmanifest).
 * Android/Chrome fires `beforeinstallprompt`, which we capture and trigger
 * on tap. iOS Safari never fires that event - there's no programmatic
 * install API there, only the manual Share -> Add to Home Screen flow - so
 * iOS gets a short instruction instead of a button that would do nothing.
 * Renders nothing once already installed (standalone display mode).
 */
export function InstallAppButton() {
  const { t } = useTranslation();
  const [installEvent, setInstallEvent] = React.useState<Event | null>(null);
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [isIos, setIsIos] = React.useState(false);

  React.useEffect(() => {
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true,
    );
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setInstallEvent(e);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  if (isStandalone) return null;

  if (installEvent) {
    return (
      <div className="mb-6 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={async () => {
            const promptEvent = installEvent as Event & {
              prompt: () => Promise<void>;
              userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
            };
            await promptEvent.prompt();
            await promptEvent.userChoice;
            setInstallEvent(null);
          }}
        >
          <Download className="h-3.5 w-3.5" />
          {t("vpnPage.installAppCta")}
        </Button>
      </div>
    );
  }

  if (isIos) {
    return (
      <p className="mb-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Share className="h-3.5 w-3.5 shrink-0" />
        {t("vpnPage.installAppIosHint")}
      </p>
    );
  }

  return null;
}
