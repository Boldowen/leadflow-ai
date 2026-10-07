import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui";

const features = [
  {
    title: "Capture every lead",
    body: "Add leads by hand or POST them from your website form to the REST API. Name, email, status and notes in one place.",
  },
  {
    title: "AI qualification",
    body: "One click and Claude summarizes the message, scores it Hot / Warm / Cold, and suggests the next action.",
  },
  {
    title: "Focus on the hot ones",
    body: "Dashboard stats, search and status filters show you where the revenue is today.",
  },
];

const steps = ["Lead arrives", "AI summary", "Hot / Warm / Cold", "Next action", "Follow up"];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <ButtonLink href="/login" variant="ghost">Log in</ButtonLink>
          <ButtonLink href="/register">Get started</ButtonLink>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24">
          <p className="mb-4 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            Full-stack · AI · Tested with Playwright
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            Know which leads to call <span className="text-indigo-600">first</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-slate-600">
            LeadFlow AI reads every inbound message, writes a one-line summary, scores it Hot, Warm or Cold, and tells you the next step — so small teams never miss a deal.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/register" className="px-6 py-3 text-base">Start free</ButtonLink>
            <ButtonLink href="/login" variant="secondary" className="px-6 py-3 text-base">I have an account</ButtonLink>
          </div>

          <ol className="mx-auto mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-sm text-slate-600">
            {steps.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm">{step}</span>
                {i < steps.length - 1 && <span aria-hidden className="text-slate-300">→</span>}
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold">{f.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        Built with Next.js, PostgreSQL, Prisma, Claude and Playwright.
      </footer>
    </div>
  );
}
