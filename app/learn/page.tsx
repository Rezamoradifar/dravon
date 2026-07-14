"use client";

import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/learn/risk-badge";
import { LEARNING_TOPICS } from "@/lib/learning-content";
import { useTranslation } from "@/contexts/language-context";

export default function LearningCenterPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("learnPage.title")}
        description={t("learnPage.description")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEARNING_TOPICS.map((topic) => (
          <Link key={topic.slug} href={`/learn/${topic.slug}`}>
            <Card className="card-glow h-full transition-transform hover:-translate-y-0.5">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                  <RiskBadge level={topic.riskLevel} />
                </div>
                <CardDescription>{topic.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-sm text-primary">
                  {t("learnPage.readMore")} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}

        <Link href="/learn/simulator">
          <Card className="card-glow h-full border-dashed transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FlaskConical className="h-5 w-5" /> {t("learnPage.simulatorTitle")}
              </CardTitle>
              <CardDescription>{t("learnPage.simulatorDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="gap-1">
                {t("learnPage.openSimulator")} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
