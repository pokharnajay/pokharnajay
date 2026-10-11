import { OG_SIZE, renderOg } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.positioning}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return renderOg({
    eyebrow: "AI Engineer · Pune, India",
    title: "LLM agents, RAG &",
    accent: "production automations.",
    footer: "Python · TypeScript · n8n · Make.com",
  });
}
