import Link from "next/link";
import { site } from "@/lib/site";
import { CATEGORIES, formatMonth, pad2, type CaseStudy } from "@/lib/work";
import { CountUp } from "./client";

export function CategoryLabel({ c }: { c: Pick<CaseStudy, "category"> }) {
  return <>{CATEGORIES[c.category]}</>;
}

/* Card used in the /work grid and the related list. One real link (the
   title) stretched over the whole card, so it is a single tab stop. */
export function CaseCard({ c, headingLevel = "h2" }: { c: CaseStudy; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  const metric = c.metrics[0];
  return (
    <article className="case-card" data-category={c.category} data-reveal>
      <div className="case-card-top">
        <span className="case-num">{pad2(c.number)}</span>
        <span className="case-eyebrow">
          <CategoryLabel c={c} /> · {formatMonth(c.date)}
          {c.draft ? <span className="draft-badge">Draft</span> : null}
        </span>
      </div>
      <H className="case-title">
        <Link href={`/work/${c.slug}`} className="stretched">
          {c.title}
        </Link>
      </H>
      <p className="case-client">{c.clientType}</p>
      {metric ? (
        <div className="case-metric">
          <span className="v">{metric.value}</span>
          <span className="k">{metric.label}</span>
        </div>
      ) : null}
      <ul className="case-stack" aria-label="Stack">
        {c.stack.slice(0, 4).map((s) => (
          <li key={s} className="chip">{s}</li>
        ))}
      </ul>
      <span className="case-arrow" aria-hidden="true">→</span>
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
    <section className="cta-band" aria-labelledby="cta-title" data-reveal>
      <div className="cta-inner">
        <div className="eyebrow">
          <span className="dot" aria-hidden="true"></span> Next step
        </div>
        <h2 id="cta-title" className="cta-title">
          Hiring for AI engineering, or need something <em>built</em>?
        </h2>
        <div className="cta-actions">
          <a href={`mailto:${site.email}`} className="btn primary">
            {site.email} <span className="arrow" aria-hidden="true">↗</span>
          </a>
          <a href={site.resume} className="btn">
            View resume
          </a>
          <a href="/#contact" className="btn">
            All contact options
          </a>
        </div>
      </div>
    </section>
  );
}
