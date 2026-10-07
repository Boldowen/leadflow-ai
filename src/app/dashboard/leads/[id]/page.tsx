import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { analyzeLeadAction, deleteLeadAction, updateLeadAction } from "@/app/actions/leads";
import { StatusBadge } from "@/components/badges";
import { AiPanel } from "@/components/leads/ai-panel";
import { DeleteLeadButton } from "@/components/leads/delete-lead-button";
import { LeadForm } from "@/components/leads/lead-form";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/dal";
import { getLead } from "@/lib/leads";

export const metadata: Metadata = { title: "Lead" };

export default async function LeadPage({ params }: PageProps<"/dashboard/leads/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const lead = await getLead(user.id, id);
  if (!lead) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:underline">← All leads</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
          <StatusBadge value={lead.status} />
        </div>
        <p className="text-sm text-slate-500">
          {lead.email}
          {lead.company ? ` · ${lead.company}` : ""} · added {lead.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })} via {lead.source}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-6">
          <LeadForm action={updateLeadAction.bind(null, lead.id)} lead={lead} submitLabel="Save changes" />
        </Card>
        <div className="space-y-6">
          <AiPanel analyze={analyzeLeadAction.bind(null, lead.id)} lead={lead} />
          <Card className="p-5">
            <h2 className="font-semibold">Danger zone</h2>
            <p className="mt-1 mb-4 text-sm text-slate-500">Deleting a lead removes it and its AI analysis.</p>
            <DeleteLeadButton action={deleteLeadAction.bind(null, lead.id)} />
          </Card>
        </div>
      </div>
    </div>
  );
}
