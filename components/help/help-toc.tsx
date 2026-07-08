"use client";

import { HELP_SECTIONS } from "@/lib/help-content";

export function HelpToc() {
  return (
    <nav className="sticky top-20 space-y-1 text-sm">
      {HELP_SECTIONS.map((section, i) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="block rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {i + 1}. {section.title}
        </a>
      ))}
    </nav>
  );
}
