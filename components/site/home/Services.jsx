import CodeWindow from "./CodeWindow";

const ICONS = {
  agent: (
    <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-6.5-2 2m-7 7-2 2m11 0-2-2m-7-7-2-2M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
  ),
  rag: <path d="M4 5h11M4 9h7m-7 4h9m-9 4h5m8.5-1.5L21 19m-1.5-5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" />,
  doc: <path d="M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6m-6 4h4" />,
  flow: <path d="M5 6h4v4H5V6Zm10 8h4v4h-4v-4ZM9 8h3a3 3 0 0 1 3 3v3m-6 0H5v4h4v-4Zm0 2h6" />,
  code: <path d="m8 8-4 4 4 4m8-8 4 4-4 4M13.5 5l-3 14" />,
};

const SERVICES = [
  {
    icon: "agent",
    title: "AI agents and tool calling",
    text: "Agents that plan, call your APIs through typed functions, and hand off to a person when confidence is low.",
    tags: ["Function calling", "Structured outputs", "Guardrails"],
  },
  {
    icon: "rag",
    title: "RAG and knowledge assistants",
    text: "Answers grounded in your documents and records, with citations, chunking that fits the content, and an eval set before launch.",
    tags: ["Embeddings", "Vector search", "Evals"],
  },
  {
    icon: "doc",
    title: "LLM document and data pipelines",
    text: "Extraction, classification and scoring with confidence gates, so a wrong guess never overwrites good data.",
    tags: ["OpenAI", "Claude", "Gemini", "OpenRouter"],
  },
  {
    icon: "flow",
    title: "Workflow automation",
    text: "n8n and Make.com flows with error routes and alerts, built so the team that owns them can read them.",
    tags: ["n8n", "Make.com", "Zapier", "GoHighLevel"],
  },
  {
    icon: "code",
    title: "Integrations and custom code",
    text: "TypeScript and Python services, webhooks, Airtable scripts and interface extensions, Cloudflare Workers.",
    tags: ["TypeScript", "Python", "Airtable", "Cloudflare"],
  },
];

export default function Services() {
  return (
    <section className="services" id="services" aria-labelledby="services-title">
      <div className="wrap">
        <div className="services-head" data-scroll-focus>
          <div>
            <h2 className="h-section" id="services-title">What I build.</h2>
            <p className="lead">
              Five kinds of work, usually combined: an LLM step inside an automation, an agent that calls the workflows, a pipeline that feeds the CRM.
            </p>
          </div>
          <CodeWindow />
        </div>

        <ul className="service-list">
          {SERVICES.map((s) => (
            <li key={s.title} className="service" data-reveal>
              <span className="service-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[s.icon]}
                </svg>
              </span>
              <h3 className="h-3 service-title">{s.title}</h3>
              <p className="service-text">{s.text}</p>
              <ul className="service-tags" aria-label="Tools">
                {s.tags.map((t) => (
                  <li key={t} className="tag">{t}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
