import Image from "next/image";
import Tilt from "@/components/work/Tilt";
import { site } from "@/lib/site";

export default function About() {
  return (
    <section className="about" id="about" aria-labelledby="about-title">
      <div className="wrap about-grid">
        <Tilt className="about-photo" max={5}>
          <Image
            src="/jay-pokharna-portrait.jpg"
            alt="Jay Pokharna in a black hoodie at his desk, with monitors showing dashboards behind him"
            width={960}
            height={1200}
            sizes="(max-width: 860px) 70vw, 420px"
          />
          <span className="about-badge">
            <span className="dot-live" aria-hidden="true"></span>
            {site.availability.status}
          </span>
        </Tilt>
        <div className="about-copy">
          <h2 className="h-section" id="about-title">Hi, I&rsquo;m Jay.</h2>
          <p className="lead">
            I&rsquo;m an AI engineer at {site.employer.name}, based in {site.location.city}. Most of my work sits where LLMs meet operations: an agent that needs a CRM, a document pipeline that needs a human check, a workflow that has to stop failing at 2am.
          </p>
          <p>
            I&rsquo;ve contributed to 3,000+ automations across 70+ clients, and I care most about the unglamorous parts: error handling, logging, and documentation for whoever inherits the system. I&rsquo;m open to full-time remote AI engineering roles and take on select projects.
          </p>
          <dl className="about-facts">
            <div><dt>Based in</dt><dd>{site.location.long}</dd></div>
            <div><dt>Works with</dt><dd>Teams in the US, UK and Europe, async-first</dd></div>
            <div><dt>Currently</dt><dd>AI engineer at {site.employer.name}</dd></div>
            <div><dt>Languages</dt><dd>English, Hindi, Marathi</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
