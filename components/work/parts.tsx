import Link from "next/link";
import { site } from "@/lib/site";
import { CATEGORIES, formatMonth, type CaseStudy } from "@/lib/work";
import Diagram from "./Diagram";
import Tilt from "./Tilt";
import { CountUp } from "./client";

export const Arrow = () => (
  <svg className="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

/* One case study as a list row: a single real link (the title) stretched
   over the row, so it's one tab stop. */
export function CaseRow({ c, headingLevel = "h3" }: { c: CaseStudy; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  const m = c.metrics[0];
  return (
    <article className="case-row" data-category={c.category} data-reveal>
      <div className="case-row-meta">
        <span className={"tag" + (c.category === "ai-agents" ? " is-green" : "")}>{CATEGORIES[c.category]}</span>
        <span className="case-row-date">{formatMonth(c.date)}</span>
        {c.draft ? <span className="draft-badge">Draft</span> : null}
      </div>
      <div className="case-row-main">
        <H className="case-row-title">
          <Link href={`/work/${c.slug}`} className="stretched">{c.title}</Link>
        </H>
        <p className="case-row-client">{c.clientType}</p>
      </div>
      {m ? (
        <div className="case-row-metric">
          <span className="v">{m.value}</span>
          <span className="k">{m.label}</span>
        </div>
      ) : <span />}
      <span className="case-row-arrow" aria-hidden="true"><Arrow /></span>
    </article>
  );
}

/* Featured case study: copy + metrics, and its architecture as a tilting
   3D card. */
export function FeaturedCase({ c, headingLevel = "h3" }: { c: CaseStudy; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className="featured" data-category={c.category} data-reveal>
      <div className="featured-copy">
        <div className="case-row-meta">
          <span className="tag is-green">Featured</span>
          <span className="tag">{CATEGORIES[c.category]}</span>
          <span className="case-row-date">{formatMonth(c.date)}</span>
        </div>
        <H className="featured-title">
          <Link href={`/work/${c.slug}`}>{c.title}</Link>
        </H>
        <p className="featured-summary">{c.summary}</p>
        {c.metrics.length ? (
          <dl className="featured-metrics">
            {c.metrics.map((m) => (
              <div key={m.label}>
                <dt>{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <Link href={`/work/${c.slug}`} className="btn btn-primary featured-cta" tabIndex={-1} aria-hidden="true">
          Read the case study <Arrow />
        </Link>
      </div>
      {c.diagram ? (
        <Tilt className="featured-visual">
          <div aria-hidden="true">
            <Diagram data={c.diagram} id={`featured-${c.slug}`} compact />
          </div>
        </Tilt>
      ) : null}
    </article>
  );
}

export function MetricsStrip({ metrics }: { metrics: CaseStudy["metrics"] }) {
  if (!metrics.length) return null;
  return (
    <dl className="metrics-strip">
      {metrics.map((m) => (
        <div key={m.label} className="metric">
          <dt className="k">{m.label}</dt>
          <dd className="v">
            <CountUp value={m.value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function CtaBand() {
  return (
    <section className="cta-band" aria-labelledby="cta-title">
      <div className="cta-inner">
        <h2 id="cta-title" className="h-section cta-title">Have a workflow that should run itself?</h2>
        <p className="cta-text">Send a short note about the problem. I reply within a business day.</p>
        <div className="cta-actions">
          <a href={`mailto:${site.email}`} className="btn btn-light">Email {site.email}</a>
          <a href={site.resume} className="btn btn-outline-light">Download resume</a>
        </div>
      </div>
    </section>
  );
}
