"use client";

import { useActionState } from "react";
import type { AnalyzeState } from "@/app/actions/leads";
import { TemperatureBadge } from "@/components/badges";
import { Button, Card, Spinner } from "@/components/ui";

type Analysis = {
  aiSummary: string | null;
  aiTemperature: string | null;
  aiNextAction: string | null;
  aiModel: string | null;
  analyzedAt: Date | null;
};

export function AiPanel({ analyze, lead }: { analyze: (state: AnalyzeState) => Promise<AnalyzeState>; lead: Analysis }) {
  const [state, action, pending] = useActionState(analyze, undefined);
  const hasResult = Boolean(lead.aiSummary);

  return (
    <Card className="p-5" >
      <section aria-labelledby="ai-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="ai-heading" className="font-semibold">AI analysis</h2>
          <TemperatureBadge value={lead.aiTemperature} />
        </div>

        {hasResult ? (
          <dl className="space-y-3 text-sm" data-testid="ai-result">
            <div>
              <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Summary</dt>
              <dd className="mt-0.5">{lead.aiSummary}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">Next action</dt>
              <dd className="mt-0.5">{lead.aiNextAction}</dd>
            </div>
            <p className="text-xs text-slate-400">
              {lead.aiModel} · {lead.analyzedAt?.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </dl>
        ) : (
          <p className="text-sm text-slate-500">Get a summary, a Hot / Warm / Cold score and a suggested next step.</p>
        )}

        {state?.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

        <form action={action}>
          <Button type="submit" disabled={pending} className="w-full" variant={hasResult ? "secondary" : "primary"}>
            {pending && <Spinner />}
            {pending ? "Analyzing…" : hasResult ? "Re-analyze" : "Analyze with AI"}
          </Button>
        </form>
      </section>
    </Card>
  );
}
