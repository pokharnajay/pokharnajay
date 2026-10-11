import type { MetadataRoute } from "next";
import { SITE_URL, site } from "@/lib/site";
import { getCaseStudies, lastModified } from "@/lib/work";
import { getPosts } from "@/lib/writing";

export default function sitemap(): MetadataRoute.Sitemap {
  const studies = getCaseStudies();
  const posts = getPosts();
  const newest = (dates: string[]) => dates.sort().at(-1);
  const workUpdated = newest(studies.map(lastModified));

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: site.updated, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/work`, lastModified: workUpdated, changeFrequency: "monthly", priority: 0.9 },
    ...studies.map((c) => ({
      url: `${SITE_URL}/work/${c.slug}`,
      lastModified: lastModified(c),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
  if (posts.length) {
    entries.push({ url: `${SITE_URL}/writing`, lastModified: newest(posts.map(lastModified)), changeFrequency: "weekly", priority: 0.6 });
    posts.forEach((p) => entries.push({ url: `${SITE_URL}/writing/${p.slug}`, lastModified: lastModified(p), changeFrequency: "yearly", priority: 0.6 }));
  }
  return entries;
}
