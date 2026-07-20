"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Dices, Link2, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/language-context";

const ONCHAIN_BACKGAMMON_URL = process.env.NEXT_PUBLIC_ONCHAIN_BACKGAMMON_URL;

export default function GamesPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader title={t("gamesPage.title")} description={t("gamesPage.description")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card className="card-glow flex h-full flex-col">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Dices className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">{t("gamesPage.backgammonName")}</CardTitle>
                <CardDescription>{t("gamesPage.backgammonTagline")}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button asChild className="w-full">
                <Link href="/games/backgammon">{t("gamesPage.playFree")}</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <Card className="card-glow flex h-full flex-col">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">{t("gamesPage.onchainBackgammonName")}</CardTitle>
                <CardDescription>{t("gamesPage.onchainBackgammonTagline")}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="mt-auto">
              {ONCHAIN_BACKGAMMON_URL ? (
                <Button asChild className="w-full">
                  <a href={ONCHAIN_BACKGAMMON_URL} target="_blank" rel="noopener noreferrer">
                    {t("gamesPage.playOnChain")}
                  </a>
                </Button>
              ) : (
                <Button className="w-full" disabled>
                  {t("gamesPage.onchainComingSoon")}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mt-4"
      >
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          {t("gamesPage.hint")}
        </div>
      </motion.div>
    </div>
  );
}
