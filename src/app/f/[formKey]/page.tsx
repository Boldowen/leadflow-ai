import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/automation/contact-form";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Contact us", robots: { index: false } };

// A sample "client website" contact form wired to the automation webhook.
export default async function PublicFormPage({ params, searchParams }: PageProps<"/f/[formKey]">) {
  const { formKey } = await params;
  const { sent } = await searchParams;
  const owner = await db.user.findUnique({ where: { formKey }, select: { name: true } });
  if (!owner) notFound();

  return (
    <main className="flex flex-1 items-center justify-center bg-[radial-gradient(640px_circle_at_50%_0%,rgba(99,102,241,.18),transparent_70%)] px-4 py-12">
      <div className="glass w-full max-w-lg p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,.9)] sm:p-8">
        <p className="text-xs font-medium tracking-wide text-indigo-300 uppercase">Get in touch</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Tell us about your project</h1>
        <p className="mt-1 mb-6 text-sm text-zinc-400">{owner.name} usually replies within one business day.</p>
        <ContactForm formKey={formKey} initiallySent={sent === "1"} />
      </div>
    </main>
  );
}
