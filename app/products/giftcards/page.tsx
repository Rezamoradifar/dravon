"use client";

import { Gamepad2, Gift, Smartphone, Tv } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/language-context";

/**
 * Design-only preview - no catalog or payment wired up yet. Once real
 * Reloadly credentials are configured, this becomes a live product page the
 * same way app/products/vpn/page.tsx did: categories/prices will come from
 * the actual API response, never hardcoded, and a purchase flow will reuse
 * the same on-chain wallet-payment verification pattern as NodeShield.
 */
const CATEGORIES = [
  {
    id: "gaming",
    icon: Gamepad2,
    gradient: "from-[#3EFFE9] to-[#4880FF]",
    examples: [
      { label: "Steam", emoji: "🕹️" },
      { label: "PUBG Mobile UC", emoji: "🔫" },
    ],
  },
  {
    id: "subscriptions",
    icon: Tv,
    gradient: "from-[#4880FF] to-[#9C48FF]",
    examples: [
      { label: "Netflix", emoji: "🎬" },
      { label: "Spotify", emoji: "🎧" },
    ],
  },
  {
    id: "appstores",
    icon: Smartphone,
    gradient: "from-[#9C48FF] to-[#3EFFE9]",
    examples: [
      { label: "Google Play", emoji: "▶️" },
      { label: "App Store / iTunes", emoji: "🍏" },
    ],
  },
] as const;

export default function GiftCardsProductPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader title={t("giftCardsPage.title")} description={t("giftCardsPage.description")} />
      <NetworkBanner />

      <Card className="card-glow mb-6 border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3EFFE9] via-[#4880FF] to-[#9C48FF] text-2xl shadow-lg">
            🎁
          </span>
          <p className="font-medium">{t("giftCardsPage.notLive")}</p>
          <p className="max-w-md text-sm text-muted-foreground">{t("giftCardsPage.notLiveBody")}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Card
              key={category.id}
              className="card-glow group relative overflow-hidden transition-transform hover:-translate-y-1"
            >
              <div
                className={cn(
                  "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity group-hover:opacity-35",
                  category.gradient,
                )}
              />
              <CardContent className="relative space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md",
                      category.gradient,
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <Badge variant="outline">{t("giftCardsPage.comingSoon")}</Badge>
                </div>

                <h3 className="text-lg font-semibold">{t(`giftCardsPage.category.${category.id}`)}</h3>

                <div className="flex flex-wrap gap-2">
                  {category.examples.map((example) => (
                    <span
                      key={example.label}
                      className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
                    >
                      <span className="text-sm leading-none">{example.emoji}</span>
                      {example.label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Gift className="h-3.5 w-3.5" />
        {t("giftCardsPage.paymentNote")}
      </p>
    </div>
  );
}
