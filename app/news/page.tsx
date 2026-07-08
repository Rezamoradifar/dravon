import { PlayCircle } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnnouncementSlider } from "@/components/news/announcement-slider";
import { ANNOUNCEMENTS, NEWS_CARDS } from "@/lib/news-content";

export default function NewsPage() {
  return (
    <div>
      <PageHeader title="News & Announcements" description="What's new in this dashboard, and what's coming next." />

      <div className="mb-8">
        <AnnouncementSlider items={ANNOUNCEMENTS} />
      </div>

      <h2 className="mb-3 text-lg font-semibold">Updates</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NEWS_CARDS.map((card) => (
          <Card key={card.title} className="card-glow">
            <CardHeader>
              <CardTitle className="text-base">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold">Video Walkthrough</h2>
      <Card className="card-glow mb-8 border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <PlayCircle className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">Video walkthrough coming soon</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            No video has been produced yet - this space is reserved and clearly marked rather than
            filled with a placeholder video.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
