# jaypokharna.vercel.app

Personal site of Jay Pokharna — AI Engineer (LLM agents, RAG and production automations).
Next.js 14 App Router, three.js 3D hero (desktop only, lazy-loaded), CSS 3D sections, Lenis smooth scroll, MDX case studies. White base, jade/signal green, Instrument Sans.

## Run

```bash
npm install
npm run dev
```

`npm run build` validates every case study's frontmatter (zod) and fails on errors.

## Where things live

| What | Where |
| --- | --- |
| Site-wide facts (availability, email, links, location) | `lib/site.ts` |
| Homepage sections | `components/site/home/` |
| Case studies | `content/work/<slug>.mdx` — see `content/work/_AUTHORING.md` |
| Blog posts | `content/writing/<slug>.mdx` (`draft: true` hides in production) |
| OG images | `lib/og.tsx` + `opengraph-image.tsx` per route |
| Sitemap / robots | `app/sitemap.ts`, `app/robots.ts` |

Environment variables are documented in `.env.example`. Preview deployments are `noindex` automatically.
