import { OG_SIZE, renderOg } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Writing by Jay Pokharna: notes on LLM agents, RAG and production automation";

export default function Image() {
  return renderOg({
    eyebrow: "Writing",
    title: "Notes from building",
    accent: "LLM agents and automations.",
    footer: "LLM agents, RAG and automation",
  });
}
