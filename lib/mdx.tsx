import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import type { MDXComponents } from "mdx/types";
import type { ThemeRegistration } from "shiki";

/* Build-time MDX: compiled on the server during static generation, so pages
   ship plain HTML. Code is highlighted with Shiki using a theme that mirrors
   the homepage code window (dark green-black panel, mint strings). */

const siteTheme: ThemeRegistration = {
  name: "jp-terminal",
  type: "dark",
  colors: { "editor.background": "#0d1b14", "editor.foreground": "#e9f1ec" },
  tokenColors: [
    { settings: { foreground: "#e9f1ec", background: "#0d1b14" } },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#86a192", fontStyle: "italic" } },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "storage.modifier",
        "keyword.control",
        "keyword.operator.new",
        "keyword.operator.expression",
        "keyword.operator.logical",
        "variable.language",
      ],
      settings: { foreground: "#f59ad1" },
    },
    { scope: ["string", "string.quoted", "string.template", "punctuation.definition.string", "string.unquoted"], settings: { foreground: "#a7f3c9" } },
    { scope: ["constant.numeric", "constant.language", "constant.character", "support.constant"], settings: { foreground: "#fcd38d" } },
    { scope: ["entity.name.function", "support.function", "meta.function-call", "variable.function"], settings: { foreground: "#6ee7a8" } },
    { scope: ["variable", "variable.other", "variable.parameter", "meta.definition.variable"], settings: { foreground: "#b9e6ff" } },
    { scope: ["entity.name.type", "support.type", "support.class", "entity.name.class", "entity.other.inherited-class"], settings: { foreground: "#7ee0d0" } },
    {
      scope: ["variable.other.property", "variable.other.object.property", "meta.object-literal.key", "support.type.property-name", "entity.name.tag.yaml"],
      settings: { foreground: "#e9f1ec" },
    },
    { scope: ["punctuation", "meta.brace", "keyword.operator"], settings: { foreground: "#a3b6ab" } },
    { scope: ["entity.name.tag", "markup.heading"], settings: { foreground: "#f59ad1" } },
  ],
};

const prettyCode: PrettyCodeOptions = {
  // rehype-pretty-code types its theme against its own Shiki typings.
  theme: siteTheme as unknown as PrettyCodeOptions["theme"],
  keepBackground: false,
  defaultLang: "plaintext",
};

export async function renderMdx(source: string, components: MDXComponents) {
  const { default: Content } = await evaluate(source, {
    ...(runtime as unknown as Parameters<typeof evaluate>[1]),
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypePrettyCode, prettyCode]],
  });
  return <Content components={components} />;
}
