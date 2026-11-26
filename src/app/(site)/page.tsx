import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import dashboard from "@/assets/product/dashboard.png";
import { JsonLd } from "@/components/site/json-ld";
import { ButtonLink } from "@/components/ui";
import { absoluteUrl, organizationId, organizationJsonLd, SITE, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: SITE.title },
  description: SITE.description,
  alternates: { canonical: "/" },
};

const features = [
  {
    title: "Capture every inbound lead",
    body: "Collect leads from a hosted contact form, an HTML form embedded on your website, a JSON webhook or the REST API — or add them by hand. Spam is filtered with a honeypot field and rate limits.",
  },
  {
    title: "AI lead summaries",
    body: "Claude reads each message and writes a one- or two-sentence summary of who the lead is and what they want, in the same language the lead wrote in.",
  },
  {
    title: "Hot, Warm and Cold lead scoring",
    body: "Every lead gets a clear temperature, so the people with a real need and a budget or deadline rise to the top of your list.",
  },
  {
    title: "A recommended next action",
    body: "Alongside the score you get one concrete next step for the salesperson, such as booking a call or sending a quote.",
  },
  {
    title: "Lead prioritization dashboard",
    body: "See totals for Hot, Warm and Won leads, search by name, email or company, and move each lead through New, Contacted, Qualified, Won or Lost.",
  },
  {
    title: "Sales pipeline automation",
    body: "New website leads can be added to a Google Sheet and announced in Telegram automatically, with a run log that shows every step.",
  },
];

const steps = [
  { title: "Connect your website form", body: "Link to the hosted form, paste the HTML snippet into your site, or post JSON from your own backend. No change to your site's design is needed." },
  { title: "A lead arrives and is saved", body: "The visitor gets an instant confirmation. The lead is stored before anything else runs, so a failing integration never loses it." },
  { title: "AI qualifies the lead", body: "Emberza summarizes the message, scores it Hot, Warm or Cold and suggests what to do next — usually within seconds." },
  { title: "Your team follows up", body: "Get the lead in Telegram and your Google Sheet, open the hottest ones first, and track every deal until it is won or lost." },
];

const temperatures = [
  { label: "Hot", icon: "🔥", style: "bg-red-50 text-red-700 ring-red-600/20", body: "A clear need plus a budget or a timeline. Reply today." },
  { label: "Warm", icon: "☀️", style: "bg-amber-50 text-amber-800 ring-amber-600/20", body: "Interested, but the need, budget or timing is still vague. Nurture with a useful follow-up." },
  { label: "Cold", icon: "❄️", style: "bg-sky-50 text-sky-800 ring-sky-600/20", body: "No real buying intent yet, such as a general price question. Keep in touch without chasing." },
];

const useCases = [
  { title: "Agencies and freelancers", body: "Web, design and marketing studios that get project requests through a contact form and need to answer the serious ones first." },
  { title: "B2B service businesses", body: "Consultants, IT services and other small B2B teams that qualify every inquiry before booking a call." },
  { title: "Small sales teams", body: "Teams of a few people who share one inbox and want a simple, prioritized lead list instead of a heavy CRM." },
];

const benefits = [
  "Answer the leads most likely to buy before they talk to a competitor.",
  "Stop copying form emails into spreadsheets by hand.",
  "Get notified in Telegram the moment a qualified lead arrives.",
  "Keep every account's leads private: each team only sees its own data.",
];

const faqs = [
  {
    q: "What is AI lead qualification?",
    a: "AI lead qualification means letting a language model read each inbound inquiry and decide how promising it is. Emberza summarizes the message, scores it Hot, Warm or Cold and recommends a next step, so you don't have to read every message in full to know where to start.",
  },
  {
    q: "How does Emberza's AI lead scoring work?",
    a: "Emberza sends the lead's name, company, message and your internal notes to Claude, Anthropic's AI model, with instructions to classify it: Hot means a clear need plus budget or timeline, Warm means interested but vague, and Cold means no real intent. The lead text is treated purely as data, never as instructions.",
  },
  {
    q: "Do I need to change my website?",
    a: "No. You can link to the hosted contact form, paste a small HTML form into any site such as WordPress or Webflow, or send JSON from your own backend to your private webhook URL.",
  },
  {
    q: "Which tools does Emberza integrate with?",
    a: "New website leads can be appended to a Google Sheet through a small Apps Script web app and sent to a Telegram chat or channel. There is also a REST API for creating, updating and analyzing leads.",
  },
  {
    q: "Does it work with leads that aren't in English?",
    a: "Yes. The summary and the recommended next action are written in the same language as the lead's message.",
  },
  {
    q: "Who can see my leads?",
    a: "Only your account. Every lead is stored with its owner and every query is scoped to that owner. When AI analysis runs, the lead's text is sent to Anthropic to generate the result. Read the privacy policy for details.",
  },
  {
    q: "How much does Emberza cost?",
    a: "You can create an account and start qualifying leads for free.",
  },
];

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
    featureList: features.map((f) => f.title),
  },
  {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  },
];

