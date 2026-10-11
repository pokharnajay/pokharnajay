import "./globals.css";
import Topbar from "@/components/site/Topbar";
import CustomCursor from "@/components/site/CustomCursor";

/* Chrome shared by every marketing page: texture overlays, custom cursor and
   the topbar. Page-specific CSS (home, work) is imported by those routes. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Runs before first paint: repeat visitors skip the intro veil. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(localStorage.getItem("jp:intro"))document.documentElement.classList.add("intro-seen")}catch(e){}`,
        }}
      />
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="grain" aria-hidden="true"></div>
      <div className="scanlines" aria-hidden="true"></div>
      <CustomCursor />
      <Topbar />
      {children}
    </>
  );
}
