import { notFound } from "next/navigation";

import { LearnTopicView } from "@/components/learn/learn-topic-view";
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

  return <LearnTopicView topic={topic} />;
}
