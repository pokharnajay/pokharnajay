import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Diagram from "@/components/work/Diagram";
import { ReadingProgress, TocSpy } from "@/components/work/client";
import { mdxComponents } from "@/components/work/mdx-components";
import { CaseRow, CtaBand, MetricsStrip } from "@/components/work/parts";
import { JsonLd, PERSON_ID, breadcrumbSchema } from "@/lib/jsonld";
import { renderMdx } from "@/lib/mdx";
import { absoluteUrl, sameAs, site } from "@/lib/site";
import { CATEGORIES, formatMonth, getAdjacent, getCaseStudies, getCaseStudy, getRelated, lastModified } from "@/lib/work";

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
    ...(c.draft ? { robots: { index: false, follow: false } } : {}),
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
    { name: "Case studies", path: "/work" },
    { name: category, path: `/work?category=${c.category}` },
    { name: c.title, path: `/work/${c.slug}` },
  ]);

  return (
    <main id="main" className="cs-page">
      <JsonLd data={[article, crumbs]} />
      <ReadingProgress />

      <header className="wrap cs-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/work">Case studies</Link></li>
            <li><Link href={`/work?category=${c.category}`}>{category}</Link></li>
            <li aria-current="page"><span>{c.title}</span></li>
          </ol>
        </nav>

        <div className="case-row-meta">
          <span className={"tag" + (c.category === "ai-agents" ? " is-green" : "")}>{category}</span>
          <span className="case-row-date">{formatMonth(c.date)}</span>
          <span className="case-row-date">{c.readingTime} min read</span>
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
        <section className="wrap cs-visual" aria-label="Architecture">
          <Diagram data={c.diagram} id={c.slug} />
        </section>
      ) : null}

      <div className="wrap cs-layout">
        <details className="toc-mobile">
          <summary>Contents</summary>
          <TocList toc={c.toc} />
        </details>

        <article className="prose" data-article>
          {content}
          <p className="nda-note">Details anonymised; client identity withheld under NDA.</p>
        </article>

        <aside className="toc" aria-label="On this page">
          <div className="toc-label">On this page</div>
          <TocList toc={c.toc} />
          <a href={`mailto:${site.email}`} className="text-link toc-cta">Discuss a similar build</a>
        </aside>
        <TocSpy />
      </div>

      <nav className="wrap cs-pager" aria-label="More case studies">
        {prev ? (
          <Link href={`/work/${prev.slug}`} className="pager-card prev">
            <span className="k">Previous case study</span>
            <span className="t">{prev.title}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/work/${next.slug}`} className="pager-card next">
            <span className="k">Next case study</span>
            <span className="t">{next.title}</span>
          </Link>
        ) : <span />}
      </nav>

      {related.length ? (
        <section className="wrap cs-related" aria-labelledby="related-title">
          <div className="related-head">
            <h2 id="related-title" className="h-section related-title">Related work</h2>
            <Link href="/work" className="text-link">All case studies</Link>
          </div>
          <div className="case-list">
            {related.map((r) => (
              <CaseRow key={r.slug} c={r} headingLevel="h3" />
            ))}
          </div>
        </section>
      ) : null}

      <div className="wrap">
        <CtaBand />
      </div>
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
