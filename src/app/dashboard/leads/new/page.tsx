import type { Metadata } from "next";
import Link from "next/link";
import { createLeadAction } from "@/app/actions/leads";
import { LeadForm } from "@/components/leads/lead-form";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "New lead" };

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:underline">← All leads</Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">New lead</h1>
      </div>
      <Card className="p-6">
        <LeadForm action={createLeadAction} submitLabel="Create lead" />
      </Card>
    </div>
  );
}
