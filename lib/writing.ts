import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/* Blog posts: content/writing/<slug>.mdx. Same rules as case studies:
   frontmatter validated at build, drafts only render in `next dev`. */

const DIR = path.join(process.cwd(), "content", "writing");

const isoDate = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD")
);

const PostSchema = z
  .object({
    title: z.string().max(80),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    date: isoDate,
    updated: isoDate.optional(),
    summary: z.string().min(80).max(170),
    tags: z.array(z.string()).max(6).default([]),
    draft: z.boolean().default(false),
  })
  .strict();

export type Post = z.infer<typeof PostSchema> & { body: string; readingTime: number };

const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

export function getPosts(): Post[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(DIR, file), "utf8"));
      const parsed = PostSchema.safeParse(data);
      if (!parsed.success) {
        const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
        throw new Error(`Invalid frontmatter in content/writing/${file}:\n${issues}`);
      }
      if (`${parsed.data.slug}.mdx` !== file) throw new Error(`content/writing/${file}: slug must match the file name`);
      const words = (content.replace(/```[\s\S]*?```/g, " ").match(/\S+/g) || []).length;
      return { ...parsed.data, body: content, readingTime: Math.max(1, Math.round(words / 230)) };
    })
    .filter((p) => SHOW_DRAFTS || !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string) {
  return getPosts().find((p) => p.slug === slug);
}
