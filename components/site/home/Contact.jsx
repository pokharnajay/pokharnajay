import { site } from "@/lib/site";
import { FooterLinks } from "@/components/site/SiteFooter";

const CHANNELS = [
  { k: "Email", v: site.email, href: `mailto:${site.email}` },
  { k: "LinkedIn", v: site.links.linkedinHandle, href: site.links.linkedin },
  { k: "GitHub", v: site.links.githubHandle, href: site.links.github },
  { k: "Resume", v: "resume.pdf", href: site.resume },
  { k: "Etherwise", v: "etherwise.io", href: site.employer.url },
];

export default function Contact() {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <div className="contact-inner">
        <div className="eyebrow" style={{ marginBottom: "32px" }}>
          <span className="dot" aria-hidden="true"></span><span>04 / Let&rsquo;s build</span><span className="line" aria-hidden="true"></span>
        </div>

        <h2 className="contact-headline" id="contact-title" data-reveal>
          <span className="out">Send one</span><br />
          <em>paragraph.</em>
        </h2>

        <div className="contact-grid">
          <div className="contact-pitch" data-reveal>
            <p>
              Not a job description. Not a perfectly scoped brief. Just the <strong>actual problem</strong> in your own words — and I&rsquo;ll respond within a business day with either a real answer, a few clarifying questions, or an honest <em>&ldquo;this isn&rsquo;t a fit, here&rsquo;s who might be.&rdquo;</em>
            </p>
            <p>
              Discovery first, quoting second. Milestone-based fixed pricing. Built for the person who inherits it. That&rsquo;s the whole pitch.
            </p>
            <p className="contact-roles">
              <span className="dot" aria-hidden="true"></span>
              Also open to full-time remote AI engineering roles. <a href={site.resume}>Resume&nbsp;→</a> · <a href="/work">Case studies&nbsp;→</a>
            </p>
          </div>

          <ul className="contact-channels">
            {CHANNELS.map((c) => {
              const external = c.href.startsWith("http");
              return (
                <li key={c.k}>
                  <a
                    className="contact-channel"
                    href={c.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                  >
                    <div>
                      <div className="k">{c.k}</div>
                      <div className="v">
                        {c.v}
                        {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
                      </div>
                    </div>
                    <span className="arrow" aria-hidden="true">↗</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <footer className="contact-foot">
          <FooterLinks />
          <div className="foot-meta">
            <span>© {new Date().getFullYear()} {site.name} · {site.location.long}</span>
            <span>Built with Next.js · three.js</span>
            <span>{site.version} / production</span>
          </div>
        </footer>
      </div>
    </section>
  );
}
