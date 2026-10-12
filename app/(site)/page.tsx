import type { Metadata } from "next";
import "./home.css";
import Hero from "@/components/site/home/Hero";
import ToolStrip from "@/components/site/home/ToolStrip";
import Services from "@/components/site/home/Services";
import AgentDemo from "@/components/site/home/AgentDemo";
import Automations from "@/components/site/home/Automations";
import WorkSection from "@/components/site/home/WorkSection";
import Process from "@/components/site/home/Process";
import StackSphere from "@/components/site/home/StackSphere";
import About from "@/components/site/home/About";
import Contact from "@/components/site/home/Contact";
import HomeEffects from "@/components/site/home/HomeEffects";
import { JsonLd, PERSON_ID, WEBSITE_ID, personSchema, websiteSchema } from "@/lib/jsonld";
import { SITE_URL, site } from "@/lib/site";
import { getCaseStudies } from "@/lib/work";

export const metadata: Metadata = {
  title: { absolute: site.title },
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: site.title, description: site.description },
};

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
      <main id="main">
        <Hero />
        <ToolStrip />
        <Services />
        <AgentDemo />
        <Automations />
        <WorkSection studies={getCaseStudies()} />
        <Process />
        <StackSphere />
        <About />
        <Contact />
      </main>
      <HomeEffects />
    </>
  );
}
