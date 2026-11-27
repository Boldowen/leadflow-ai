import type { Metadata } from "next";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Marquee } from "@/components/landing/marquee";
import { MotionProvider } from "@/components/landing/motion-provider";
import { Navbar } from "@/components/landing/navbar";
import { ScoringDemo } from "@/components/landing/scoring-demo";
import { ScrollProgress } from "@/components/landing/scroll-progress";
import { UseCases } from "@/components/landing/use-cases";
import { JsonLd } from "@/components/site/json-ld";
import { FAQS, FEATURES } from "@/lib/landing-data";
import { absoluteUrl, organizationId, organizationJsonLd, SITE, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: SITE.title },
  description: SITE.description,
  alternates: { canonical: "/" },
};

const jsonLd = [
  organizationJsonLd(),
  websiteJsonLd(),
  {
    "@type": "SoftwareApplication",
    name: SITE.name,
    url: absoluteUrl("/"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: SITE.description,
    image: absoluteUrl("/opengraph-image"),
    publisher: { "@id": organizationId },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: FEATURES.map((f) => f.title),
  },
  {
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  },
];

// Server component: composes the landing sections; interactive pieces are client components.
export default function Home() {
  return (
    <div className="lp-root flex min-h-screen flex-1 flex-col">
      <JsonLd graph={jsonLd} />
      {/* Without JavaScript, scroll-reveal content must not stay invisible. */}
      <noscript>
        <style>{"[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}"}</style>
      </noscript>
      <MotionProvider>
        <ScrollProgress />
        <Navbar />
        <main className="flex-1">
          <Hero />
          <Marquee />
          <Features />
          <HowItWorks />
          <ScoringDemo />
          <UseCases />
          <Faq />
          <FinalCta />
        </main>
        <Footer />
      </MotionProvider>
    </div>
  );
}
