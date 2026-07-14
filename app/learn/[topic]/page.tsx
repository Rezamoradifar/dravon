import { notFound } from "next/navigation";

import { LearnTopicView } from "@/components/learn/learn-topic-view";
import { LEARNING_TOPICS } from "@/lib/learning-content";

export function generateStaticParams() {
  return LEARNING_TOPICS.map((topic) => ({ topic: topic.slug }));
}

export default async function LearningTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = await params;
  if (!LEARNING_TOPICS.some((t) => t.slug === slug)) notFound();

  return <LearnTopicView slug={slug} />;
}
