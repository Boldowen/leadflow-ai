import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { rotateFormKeyAction } from "@/app/actions/automation";
import { CopyField } from "@/components/automation/copy-field";
import { IntegrationsForm } from "@/components/automation/integrations-form";
import { SubmitButton } from "@/components/submit-button";
import { Card } from "@/components/ui";
import type { StepResult } from "@/lib/automation";
import { listRuns } from "@/lib/automation";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Automation" };

const flow = ["Website form", "Validation + spam check", "Lead saved", "AI qualification", "Google Sheets", "Telegram alert"];

const stepLabel = { ai: "AI", sheets: "Sheets", telegram: "Telegram" } as const;
const stepStyle = { ok: "bg-emerald-50 text-emerald-700", skipped: "bg-slate-100 text-slate-500", failed: "bg-red-50 text-red-700" } as const;
const runStyle = { SUCCESS: "text-emerald-700", PARTIAL: "text-amber-700", FAILED: "text-red-700" } as const;

export default async function AutomationPage() {
  const user = await requireUser();
  const [config, runs, h] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { formKey: true, sheetsWebhookUrl: true, telegramBotToken: true, telegramChatId: true },
    }),
    listRuns(user.id),
    headers(),
  ]);

  const origin = process.env.APP_URL?.replace(/\/$/, "") ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const endpoint = `${origin}/api/forms/${config.formKey}`;
  const hostedForm = `${origin}/f/${config.formKey}`;
  const embed = `<form action="${endpoint}" method="POST">
  <input name="name" placeholder="Name" required>
  <input name="email" type="email" placeholder="Email" required>
  <input name="company" placeholder="Company">
  <textarea name="message" placeholder="How can we help?" required></textarea>
  <!-- honeypot: keep hidden -->
  <input name="website" style="display:none" tabindex="-1" autocomplete="off">
  <button type="submit">Send</button>
</form>`;
  const curl = `curl -X POST ${endpoint} \\
  -H "content-type: application/json" \\
  -d '{"name":"Jane","email":"jane@acme.com","message":"We need a quote for a new website, budget approved."}'`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Automation</h1>
        <p className="text-sm text-slate-600">Every website form submission is saved, qualified by AI, logged to Google Sheets and pushed to Telegram — automatically.</p>
      </div>

      <ol aria-label="Workflow" className="flex flex-wrap items-center gap-2 text-sm">
        {flow.map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm">{step}</span>
            {i < flow.length - 1 && <span aria-hidden className="text-slate-300">→</span>}
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <div>
            <h2 className="font-semibold">1. Connect your website</h2>
            <p className="text-sm text-slate-500">Use the hosted form, embed the HTML form, or POST JSON from any backend.</p>
          </div>
          <CopyField label="Hosted form" value={hostedForm} />
          <Link href={`/f/${config.formKey}`} target="_blank" className="inline-block text-sm font-medium text-indigo-600 hover:underline">
            Open hosted form ↗
          </Link>
          <CopyField label="Webhook endpoint" value={endpoint} />
          <CopyField label="HTML embed" value={embed} multiline />
          <CopyField label="cURL" value={curl} multiline />
          <form action={rotateFormKeyAction}>
            <SubmitButton variant="ghost" pendingText="Rotating…" className="px-0 text-xs">Rotate form key (old links stop working)</SubmitButton>
          </form>
        </Card>

        <Card className="space-y-4 p-6">
          <div>
            <h2 className="font-semibold">2. Integrations</h2>
            <p className="text-sm text-slate-500">
              Optional. Steps that aren&apos;t configured are skipped.{" "}
              <a href="https://github.com/Boldowen/leadflow-ai/blob/main/docs/AUTOMATION.md" target="_blank" className="text-indigo-600 hover:underline">
                Setup guide ↗
              </a>
            </p>
          </div>
          <IntegrationsForm config={config} />
        </Card>
      </div>

      <Card>
        <div className="border-b border-slate-200 p-4">
          <h2 className="font-semibold">Recent runs</h2>
        </div>
        {runs.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">No runs yet — submit the hosted form to see the workflow in action.</p>
        ) : (
          <ul aria-label="Automation runs" className="divide-y divide-slate-100">
            {runs.map((run) => {
              const steps = run.steps as unknown as StepResult[];
              return (
                <li key={run.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
                  <span className={`w-20 font-semibold ${runStyle[run.status]}`}>{run.status}</span>
                  <span className="min-w-32 flex-1 truncate">
                    {run.lead ? <Link href={`/dashboard/leads/${run.lead.id}`} className="hover:underline">{run.lead.name}</Link> : "Deleted lead"}
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {steps.map((s) => (
                      <span key={s.step} title={s.detail} className={`rounded-md px-2 py-0.5 text-xs font-medium ${stepStyle[s.status]}`}>
                        {stepLabel[s.step]}: {s.status}
                      </span>
                    ))}
                  </span>
                  <time className="text-xs text-slate-400">{run.createdAt.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}</time>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
