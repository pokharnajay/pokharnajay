import Image from "next/image";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { CopyButton } from "./client";

/* Components available inside case-study and writing MDX. See
   content/work/_AUTHORING.md for usage. */

function Callout({ type = "note", title, children }: { type?: "note" | "warning" | "lesson"; title?: string; children: ReactNode }) {
  const label = { note: "Note", warning: "Watch out", lesson: "Lesson" }[type];
  return (
    <aside className={`callout callout--${type}`} aria-label={title ? `${label}: ${title}` : label}>
      <div className="callout-label">
        <span className="dot" aria-hidden="true"></span>
        {label}
        {title ? <span className="callout-title"> / {title}</span> : null}
      </div>
      <div className="callout-body">{children}</div>
    </aside>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="mdx-metric">
      <div className="v">{value}</div>
      <div className="k">{label}</div>
    </div>
  );
}

function Steps({ children }: { children: ReactNode }) {
  return <ol className="mdx-steps">{children}</ol>;
}
function Step({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <li className="mdx-step">
      <div className="mdx-step-title">{title}</div>
      {children ? <div className="mdx-step-body">{children}</div> : null}
    </li>
  );
}

function Compare({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
}: {
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  return (
    <div className="mdx-compare">
      <div className="side before">
        <div className="lbl">{beforeLabel}</div>
        <div className="body">{before}</div>
      </div>
      <div className="side after">
        <div className="lbl">{afterLabel}</div>
        <div className="body">{after}</div>
      </div>
    </div>
  );
}

function Figure({
  src,
  alt,
  caption,
  width = 1600,
  height = 900,
  blur,
}: {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  blur?: boolean;
}) {
  return (
    <figure className={"mdx-figure" + (blur ? " is-blurred" : "")}>
      <Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 900px) 100vw, 760px" />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function Anchor({ href = "", children, ...rest }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" {...rest}>
      {children}
    </a>
  );
}

function heading(Tag: "h2" | "h3") {
  return function H({ id, children, ...rest }: ComponentPropsWithoutRef<"h2">) {
    return (
      <Tag id={id} {...rest}>
        {children}
        {id ? (
          <a href={`#${id}`} className="h-anchor" aria-label="Link to this section">
            #
          </a>
        ) : null}
      </Tag>
    );
  };
}

function Pre(props: ComponentPropsWithoutRef<"pre">) {
  return (
    <div className="code-wrap">
      <CopyButton />
      <pre {...props} tabIndex={0} />
    </div>
  );
}

function Table(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="table-wrap" tabIndex={0}>
      <table {...props} />
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  h2: heading("h2"),
  h3: heading("h3"),
  a: Anchor,
  pre: Pre,
  table: Table,
  Callout,
  Metric,
  Steps,
  Step,
  Compare,
  Figure,
};
