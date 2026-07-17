import { HelpPageHeader } from "@/components/help/help-page-header";
import { HelpToc } from "@/components/help/help-toc";
import { HelpContent } from "@/components/help/help-content";

export const metadata = {
  title: "Help & User Guide - Round Dashboard",
  description: "How to use the Round Dashboard: wallet connection, registration, deposits, swap and more.",
};

export default function HelpPage() {
  return (
    <div>
      <HelpPageHeader />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <HelpToc />
        </aside>

        <div className="min-w-0 space-y-10">
          <HelpContent />
        </div>
      </div>
    </div>
  );
}
