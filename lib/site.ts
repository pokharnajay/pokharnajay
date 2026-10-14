/* Single source of truth for site-wide facts. Edit here, not in components.

   SITE_URL: NEXT_PUBLIC_SITE_URL when set (do this in Vercel once a custom
   domain like pokharnajay.com resolves), otherwise the live vercel.app URL.
   Deliberately not derived from Vercel's domain list, which could pick a
   custom domain whose DNS isn't live yet. */
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jaypokharna.vercel.app";

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
    "AI Engineer building LLM agents, RAG systems and production automations with Python, TypeScript, n8n and Make.com. Agents that show their work.",

  /* Short live-status line next to the green dot in the nav and on OG images. */
  status: "Shipping AI agents",

  email: "pokharnajay@gmail.com",
  resume: "/Jay_Pokharna_Resume.pdf",

  location: {
    city: "Pune",
    region: "Maharashtra",
    country: "India",
    countryCode: "IN",
    label: "Pune · IST",
    long: "Pune, India (IST, UTC+5:30)",
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
