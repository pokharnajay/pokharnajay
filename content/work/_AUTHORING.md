# Writing a case study

Each case study is one file: `content/work/<slug>.mdx`. The file name must equal the `slug`.
Frontmatter is validated by `lib/work.ts` at build time; invalid frontmatter fails the build.
Files starting with `_` are ignored. `draft: true` hides a case study from production builds,
the sitemap and the RSS feed (it still renders in `npm run dev`).

## Frontmatter

```yaml
---
title: "Evidence-backed LLM scoring for sales calls"   # ≤ 70 chars, descriptive + searchable
seoTitle: "LLM sales call scoring with evidence"         # optional, ≤ 60 chars, used in <title>
slug: evidence-backed-sales-call-scoring                 # kebab-case, keyword-rich
number: 1                                                # display order 01…06 (unique)
date: "2026-03-26"                                       # completion date, quoted
updated: "2026-10-11"                                    # optional
category: ai-agents                                      # ai-agents | code | no-code
clientType: "US recruiting firm"                         # anonymised: industry + country only
role: "Lead engineer (solo build)"
duration: "5 weeks"
stack: ["OpenAI API", "TypeScript", "Make.com"]          # only tools actually used
metrics:                                                 # max 3; values ≤ ~14 chars read best
  - { label: "Identical results", value: "5 / 5 runs" }
summary: "One or two sentences, 120–170 characters. Used on cards and as the meta description."
featured: false
draft: false
keywords: ["LLM call scoring", "AI sales call analysis"] # target search terms (not rendered)
diagram:                                                 # hero architecture diagram
  title: "Call scoring pipeline"
  nodes:                                                 # col 0–6, row 0–4; label ≤ 28 chars; badge ≤ 5
    - { id: rec, label: "Call recording", badge: "IN", col: 0, row: 1 }
    - { id: llm, label: "LLM: quote claims", badge: "AI", col: 2, row: 1, accent: true }
  edges:
    - { from: rec, to: llm, label: "transcript" }        # label ≤ 22 chars
---
```

## Body

No `# h1` (the title is the h1). Use these `##` sections, in this order:

1. `## TL;DR` (3 bullet points)
2. `## Context` (who the client is, anonymised, and why this mattered)
3. `## The problem` (what was manual or broken, and what the status quo cost)
4. `## Constraints` (budget, existing tools, data sensitivity, timeline)
5. `## Approach & architecture` (why this design over the alternatives; the hero diagram shows the flow)
6. `## The build` (key implementation details, short code snippets)
7. `## LLM specifics` (AI projects only: model choice, prompting, structured outputs, tool design, guardrails, evals, cost and latency)
8. `## Results` (measured outcomes, before/after)
9. `## What I'd do differently`
10. `## Stack` (one short paragraph; the chips render from frontmatter)

`###` sub-headings are fine inside a section. Each case study should use its target search
terms naturally in the title, the summary, the first paragraph and one `##` heading.

## Components

```mdx
<Callout type="lesson" title="Optional title">Text. type = note | warning | lesson</Callout>

<Metric value="5 / 5" label="Identical scores across repeat runs" />

<Steps>
  <Step title="Extract">What happens.</Step>
  <Step title="Validate">What happens.</Step>
</Steps>

<Compare beforeLabel="Before" afterLabel="After" before="Text" after="Text" />

<Figure src="/work/slug/screenshot.png" alt="Descriptive alt" caption="Caption" width={1600} height={900} />
```

Code fences are highlighted at build time (Shiki). Add a file name and highlighted lines:

````mdx
```ts title="score.ts" {3-4}
const x = 1;
```
````

## Rules

- First person, direct, technical but readable by a hiring manager. No hype words
  ("revolutionary", "seamless", "game-changing", "leverage", "unlock", "delve").
- Never name clients, people, URLs, base IDs or internal identifiers. No secrets in snippets.
- Numbers only from real sources (project files, logs, the client's own data). Anything
  unconfirmed goes in a hidden MDX comment, not on the page: `{/* VERIFY: what to confirm */}`.
- 1,200–1,800 words.
