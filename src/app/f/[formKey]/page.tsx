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
    <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-medium tracking-wide text-indigo-600 uppercase">Get in touch</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Tell us about your project</h1>
        <p className="mt-1 mb-6 text-sm text-slate-600">{owner.name} usually replies within one business day.</p>
        <ContactForm formKey={formKey} initiallySent={sent === "1"} />
      </div>
    </main>
  );
}
