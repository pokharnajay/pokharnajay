import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { z } from "zod";

/* Case studies live in content/work/<slug>.mdx. Frontmatter is validated at
   build time; any invalid file fails the build with a readable error. Files
   starting with "_" are ignored. Drafts render in `next dev` only. */

const WORK_DIR = path.join(process.cwd(), "content", "work");

export const CATEGORIES = {
  "ai-agents": "AI agents",
  code: "Code",
  "no-code": "No-code",
} as const;
export type Category = keyof typeof CATEGORIES;

const isoDate = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD")
);

const DiagramSchema = z
  .object({
    title: z.string(),
    nodes: z
      .array(
        z
          .object({
            id: z.string(),
            label: z.string().max(28),
            badge: z.string().max(5).optional(),
            col: z.number().min(0).max(6),
            row: z.number().min(0).max(4),
            accent: z.boolean().optional(),
          })
          .strict()
      )
      .min(2),
    edges: z.array(z.object({ from: z.string(), to: z.string(), label: z.string().max(22).optional() }).strict()),
  })
  .strict()
  .superRefine((d, ctx) => {
    const ids = new Set(d.nodes.map((n) => n.id));
    d.edges.forEach((e, i) => {
      if (!ids.has(e.from) || !ids.has(e.to))
        ctx.addIssue({ code: "custom", message: `edge ${i} references unknown node`, path: ["edges", i] });
    });
  });

export const FrontmatterSchema = z
  .object({
    title: z.string().max(70),
    seoTitle: z.string().max(60).optional(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
    number: z.number().int().min(1),
    date: isoDate,
    updated: isoDate.optional(),
    category: z.enum(["ai-agents", "code", "no-code"]),
    clientType: z.string(),
    role: z.string(),
    duration: z.string(),
    stack: z.array(z.string()).min(1).max(14),
    metrics: z.array(z.object({ label: z.string(), value: z.string() }).strict()).max(3),
    summary: z.string().min(100).max(170),
    featured: z.boolean().default(false),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    keywords: z.array(z.string()).max(8).optional(),
    diagram: DiagramSchema.optional(),
  })
  .strict();

export type Frontmatter = z.infer<typeof FrontmatterSchema>;
export type Diagram = NonNullable<Frontmatter["diagram"]>;
export type TocItem = { id: string; text: string; depth: 2 | 3 };

export type CaseStudy = Frontmatter & {
  body: string;
  readingTime: number;
  words: number;
  toc: TocItem[];
};

const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

/* Headings for the TOC, slugged exactly like rehype-slug does. Code fences
   are skipped so "## " inside code never becomes a heading. */
function extractToc(body: string): TocItem[] {
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/`/g, "").replace(/\*\*?|__?/g, "").trim();
    toc.push({ id: slugger.slug(text), text, depth: m[1].length as 2 | 3 });
  }
  return toc;
}

function countWords(body: string) {
  const prose = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/<[^>]+>/g, " ");
  return (prose.match(/[A-Za-z0-9’'→-]+/g) || []).length;
}

let cache: CaseStudy[] | null = null;

function loadAll(): CaseStudy[] {
  if (cache && !SHOW_DRAFTS) return cache;
  const files = fs.existsSync(WORK_DIR)
    ? fs.readdirSync(WORK_DIR).filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    : [];
  const items = files.map((file) => {
    const raw = fs.readFileSync(path.join(WORK_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const parsed = FrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
      throw new Error(`Invalid frontmatter in content/work/${file}:\n${issues}`);
    }
    const fm = parsed.data;
    if (`${fm.slug}.mdx` !== file) throw new Error(`content/work/${file}: slug "${fm.slug}" must match the file name`);
    const words = countWords(content);
    return { ...fm, body: content, words, readingTime: Math.max(1, Math.round(words / 230)), toc: extractToc(content) };
  });
  const numbers = new Set<number>();
  items.forEach((it) => {
    if (numbers.has(it.number)) throw new Error(`Duplicate case study number ${it.number} (${it.slug})`);
    numbers.add(it.number);
  });
  cache = items.sort((a, b) => a.number - b.number);
  return cache;
}

export function getCaseStudies(): CaseStudy[] {
  return loadAll().filter((c) => SHOW_DRAFTS || !c.draft);
}

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return getCaseStudies().find((c) => c.slug === slug);
}

/* Prev/next follow completion date (oldest → newest). */
export function getAdjacent(slug: string) {
  const byDate = [...getCaseStudies()].sort((a, b) => a.date.localeCompare(b.date));
  const i = byDate.findIndex((c) => c.slug === slug);
  return { prev: i > 0 ? byDate[i - 1] : undefined, next: i >= 0 && i < byDate.length - 1 ? byDate[i + 1] : undefined };
}

/* Same category first, then most recent. */
export function getRelated(slug: string, count = 2) {
  const all = getCaseStudies();
  const self = all.find((c) => c.slug === slug);
  if (!self) return [];
  return all
    .filter((c) => c.slug !== slug)
    .sort((a, b) => {
      const ca = a.category === self.category ? 0 : 1;
      const cb = b.category === self.category ? 0 : 1;
      return ca - cb || b.date.localeCompare(a.date);
    })
    .slice(0, count);
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

export function formatMonth(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

export function lastModified(c: Pick<CaseStudy, "date" | "updated">) {
  return c.updated ?? c.date;
}
