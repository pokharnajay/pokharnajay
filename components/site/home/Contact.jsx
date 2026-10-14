import { site } from "@/lib/site";

const LINKS = [
  { k: "Email", v: site.email, href: `mailto:${site.email}` },
  { k: "LinkedIn", v: "jay-pokharna", href: site.links.linkedin },
  { k: "GitHub", v: "pokharnajay", href: site.links.github },
  { k: "Resume", v: "Download PDF", href: site.resume },
];

export default function Contact() {
  return (
    <section className="band-dark contact" id="contact" aria-labelledby="contact-title">
      <div className="wrap contact-grid">
        <div>
          <h2 className="h-section" id="contact-title">Tell me what you&rsquo;d like automated.</h2>
          <p className="lead">
            Send one paragraph about the problem in your own words. I reply within a business day with a real answer, a few questions, or an honest &ldquo;not a fit&rdquo;. Bonus points if there&rsquo;s an LLM in it that needs to stop guessing.
          </p>
          <a href={`mailto:${site.email}`} className="btn btn-light contact-cta">Email me</a>
        </div>
        <ul className="contact-links">
          {LINKS.map((l) => {
            const ext = l.href.startsWith("http");
            return (
              <li key={l.k}>
                <a href={l.href} target={ext ? "_blank" : undefined} rel={ext ? "noreferrer" : undefined}>
                  <span className="k">{l.k}</span>
                  <span className="v">
                    {l.v}
                    {ext ? <span className="sr-only"> (opens in a new tab)</span> : null}
                  </span>
                  <svg className="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 11 11 5M6 5h5v5" />
                  </svg>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
