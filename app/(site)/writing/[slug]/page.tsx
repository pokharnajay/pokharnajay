import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@/components/work/client";
import { mdxComponents } from "@/components/work/mdx-components";
import { CtaBand } from "@/components/work/parts";
import { JsonLd, PERSON_ID, breadcrumbSchema } from "@/lib/jsonld";
import { renderMdx } from "@/lib/mdx";
import { absoluteUrl, sameAs, site } from "@/lib/site";
import { formatMonth } from "@/lib/work";
import { getPost, getPosts } from "@/lib/writing";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getPost(params.slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/writing/${p.slug}` },
    openGraph: { type: "article", url: `/writing/${p.slug}`, title: p.title, description: p.summary, publishedTime: p.date, modifiedTime: p.updated ?? p.date },
    ...(p.draft ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const p = getPost(params.slug);
  if (!p) notFound();
  const content = await renderMdx(p.body, mdxComponents);
  const url = absoluteUrl(`/writing/${p.slug}`);
  const article = {
    "@type": "BlogPosting",
    headline: p.title,
    description: p.summary,
    url,
    mainEntityOfPage: url,
    datePublished: p.date,
    dateModified: p.updated ?? p.date,
    author: { "@type": "Person", "@id": PERSON_ID, name: site.name, url: absoluteUrl("/"), sameAs },
    keywords: p.tags.join(", "),
    inLanguage: "en",
  };
  return (
    <main id="main" className="cs-page">
      <JsonLd data={[article, breadcrumbSchema([{ name: "Writing", path: "/writing" }, { name: p.title, path: `/writing/${p.slug}` }])]} />
      <ReadingProgress />
      <header className="wrap cs-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/writing">Writing</Link></li>
            <li aria-current="page"><span>{p.title}</span></li>
          </ol>
        </nav>
        <div className="case-row-meta">
          <span className="case-row-date">{formatMonth(p.date)}</span>
          <span className="case-row-date">{p.readingTime} min read</span>
          {p.draft ? <span className="draft-badge">Draft</span> : null}
        </div>
        <h1 className="cs-h1">{p.title}</h1>
        <p className="cs-summary">{p.summary}</p>
      </header>
      <div className="wrap cs-layout is-single">
        <article className="prose" data-article>{content}</article>
      </div>
      <div className="wrap">
        <CtaBand />
      </div>
    </main>
  );
}
