import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Network, Boxes } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/learn/risk-badge";
import { WorkflowDiagram } from "@/components/learn/workflow-diagram";
import { LEARNING_TOPICS, getTopic } from "@/lib/learning-content";

export function generateStaticParams() {
  return LEARNING_TOPICS.map((topic) => ({ topic: topic.slug }));
}

export default async function LearningTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  return (
    <div>
      <Link href="/learn" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Learning Center
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{topic.title}</h1>
        <RiskBadge level={topic.riskLevel} />
      </div>
      <p className="mb-8 max-w-2xl text-muted-foreground">{topic.summary}</p>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Network className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Illustrative networks</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {topic.supportedNetworks.map((n) => (
              <Badge key={n} variant="outline">{n}</Badge>
            ))}
          </CardContent>
        </Card>
        {topic.supportedDexes.length > 0 && (
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <Boxes className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Illustrative venues</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {topic.supportedDexes.map((d) => (
                <Badge key={d} variant="outline">{d}</Badge>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <h2 className="mb-3 text-lg font-semibold">How it works</h2>
      <div className="mb-8">
        <WorkflowDiagram steps={topic.workflow} />
      </div>

      <h2 className="mb-3 text-lg font-semibold">Explanation</h2>
      <div className="mb-8 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {topic.explanation.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold">FAQ</h2>
      <div className="mb-8 space-y-3">
        {topic.faq.map((item) => (
          <Card key={item.question}>
            <CardContent className="p-4">
              <p className="font-medium">{item.question}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-muted-foreground">
            Want to see the math with numbers you control?
          </p>
          <Button asChild size="sm">
            <Link href="/learn/simulator">Open the simulator</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
