"use client";

import { motion } from "framer-motion";
import { Gamepad2, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/contexts/language-context";

export default function GamesPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader title={t("gamesPage.title")} description={t("gamesPage.description")} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="card-glow">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Gamepad2 className="h-7 w-7" />
            </div>
            <p className="text-lg font-semibold">{t("gamesPage.comingSoonTitle")}</p>
            <p className="max-w-md text-sm text-muted-foreground">{t("gamesPage.comingSoonBody")}</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              {t("gamesPage.hint")}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
