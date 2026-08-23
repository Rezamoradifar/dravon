import { NextResponse } from "next/server";

// Node runtime - needs a real fetch with a timeout, not edge's stricter limits.
export const runtime = "nodejs";

const FEED_URL = "https://cointelegraph.com/rss";
const MAX_ITEMS = 12;
const FETCH_TIMEOUT_MS = 8000;
// Cointelegraph's own feed updates roughly hourly; re-fetching every 10
// minutes keeps the site feeling live without hammering their server.
const REVALIDATE_SECONDS = 600;

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  excerpt: string;
  image: string | null;
  category: string | null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function extractTag(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (!match) return null;
  const raw = match[1].trim();
  const cdata = raw.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return decodeEntities((cdata ? cdata[1] : raw).trim());
}

function extractAttr(block: string, tag: string, attr: string): string | null {
  const match = block.match(new RegExp(`<${tag}[^>]*\\b${attr}="([^"]*)"`, "i"));
  return match ? decodeEntities(match[1]) : null;
}

function parseRssItems(xml: string): NewsItem[] {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  return blocks.slice(0, MAX_ITEMS).map((block) => {
    const title = extractTag(block, "title") ?? "";
    const link = (extractTag(block, "link") ?? "").split("?")[0];
    const pubDate = extractTag(block, "pubDate") ?? "";
    const category = extractTag(block, "category");
    const image = extractAttr(block, "media:content", "url") ?? extractAttr(block, "enclosure", "url");

    const descriptionHtml = extractTag(block, "description") ?? "";
    const excerpt = decodeEntities(descriptionHtml.replace(/<[^>]+>/g, " "))
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);

    return { title, link, pubDate, excerpt, image, category };
  });
}

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(FEED_URL, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DravonNewsBot/1.0)" },
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, items: [], error: `Feed returned ${res.status}` }, { status: 502 });
    }

    const xml = await res.text();
    const items = parseRssItems(xml).filter((item) => item.title && item.link);

    return NextResponse.json({ ok: true, items, source: "Cointelegraph", fetchedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, items: [], error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
