import { OG_SIZE, renderOg } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.positioning}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return renderOg({
    eyebrow: "AI engineer in Pune, India",
    title: "AI agents and automations",
    accent: "that hold up in production.",
    footer: "LLM agents, RAG, n8n and Make.com",
  });
}
