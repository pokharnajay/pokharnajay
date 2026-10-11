import type { Metadata } from "next";
import Link from "next/link";
import Diagram from "@/components/work/Diagram";
import { WorkFilters } from "@/components/work/client";
import { CaseCard, CategoryLabel, CtaBand } from "@/components/work/parts";
import { JsonLd, PERSON_ID, WEBSITE_ID, breadcrumbSchema } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/site";
import { CATEGORIES, formatMonth, getCaseStudies, pad2, type Category } from "@/lib/work";

const TITLE = "Work & Case Studies — AI Agents, RAG & Automation";
const DESCRIPTION =
  "Case studies of LLM agents, RAG systems and production automations I've built with Python, TypeScript, n8n and Make.com.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/work", types: { "application/rss+xml": "/work/rss.xml" } },
  openGraph: { type: "website", url: "/work", title: `${TITLE} | Jay Pokharna`, description: DESCRIPTION },
  twitter: { title: `${TITLE} | Jay Pokharna`, description: DESCRIPTION },
};

export default function WorkPage() {
  const studies = getCaseStudies();
  const featured = studies.find((c) => c.featured) ?? studies[0];
  const rest = studies.filter((c) => c !== featured);
  const year = new Date().getFullYear();
  const categories = (Object.keys(CATEGORIES) as Category[])
    .map((key) => ({ key, label: CATEGORIES[key], count: studies.filter((c) => c.category === key).length }))
    .filter((c) => c.count > 0);

  const collection = {
    "@type": "CollectionPage",
    "@id": absoluteUrl("/work#page"),
    url: absoluteUrl("/work"),
    name: TITLE,
    description: DESCRIPTION,
    isPartOf: { "@id": WEBSITE_ID },
    author: { "@id": PERSON_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: studies.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/work/${c.slug}`),
        name: c.title,
      })),
    },
  };

  return (
    <main id="main" className="work-page">
      <JsonLd data={[collection, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])]} />

      <header className="work-hero">
        <div className="eyebrow">
          <span className="dot" aria-hidden="true"></span> Selected work / {year}
        </div>
        <h1 className="work-h1">
          Things I&rsquo;ve <em>shipped</em>.
        </h1>
        <p className="work-intro">
          LLM agents, document pipelines and production automations for clients across the US, the UK and Europe. Client names withheld under NDA.
        </p>
        <p className="work-stats">
          {pad2(studies.length)} case studies · {categories.map((c) => c.label.toLowerCase()).join(" · ")}
        </p>
      </header>

      <WorkFilters categories={categories} />

      {featured ? (
        <article className="featured-case" data-category={featured.category} data-reveal>
          <div className="featured-copy">
            <div className="case-card-top">
              <span className="case-num">{pad2(featured.number)}</span>
              <span className="case-eyebrow">
                Featured · <CategoryLabel c={featured} /> · {formatMonth(featured.date)}
              </span>
            </div>
            <h2 className="featured-title">
              <Link href={`/work/${featured.slug}`}>{featured.title}</Link>
            </h2>
            <p className="featured-summary">{featured.summary}</p>
            {featured.metrics.length ? (
              <dl className="featured-metrics">
                {featured.metrics.map((m) => (
                  <div key={m.label}>
                    <dt>{m.label}</dt>
                    <dd>{m.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <ul className="case-stack" aria-label="Stack">
              {featured.stack.slice(0, 6).map((s) => (
                <li key={s} className="chip">{s}</li>
              ))}
            </ul>
            <Link href={`/work/${featured.slug}`} className="btn primary featured-cta" aria-hidden="true" tabIndex={-1}>
              Read case study <span className="arrow">→</span>
            </Link>
          </div>
          {featured.diagram ? (
            <div className="featured-visual" aria-hidden="true">
              <Diagram data={featured.diagram} id={`featured-${featured.slug}`} compact />
            </div>
          ) : null}
        </article>
      ) : null}

      <section className="case-grid" aria-label="All case studies">
        {rest.map((c) => (
          <CaseCard key={c.slug} c={c} />
        ))}
        <p className="grid-empty" data-grid-empty hidden>
          The featured case study above is the only one in this category so far.
        </p>
      </section>

      <CtaBand />
    </main>
  );
}
