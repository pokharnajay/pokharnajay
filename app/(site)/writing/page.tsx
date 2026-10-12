import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, CtaBand } from "@/components/work/parts";
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
    ...(hasPosts ? {} : { robots: { index: false, follow: true } }),
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
      <header className="wrap work-hero">
        <h1 className="h-display work-h1">Writing</h1>
        <p className="lead">{DESCRIPTION}</p>
      </header>
      <div className="wrap">

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
              <span className="case-row-arrow" aria-hidden="true"><Arrow /></span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="post-empty">
          First posts are on the way. Meanwhile, the <Link href="/work">case studies</Link> go deep on real builds.
        </p>
      )}
      <CtaBand />
      </div>
    </main>
  );
}
