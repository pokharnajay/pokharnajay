import type { Metadata } from "next";
import { WorkFilters } from "@/components/work/client";
import { CaseRow, CtaBand, FeaturedCase } from "@/components/work/parts";
import { JsonLd, PERSON_ID, WEBSITE_ID, breadcrumbSchema } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/site";
import { CATEGORIES, getCaseStudies, type Category } from "@/lib/work";

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
      <JsonLd data={[collection, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Case studies", path: "/work" }])]} />

      <header className="wrap work-hero">
        <h1 className="h-display work-h1">Case studies</h1>
        <p className="lead">
          {studies.length} real builds: LLM agents, document pipelines and production automations for clients in the US, the UK and Europe. Client names are withheld under NDA; every number comes from the project itself.
        </p>
      </header>

      <div className="wrap">
        <WorkFilters categories={categories} />
        {featured ? <FeaturedCase c={featured} headingLevel="h2" /> : null}
        <section className="case-list" aria-label="All case studies">
          {rest.map((c) => (
            <CaseRow key={c.slug} c={c} headingLevel="h2" />
          ))}
          <p className="grid-empty" data-grid-empty hidden>
            The featured case study above is the only one in this category so far.
          </p>
        </section>
        <CtaBand />
      </div>
    </main>
  );
}
