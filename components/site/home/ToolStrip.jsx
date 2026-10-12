const TOOLS = [
  "OpenAI", "Anthropic Claude", "Gemini", "OpenRouter", "n8n", "Make.com", "Zapier", "Airtable",
  "Python", "TypeScript", "Node.js", "Next.js", "Cloudflare Workers", "PostgreSQL", "Docker", "GoHighLevel",
];

/* A slow marquee of the tools in weekly use; pauses on hover, wraps into a
   static list with reduced motion. */
export default function ToolStrip() {
  return (
    <section className="toolstrip" aria-label="Tools I work with">
      <div className="wrap toolstrip-inner">
        <p className="toolstrip-label">Tools I ship with every week</p>
        <div className="marquee">
          <ul className="marquee-track">
            {TOOLS.map((t) => <li key={t}>{t}</li>)}
            {TOOLS.map((t) => <li key={t + "-2"} aria-hidden="true" className="dup">{t}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
