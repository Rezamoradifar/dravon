import type { AssistantEntry } from "@/lib/assistant-knowledge";

// Small enough to not need a search library: tokenize the query and each
// entry's question+answer, score by how many meaningful (non-stopword)
// tokens overlap. Good enough for "does this question roughly match one of
// ~40 known FAQ entries" - not a general-purpose search problem.
const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "do", "does", "i", "my", "to", "of", "on", "in", "for", "what", "how", "why",
  "can", "it", "this", "that", "and", "or", "with", "you", "your", "if", "not", "be", "was", "were",
  "را", "به", "از", "که", "و", "یا", "این", "آن", "چی", "چیه", "چطور", "چرا", "با", "برای", "می", "شود", "میشه",
  "هست", "هستم", "کن", "کنم", "من", "خودم", "تو",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((tok) => tok.length > 1 && !STOPWORDS.has(tok));
}

export interface AssistantMatch extends AssistantEntry {
  score: number;
}

export function searchAssistant(query: string, entries: AssistantEntry[], limit = 3): AssistantMatch[] {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return [];

  const scored = entries.map((entry) => {
    const haystack = tokenize(`${entry.question} ${entry.answer}`);
    let score = 0;
    for (const tok of haystack) {
      if (queryTokens.has(tok)) score += 1;
    }
    // Extra weight for matches in the question itself - more likely to be the actual topic.
    const questionTokens = tokenize(entry.question);
    for (const tok of questionTokens) {
      if (queryTokens.has(tok)) score += 2;
    }
    return { ...entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
