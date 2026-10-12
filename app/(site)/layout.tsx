import "./globals.css";
import Nav from "@/components/site/Nav";
import SiteFooter from "@/components/site/SiteFooter";

/* Chrome shared by every marketing page. Page CSS (home, article) is
   imported by those routes. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav />
      {children}
      <SiteFooter />
    </>
  );
}
