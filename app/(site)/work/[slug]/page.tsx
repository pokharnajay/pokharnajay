import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Diagram from "@/components/work/Diagram";
import { ReadingProgress, TocSpy } from "@/components/work/client";
import { mdxComponents } from "@/components/work/mdx-components";
import { CaseCard, CtaBand, MetricsStrip } from "@/components/work/parts";
import { JsonLd, PERSON_ID, breadcrumbSchema } from "@/lib/jsonld";
import { renderMdx } from "@/lib/mdx";
import { absoluteUrl, sameAs, site } from "@/lib/site";
import { CATEGORIES, formatMonth, getAdjacent, getCaseStudies, getCaseStudy, getRelated, lastModified, pad2 } from "@/lib/work";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCaseStudies().map((c) => ({ slug: c.slug }));
}

const pageTitle = (title: string, seoTitle?: string) => {
  const base = seoTitle ?? title;
  const short = base.length > 50 ? base.slice(0, 49).replace(/\s+\S*$/, "") + "…" : base;
  return `${short} | Case study`;
};

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = getCaseStudy(params.slug);
  if (!c) return {};
  const title = pageTitle(c.title, c.seoTitle);
  const url = `/work/${c.slug}`;
  return {
    title,
    description: c.summary,
    keywords: c.keywords,
    alternates: { canonical: url, types: { "application/rss+xml": "/work/rss.xml" } },
    openGraph: {
      type: "article",
      url,
      title: `${title} | ${site.name}`,
      description: c.summary,
      publishedTime: c.date,
      modifiedTime: lastModified(c),
      authors: [absoluteUrl("/")],
      tags: c.stack,
    },
    twitter: { title: `${title} | ${site.name}`, description: c.summary },
    robots: c.draft ? { index: false, follow: false } : undefined,
  };
}

export default async function CaseStudyPage({ params }: { params: { slug: string } }) {
  const c = getCaseStudy(params.slug);
  if (!c) notFound();
  const content = await renderMdx(c.body, mdxComponents);
  const { prev, next } = getAdjacent(c.slug);
  const related = getRelated(c.slug, 2);
  const category = CATEGORIES[c.category];
  const url = absoluteUrl(`/work/${c.slug}`);

  const article = {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: c.title,
    description: c.summary,
    url,
    mainEntityOfPage: url,
    datePublished: c.date,
    dateModified: lastModified(c),
    author: { "@type": "Person", "@id": PERSON_ID, name: site.name, url: absoluteUrl("/"), sameAs },
    publisher: { "@id": PERSON_ID },
    image: `${url}/opengraph-image`,
    keywords: [...(c.keywords ?? []), ...c.stack].join(", "),
    articleSection: category,
    wordCount: c.words,
    inLanguage: "en",
  };
  const crumbs = breadcrumbSchema([
    { name: "Work", path: "/work" },
    { name: category, path: `/work?category=${c.category}` },
    { name: c.title, path: `/work/${c.slug}` },
  ]);

  return (
    <main id="main" className="cs-page">
      <JsonLd data={[article, crumbs]} />
      <ReadingProgress />

      <header className="cs-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/work">Work</Link></li>
            <li><Link href={`/work?category=${c.category}`}>{category}</Link></li>
            <li aria-current="page"><span>{c.title}</span></li>
          </ol>
        </nav>

        <div className="eyebrow">
          <span className="dot" aria-hidden="true"></span>
          Case {pad2(c.number)} / {category} · {formatMonth(c.date)} · {c.readingTime} min read
          {c.draft ? <span className="draft-badge">Draft</span> : null}
        </div>
        <h1 className="cs-h1">{c.title}</h1>
        <p className="cs-summary">{c.summary}</p>

        <dl className="cs-meta">
          <div><dt>Client</dt><dd>{c.clientType}</dd></div>
          <div><dt>Role</dt><dd>{c.role}</dd></div>
          <div><dt>Duration</dt><dd>{c.duration}</dd></div>
          <div><dt>Stack</dt><dd>{c.stack.slice(0, 4).join(", ")}{c.stack.length > 4 ? ` +${c.stack.length - 4}` : ""}</dd></div>
        </dl>

        <MetricsStrip metrics={c.metrics} />
      </header>

      {c.diagram ? (
        <section className="cs-visual" aria-label="Architecture">
          <Diagram data={c.diagram} id={c.slug} />
        </section>
      ) : null}

      <div className="cs-layout">
        <details className="toc-mobile">
          <summary>Contents</summary>
          <TocList toc={c.toc} />
        </details>

        <article className="prose" data-article>
          {content}
          <p className="nda-note">
            <span className="dot" aria-hidden="true"></span>
            Details anonymised; client identity withheld under NDA.
          </p>
        </article>

        <aside className="toc" aria-label="On this page">
          <div className="toc-label">On this page</div>
          <TocList toc={c.toc} />
          <a href={`mailto:${site.email}`} className="toc-cta">Discuss a similar build →</a>
        </aside>
        <TocSpy />
      </div>

      <nav className="cs-pager" aria-label="More case studies">
        {prev ? (
          <Link href={`/work/${prev.slug}`} className="pager-card prev">
            <span className="k">← Previous</span>
            <span className="t">{prev.title}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/work/${next.slug}`} className="pager-card next">
            <span className="k">Next →</span>
            <span className="t">{next.title}</span>
          </Link>
        ) : <span />}
      </nav>

      {related.length ? (
        <section className="cs-related" aria-labelledby="related-title">
          <div className="related-head">
            <h2 id="related-title" className="related-title">Related <em>work</em></h2>
            <Link href="/work" className="scene-link">All case studies →</Link>
          </div>
          <div className="case-grid">
            {related.map((r) => (
              <CaseCard key={r.slug} c={r} headingLevel="h3" />
            ))}
          </div>
        </section>
      ) : null}

      <CtaBand />
    </main>
  );
}

function TocList({ toc }: { toc: { id: string; text: string; depth: 2 | 3 }[] }) {
  return (
    <ol className="toc-list">
      {toc.map((t) => (
        <li key={t.id} className={t.depth === 3 ? "is-sub" : undefined}>
          <a href={`#${t.id}`}>{t.text}</a>
        </li>
      ))}
    </ol>
  );
}
