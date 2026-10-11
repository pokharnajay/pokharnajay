import { OG_SIZE, renderOg } from "@/lib/og";
import { CATEGORIES, getCaseStudies, getCaseStudy } from "@/lib/work";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Case study by Jay Pokharna";

export function generateStaticParams() {
  return getCaseStudies().map((c) => ({ slug: c.slug }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const c = getCaseStudy(params.slug);
  if (!c) return renderOg({ eyebrow: "Case study", title: "Jay Pokharna" });
  const m = c.metrics[0];
  return renderOg({
    eyebrow: `Case study · ${CATEGORIES[c.category]}`,
    title: c.title,
    metric: m?.value,
    metricLabel: m?.label,
    footer: c.stack.slice(0, 3).join(" · "),
  });
}
