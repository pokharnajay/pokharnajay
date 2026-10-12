import "../article.css";
import { RevealInit } from "@/components/work/client";

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RevealInit />
    </>
  );
}
