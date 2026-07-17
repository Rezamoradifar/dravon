"use client";

import { Vibrate } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHapticsSetting } from "@/hooks/useHapticsSetting";
import { useTranslation } from "@/contexts/language-context";

export function PreferencesCard() {
  const { enabled, setEnabled } = useHapticsSetting();
  const { t } = useTranslation();

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>{t("preferences.title")}</CardTitle>
        <CardDescription>{t("preferences.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <Vibrate className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t("preferences.haptics")}</p>
              <p className="text-xs text-muted-foreground">{t("preferences.hapticsHint")}</p>
            </div>
          </div>
          <Button
            type="button"
            variant={enabled ? "default" : "outline"}
            size="sm"
            onClick={() => setEnabled(!enabled)}
          >
            {enabled ? t("preferences.on") : t("preferences.off")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
