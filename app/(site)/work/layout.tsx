import "../article.css";
import SiteFooter from "@/components/site/SiteFooter";
import { RevealInit } from "@/components/work/client";

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
      <RevealInit />
    </>
  );
}
