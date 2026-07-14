"use client";

import { PlayCircle } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnnouncementSlider } from "@/components/news/announcement-slider";
import { ANNOUNCEMENTS, NEWS_CARDS } from "@/lib/news-content";
import { useTranslation } from "@/contexts/language-context";

export default function NewsPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader title={t("newsPage.title")} description={t("newsPage.description")} />

      <div className="mb-8">
        <AnnouncementSlider items={ANNOUNCEMENTS} />
      </div>

      <h2 className="mb-3 text-lg font-semibold">{t("newsPage.updates")}</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NEWS_CARDS.map((card) => (
          <Card key={card.title} className="card-glow">
            <CardHeader>
              <CardTitle className="text-base">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold">{t("newsPage.videoWalkthrough")}</h2>
      <Card className="card-glow mb-8 border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <PlayCircle className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">{t("newsPage.videoComingSoon")}</p>
          <p className="max-w-sm text-sm text-muted-foreground">{t("newsPage.videoComingSoonBody")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
