"use client";

import { Vibrate, Volume2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHapticsSetting } from "@/hooks/useHapticsSetting";
import { useVoiceSetting } from "@/hooks/useVoiceSetting";
import { vibrate } from "@/lib/haptics";
import { speakWelcome } from "@/lib/voice";
import { useTranslation } from "@/contexts/language-context";

export function PreferencesCard() {
  const { enabled, setEnabled } = useHapticsSetting();
  const { enabled: voiceEnabled, setEnabled: setVoiceEnabled } = useVoiceSetting();
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
          <div className="flex items-center gap-2">
            {enabled && (
              <Button type="button" variant="ghost" size="sm" onClick={() => vibrate("success")}>
                {t("preferences.hapticsTest")}
              </Button>
            )}
            <Button
              type="button"
              variant={enabled ? "default" : "outline"}
              size="sm"
              onClick={() => setEnabled(!enabled)}
            >
              {enabled ? t("preferences.on") : t("preferences.off")}
            </Button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4 rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t("preferences.voice")}</p>
              <p className="text-xs text-muted-foreground">{t("preferences.voiceHint")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {voiceEnabled && (
              <Button type="button" variant="ghost" size="sm" onClick={() => speakWelcome()}>
                {t("preferences.voiceTest")}
              </Button>
            )}
            <Button
              type="button"
              variant={voiceEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
            >
              {voiceEnabled ? t("preferences.on") : t("preferences.off")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
