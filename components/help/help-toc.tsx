"use client";

import { getLocalizedHelpSections } from "@/lib/help-content";
import { useTranslation } from "@/contexts/language-context";

export function HelpToc() {
  const { locale } = useTranslation();
  const sections = getLocalizedHelpSections(locale);

  return (
    <nav className="sticky top-20 space-y-1 text-sm">
      {sections.map((section, i) => (
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
