"use client";

import { BookOpen, Download, FileText, Video } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { NetworkBanner } from "@/components/shared/network-banner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/contexts/language-context";
import { PROMPT_GUIDE_LESSONS, type PromptGuideLessonType } from "@/lib/prompt-guide-content";

const TYPE_ICON: Record<PromptGuideLessonType, typeof FileText> = {
  pdf: FileText,
  video: Video,
  file: Download,
};

export default function PromptGuideProductPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader title={t("promptGuidePage.title")} description={t("promptGuidePage.description")} />
      <NetworkBanner />

      {PROMPT_GUIDE_LESSONS.length === 0 ? (
        <Card className="card-glow border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3EFFE9] via-[#4880FF] to-[#9C48FF] text-2xl shadow-lg">
              <BookOpen className="h-7 w-7 text-white" />
            </span>
            <p className="font-medium">{t("promptGuidePage.emptyState")}</p>
            <p className="max-w-md text-sm text-muted-foreground">{t("promptGuidePage.emptyStateBody")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROMPT_GUIDE_LESSONS.map((lesson) => {
            const Icon = TYPE_ICON[lesson.type];
            return (
              <Card key={lesson.id} className="card-glow flex flex-col">
                <CardContent className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3EFFE9] via-[#4880FF] to-[#9C48FF] text-white shadow-md">
                      <Icon className="h-5 w-5" />
                    </span>
                    <Badge variant="outline" className="uppercase">
                      {lesson.type}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold">{lesson.title}</h3>
                  <p className="flex-1 text-sm text-muted-foreground">{lesson.description}</p>
                  <a
                    href={lesson.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    <Download className="h-4 w-4" />
                    {t("promptGuidePage.open")}
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
