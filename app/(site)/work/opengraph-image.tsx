import { OG_SIZE, renderOg } from "@/lib/og";
import { getCaseStudies } from "@/lib/work";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Work and case studies by Jay Pokharna: AI agents, RAG and automation";

export default function Image() {
  const n = getCaseStudies().length;
  return renderOg({
    eyebrow: "Selected work · case studies",
    title: "Things I've",
    accent: "shipped.",
    metric: String(n).padStart(2, "0"),
    metricLabel: "case studies",
    footer: "AI agents · code · no-code",
  });
}
