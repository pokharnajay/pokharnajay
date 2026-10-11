/* Single source of truth for site-wide facts. Edit here, not in components.

   SITE_URL resolution order:
   1. NEXT_PUBLIC_SITE_URL (set this in Vercel when a custom domain goes live)
   2. VERCEL_PROJECT_PRODUCTION_URL (Vercel system env: the production domain)
   3. https://jaypokharna.vercel.app */
const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://jaypokharna.vercel.app");

export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

/* Only the production deployment may be indexed. Vercel preview builds set
   VERCEL_ENV=preview; local builds have no VERCEL_ENV and stay indexable so
   `next build && next start` mirrors production. */
export const IS_INDEXABLE = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";

export const site = {
  name: "Jay Pokharna",
  jobTitle: "AI Engineer",
  /* Default <title> and the positioning line used across metadata. */
  title: "Jay Pokharna — AI Engineer | LLM Agents & Automation",
  positioning: "AI Engineer — LLM agents, RAG & production automations",
  description:
    "AI Engineer building LLM agents, RAG systems and production automations with Python, TypeScript, n8n and Make.com. Open to remote roles and select projects.",

  /* Availability: shown in the topbar badge, the stats strip and OG images. */
  availability: {
    status: "Open to new roles",
    short: "Open",
    note: "remote roles + select projects",
  },

  email: "pokharnajay@gmail.com",
  resume: "/resume.pdf",

  location: {
    city: "Pune",
    region: "Maharashtra",
    country: "India",
    countryCode: "IN",
    label: "Pune · IST",
    long: "Pune, India · IST (UTC+5:30)",
  },

  employer: { name: "Etherwise", url: "https://etherwise.io/" },

  links: {
    github: "https://github.com/pokharnajay",
    githubHandle: "/pokharnajay",
    linkedin: "https://www.linkedin.com/in/jay-pokharna-940a42207/",
    linkedinHandle: "/in/jay-pokharna-940a42207",
  },

  /* X/Twitter handle is unverified, so it is left out of twitter:site and
     sameAs. Set it (e.g. "@pokharnajay") once confirmed. */
  twitterHandle: null as string | null,

  version: "v4.0",
  /* Last meaningful homepage update (sitemap lastModified). */
  updated: "2026-10-11",
} as const;

export const sameAs = [site.links.linkedin, site.links.github, site.employer.url];

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
