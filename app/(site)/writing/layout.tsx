import "../article.css";
import SiteFooter from "@/components/site/SiteFooter";
import { RevealInit } from "@/components/work/client";

export default function WritingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
      <RevealInit />
    </>
  );
}
