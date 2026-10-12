import Link from "next/link";
import { CaseRow, FeaturedCase } from "@/components/work/parts";

export default function WorkSection({ studies }) {
  const featured = studies.find((c) => c.featured) ?? studies[0];
  const rest = studies.filter((c) => c !== featured);
  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h-section" id="work-title">Selected case studies.</h2>
          <p className="lead">Real client builds, anonymised. Each one covers the problem, the architecture, the code and what I&rsquo;d change.</p>
        </div>
        {featured ? <FeaturedCase c={featured} /> : null}
        <div className="case-list">
          {rest.map((c) => <CaseRow key={c.slug} c={c} />)}
        </div>
        <Link href="/work" className="btn btn-ghost work-all">All case studies</Link>
      </div>
    </section>
  );
}