function SectionHeading({ id, eyebrow, title, intro }: { id: string; eyebrow: string; title: string; intro: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold text-indigo-600">{eyebrow}</p>
      <h2 id={id} className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-pretty text-slate-600">{intro}</p>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <JsonLd graph={jsonLd} />

      <section className="mx-auto max-w-4xl px-4 pt-14 pb-16 text-center sm:px-6 sm:pt-20">
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          <span className="mb-4 block text-sm font-semibold tracking-wide text-indigo-600 uppercase">AI lead qualification &amp; scoring</span>
          Know which leads to call <span className="text-indigo-600">first</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-slate-600">
          Emberza reads every inbound lead from your website, writes a one-line summary, scores it Hot, Warm or Cold and suggests the
          next step — so your small sales team spends its time on the deals most likely to close.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/register" className="px-5 py-2.5 text-base">Start free</ButtonLink>
          <ButtonLink href="#how-it-works" variant="secondary" className="px-5 py-2.5 text-base">See how it works</ButtonLink>
        </div>
      </section>

      <section aria-labelledby="preview" className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <h2 id="preview" className="sr-only">Product preview</h2>
        <figure>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
            <Image
              src={dashboard}
              alt="Emberza dashboard: lead totals for Hot, Warm and Won, a search bar and a list of leads with AI summaries, statuses and Hot, Warm or Cold badges"
              sizes="(min-width: 1024px) 960px, 100vw"
              placeholder="blur"
              // The screenshot is the Largest Contentful Paint element on most screens.
              loading="eager"
              fetchPriority="high"
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-slate-500">The lead dashboard with AI summaries and Hot / Warm / Cold scores (demo data).</figcaption>
        </figure>
      </section>

      <section aria-labelledby="features" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            id="features"
            eyebrow="Features"
            title="Inbound lead management without the busywork"
            intro="Emberza brings lead capture, AI lead scoring and follow-up into one simple workspace built for small teams."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <article key={f.title} className="rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          id="how-it-works"
          eyebrow="How it works"
          title="From contact form to qualified lead in four steps"
          intro="Automated lead qualification runs in the background while your website visitor gets an instant thank-you."
        />
        <ol className="mt-12 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-slate-200 bg-white p-6">
              <span className="grid size-8 place-items-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700" aria-hidden>
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="ai-lead-scoring" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            id="ai-lead-scoring"
            eyebrow="AI lead scoring"
            title="A score your whole team understands"
            intro="Instead of an opaque number, AI lead scoring software in Emberza gives every lead one of three temperatures, a short summary of why, and what to do next."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {temperatures.map((t) => (
              <article key={t.label} className="rounded-xl border border-slate-200 p-6">
                <h3>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${t.style}`}>
                    <span aria-hidden>{t.icon}</span>
                    {t.label}
                  </span>
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{t.body}</p>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-6 text-slate-600">
            Scores come from Claude, Anthropic&apos;s AI model. You stay in control: add internal notes and run the analysis again, or
            change a lead&apos;s status yourself at any time.
          </p>
        </div>
      </section>

      <section aria-labelledby="use-cases" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          id="use-cases"
          eyebrow="Use cases"
          title="Lead management for small teams"
          intro="Emberza is for teams that get leads through their website and need to know, quickly, which ones deserve a call today."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {useCases.map((u) => (
            <article key={u.title} className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold">{u.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{u.body}</p>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-slate-200 bg-white p-8">
          <h3 className="text-lg font-semibold">Why teams use AI sales automation for lead prioritization</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            {benefits.map((b) => (
              <li key={b} className="flex gap-3">
                <span aria-hidden className="mt-1 text-indigo-600">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="faq" className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 id="faq" className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
          <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  <h3>{f.q}</h3>
                  <span aria-hidden className="text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-slate-600">
            More questions? Read the <Link href="/docs" className="font-medium text-indigo-600 hover:underline">Emberza documentation</Link> or
            email <a href={`mailto:${SITE.contactEmail}`} className="font-medium text-indigo-600 hover:underline">{SITE.contactEmail}</a>.
          </p>
        </div>
      </section>

      <section aria-labelledby="cta" className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h2 id="cta" className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">Start qualifying your inbound leads with AI</h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">Create a free account, connect your contact form and see your first lead scored in minutes.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/register" className="px-5 py-2.5 text-base">Sign up free</ButtonLink>
          <ButtonLink href="/docs" variant="secondary" className="px-5 py-2.5 text-base">Read the docs</ButtonLink>
        </div>
      </section>
    </>
  );
}
