/**
 * Free "learn to write prompts" resource library - one lesson per real file
 * the operator hands over (a PDF, a video, or any other downloadable file).
 * Nothing is fabricated here: entries only exist for files actually placed
 * in public/prompt-guide/. app/products/prompt-guide/page.tsx renders an
 * empty state instead of placeholder content while this is [].
 *
 * Chapters Two ("The Anatomy of a Professional Prompt") and Three ("Basic
 * Techniques") are listed in the overview booklet's table of contents but
 * haven't been sent as separate files yet - add them here the same way once
 * they are.
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

export const PROMPT_GUIDE_LESSONS: PromptGuideLesson[] = [
  {
    id: "overview",
    title: "Comprehensive Prompt Engineering Training Booklet (From Beginner to Professional)",
    description:
      "The full table of contents and chapter overview for the whole course - start here to see everything at a glance before diving into individual chapters.",
    type: "pdf",
    fileUrl: "/prompt-guide/00-booklet-overview.pdf",
  },
  {
    id: "chapter-01",
    title: "Chapter One: Fundamentals and Initial Mindset",
    description:
      "What a prompt actually is, how AI predicts tokens instead of \"thinking,\" why commands beat questions, and the Garbage-In-Garbage-Out rule.",
    type: "pdf",
    fileUrl: "/prompt-guide/01-fundamentals-and-mindset.pdf",
  },
  {
    id: "chapter-04",
    title: "Chapter Four: Advanced Techniques",
    description:
      "Chain of Thought, Tree of Thoughts, Self-Consistency, and conditional prompts - the core techniques of serious prompt engineering.",
    type: "pdf",
    fileUrl: "/prompt-guide/04-advanced-techniques.pdf",
  },
  {
    id: "chapter-05",
    title: "Chapter Five: Managing Roles and Writing Styles (Personification)",
    description:
      "Building a professional persona for the AI, imitating specific writers or brand voices, and adjusting explanations to the reader's knowledge level.",
    type: "pdf",
    fileUrl: "/prompt-guide/05-roles-and-writing-styles.pdf",
  },
  {
    id: "chapter-06",
    title: "Chapter Six: Prompt Writing for Specific Applications (Specialization)",
    description:
      "Applying prompts to content writing, programming and debugging, data analysis in Excel, and AI image generation (Midjourney/DALL-E).",
    type: "pdf",
    fileUrl: "/prompt-guide/06-specialized-applications.pdf",
  },
  {
    id: "chapter-07",
    title: "Chapter Seven: Conversation Engineering",
    description:
      "Sequential prompts, the \"ask the model\" technique, and managing the context window across long, multi-round conversations.",
    type: "pdf",
    fileUrl: "/prompt-guide/07-conversation-engineering.pdf",
  },
  {
    id: "chapter-08",
    title: "Chapter Eight: Debugging and Optimization",
    description:
      "Diagnosing why a prompt failed, the iterative-refinement technique, avoiding hallucinations, and A/B testing prompts.",
    type: "pdf",
    fileUrl: "/prompt-guide/08-debugging-and-optimization.pdf",
  },
  {
    id: "chapter-09",
    title: "Chapter Nine: Practical Projects and Conclusion",
    description:
      "Three hands-on projects (a business plan, a training course, a customer-support bot), a final pre-send checklist, and further resources.",
    type: "pdf",
    fileUrl: "/prompt-guide/09-practical-projects.pdf",
  },
];
