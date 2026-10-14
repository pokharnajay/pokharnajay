import { SITE_URL, absoluteUrl, sameAs, site } from "@/lib/site";

/* JSON-LD helpers. Rendered server-side as plain <script> tags so crawlers
   see them in the initial HTML. */

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function personSchema() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    url: SITE_URL,
    image: absoluteUrl("/jay-pokharna-portrait.jpg"),
    jobTitle: site.jobTitle,
    description: site.description,
    email: `mailto:${site.email}`,
    worksFor: { "@type": "Organization", name: site.employer.name, url: site.employer.url },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location.city,
      addressRegion: site.location.region,
      addressCountry: site.location.countryCode,
    },
    knowsAbout: [
      "LLM agents",
      "Retrieval-augmented generation (RAG)",
      "Function calling",
      "Workflow automation",
      "n8n",
      "Make.com",
      "Python",
      "TypeScript",
      "Airtable",
    ],
    sameAs,
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    url: SITE_URL,
    description: site.description,
    inLanguage: "en",
    publisher: { "@id": PERSON_ID },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : { "@context": "https://schema.org", ...data };
  return (
    <script
      type="application/ld+json"
      // Escape "<" so content can never close the script tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }}
    />
  );
}
