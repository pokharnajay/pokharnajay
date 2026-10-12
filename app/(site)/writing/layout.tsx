import "../article.css";
import { RevealInit } from "@/components/work/client";

export default function WritingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RevealInit />
    </>
  );
}
