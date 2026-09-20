/**
 * Free "learn to write prompts" resource library - one lesson per real file
 * the operator hands over (a PDF, a video, or any other downloadable file).
 * Nothing is fabricated here: this list starts empty and only grows as real
 * files are added to public/prompt-guide/ and an entry below points at
 * them. app/products/prompt-guide/page.tsx renders an empty state instead
 * of placeholder content while this is [].
 */
export type PromptGuideLessonType = "pdf" | "video" | "file";

export interface PromptGuideLesson {
  id: string;
  title: string;
  description: string;
  type: PromptGuideLessonType;
  /** Path under public/ (e.g. "/prompt-guide/lesson-1.pdf") or a full URL. */
  fileUrl: string;
}

export const PROMPT_GUIDE_LESSONS: PromptGuideLesson[] = [];
