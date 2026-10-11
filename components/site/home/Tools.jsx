import { site } from "@/lib/site";

const RAILS = [
  [
    ["LLM APIs", "agents", true],
    ["RAG", "retrieval", true],
    ["Vector search", "embeddings"],
    ["Function calling", "tool use", true],
    ["Structured outputs", "json schema"],
    ["Python", "agents + scripts", true],
    ["TypeScript", "primary", true],
    ["JavaScript", "primary"],
    ["Node.js", "runtime"],
    ["Cloudflare", "workers + tunnels"],
    ["Docker", "containers"],
    ["GitHub", "git"],
  ],
  [
    ["Make.com", "automation", true],
    ["n8n", "self-hosted", true],
    ["Zapier", "automation"],
    ["GoHighLevel", "crm + workflows", true],
    ["Pipedream", "code-first"],
    ["Airtable", "db + scripts", true],
    ["Stripe", "payments", true],
    ["Whop", "payments"],
    ["eSignatures.io", "contracts", true],
    ["ClickSend", "sms", true],
    ["Twilio", "sms"],
    ["Cal.com", "scheduling", true],
    ["LiquidJS", "templating"],
    ["Slack", "messaging"],
  ],
];

export default function Tools() {
  return (
    <section className="tools" id="tools" aria-labelledby="tools-title">
      <div className="tools-inner">
        <div className="tools-head" data-reveal>
          <h2 className="display" id="tools-title">
            The <em>actual</em><br />toolbox.
          </h2>
          <p className="lede">
            Real list, grouped by what each does. If your stack isn&rsquo;t here, ask. Automation work transfers across tools more than people think — the honest answer is usually a few days to come up to speed.
          </p>
        </div>

        <div className="tools-rails">
          {RAILS.map((rail, idx) => (
            <div
              key={idx}
              className={"tools-rail " + (idx % 2 ? "reverse" : "")}
              style={{ "--speed": 60 + idx * 8 + "s" }}
            >
              <ul className="rail-track" aria-label={idx === 0 ? "AI and code" : "Automation platforms and integrations"}>
                {rail.map(([name, kind, featured]) => (
                  <li key={name} className={"tool-chip " + (featured ? "featured" : "")}>
                    <span>{name}</span>
                    <span className="kind">{kind}</span>
                  </li>
                ))}
                {/* Second copy makes the marquee loop seamless; hidden from AT. */}
                {rail.map(([name, kind, featured]) => (
                  <li key={name + "-dup"} className={"tool-chip dup " + (featured ? "featured" : "")} aria-hidden="true">
                    <span>{name}</span>
                    <span className="kind">{kind}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="tools-foot">
          <div className="cell" data-reveal>
            <div className="k">/ shipped</div>
            <div className="v"><span className="accent">3,000</span>+</div>
            <div className="sub">automations contributed to · 70+ clients</div>
          </div>
          <div className="cell" data-reveal>
            <div className="k">/ stack ratio</div>
            <div className="v">50<span className="dim">/</span><span className="accent">50</span></div>
            <div className="sub">code · visual platforms</div>
          </div>
          <div className="cell" data-reveal>
            <div className="k">/ availability</div>
            <div className="v"><span className="accent">{site.availability.short}</span></div>
            <div className="sub">{site.availability.note}</div>
          </div>
          <div className="cell" data-reveal>
            <div className="k">/ response</div>
            <div className="v">&lt;<span className="accent">24</span>h</div>
            <div className="sub">on first contact</div>
          </div>
        </div>
      </div>
    </section>
  );
}
