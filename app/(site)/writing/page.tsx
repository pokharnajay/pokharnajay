import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/work/parts";
import { JsonLd, PERSON_ID, WEBSITE_ID } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/site";
import { formatMonth } from "@/lib/work";
import { getPosts } from "@/lib/writing";

const DESCRIPTION = "Notes on building LLM agents, RAG systems and production automations: what worked, what broke, and why.";

export function generateMetadata(): Metadata {
  const hasPosts = getPosts().length > 0;
  return {
    title: "Writing",
    description: DESCRIPTION,
    alternates: { canonical: "/writing", types: { "application/rss+xml": "/writing/rss.xml" } },
    openGraph: { url: "/writing", title: "Writing | Jay Pokharna", description: DESCRIPTION },
    // An empty index is thin content: keep it out of search until posts exist.
    robots: hasPosts ? undefined : { index: false, follow: true },
  };
}

export default function WritingIndex() {
  const posts = getPosts();
  const blog = {
    "@type": "Blog",
    "@id": absoluteUrl("/writing#blog"),
    url: absoluteUrl("/writing"),
    name: "Writing — Jay Pokharna",
    description: DESCRIPTION,
    isPartOf: { "@id": WEBSITE_ID },
    author: { "@id": PERSON_ID },
  };
  return (
    <main id="main" className="work-page">
      <JsonLd data={blog} />
      <header className="work-hero">
        <div className="eyebrow"><span className="dot" aria-hidden="true"></span> Writing / notes from production</div>
        <h1 className="work-h1">Notes, <em>unpolished</em>.</h1>
        <p className="work-intro">{DESCRIPTION}</p>
      </header>

      {posts.length ? (
        <ol className="post-list">
          {posts.map((p) => (
            <li key={p.slug} className="post-row" data-reveal>
              <span className="post-date">{formatMonth(p.date)}</span>
              <div>
                <h2 className="post-title">
                  <Link href={`/writing/${p.slug}`} className="stretched">{p.title}</Link>
                  {p.draft ? <span className="draft-badge">Draft</span> : null}
                </h2>
                <p className="post-summary">{p.summary}</p>
              </div>
              <span className="case-arrow" aria-hidden="true">→</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="post-empty">
          First posts are on the way. Meanwhile, the <Link href="/work">case studies</Link> go deep on real builds.
        </p>
      )}
      <CtaBand />
    </main>
  );
}
