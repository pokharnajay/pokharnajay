import { SITE_URL, site } from "@/lib/site";
import { getCaseStudies } from "@/lib/work";

export const dynamic = "force-static";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export function GET() {
  const items = [...getCaseStudies()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((c) => {
      const url = `${SITE_URL}/work/${c.slug}`;
      return `    <item>
      <title>${esc(c.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${c.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(c.summary)}</description>
      <category>${esc(c.category)}</category>
    </item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${site.name} — Case studies`)}</title>
    <link>${SITE_URL}/work</link>
    <description>${esc("Case studies of LLM agents, RAG systems and production automations.")}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/work/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
