import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/learn/risk-badge";
import { LEARNING_TOPICS } from "@/lib/learning-content";

export default function LearningCenterPage() {
  return (
    <div>
      <PageHeader
        title="Learning Center"
        description="Educational explanations of on-chain trading concepts. No financial advice, no return promises - illustration only."
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
                  Read more <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}

        <Link href="/learn/simulator">
          <Card className="card-glow h-full border-dashed transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FlaskConical className="h-5 w-5" /> Arbitrage Simulator
              </CardTitle>
              <CardDescription>
                A hands-on, fully simulated demo of borrow → swap → repay math. No real transactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="gap-1">
                Open simulator <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
