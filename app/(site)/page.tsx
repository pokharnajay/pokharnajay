import type { Metadata } from "next";
import "./home.css";
import Hero from "@/components/site/home/Hero";
import Scenes from "@/components/site/home/Scenes";
import Tools from "@/components/site/home/Tools";
import Contact from "@/components/site/home/Contact";
import HomeEffects from "@/components/site/home/HomeEffects";
import { JsonLd, PERSON_ID, WEBSITE_ID, personSchema, websiteSchema } from "@/lib/jsonld";
import { SITE_URL, site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: site.title },
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: site.title, description: site.description },
};

/* The veil is pure CSS (it slides away at ~0.9s even before JS loads) and is
   skipped entirely for repeat visitors and reduced motion — see home.css. */
function IntroVeil() {
  return (
    <div className="intro-veil" aria-hidden="true">
      <div className="intro-veil-inner">
        <span className="intro-mark">JP</span>
        <span className="intro-line"></span>
        <span className="intro-text">{site.name} · {site.version} / booting</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const profilePage = {
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/#profile`,
    url: SITE_URL,
    name: site.title,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": PERSON_ID },
    inLanguage: "en",
  };
  return (
    <>
      <JsonLd data={[profilePage, personSchema(), websiteSchema()]} />
      <IntroVeil />
      <main id="main">
        <Hero />
        <Scenes />
        <Tools />
        <Contact />
      </main>
      <HomeEffects />
    </>
  );
}
