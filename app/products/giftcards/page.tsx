"use client";

import { Gamepad2, Gift, Smartphone, Tv } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/language-context";

/**
 * Design-only preview - no catalog or payment wired up yet. Once real
 * Reloadly credentials are configured, this becomes a live product page the
 * same way app/products/vpn/page.tsx did: categories/prices will come from
 * the actual API response, never hardcoded, and a purchase flow will reuse
 * the same on-chain wallet-payment verification pattern as NodeShield.
 */
const CATEGORIES = [
  { id: "gaming", icon: Gamepad2, examples: ["Steam", "PUBG Mobile UC"] },
  { id: "subscriptions", icon: Tv, examples: ["Netflix", "Spotify"] },
  { id: "appstores", icon: Smartphone, examples: ["Google Play", "App Store / iTunes"] },
] as const;

export default function GiftCardsProductPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader title={t("giftCardsPage.title")} description={t("giftCardsPage.description")} />
      <NetworkBanner />

      <Card className="card-glow mb-6 border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <Gift className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">{t("giftCardsPage.notLive")}</p>
          <p className="max-w-md text-sm text-muted-foreground">{t("giftCardsPage.notLiveBody")}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.id} className="card-glow opacity-80">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <Icon className="h-6 w-6 text-primary" />
                  <Badge variant="outline">{t("giftCardsPage.comingSoon")}</Badge>
                </div>
                <h3 className="font-semibold">{t(`giftCardsPage.category.${category.id}`)}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {category.examples.map((example) => (
                    <span key={example} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                      {example}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">{t("giftCardsPage.paymentNote")}</p>
    </div>
  );
}
