"use client";

import { useActionState } from "react";
import type { LeadFormState } from "@/app/actions/leads";
import { SubmitButton } from "@/components/submit-button";
import { ButtonLink, Field } from "@/components/ui";
import { LEAD_STATUSES } from "@/lib/validation";

type LeadValues = { name: string; email: string; company: string | null; message: string; notes: string; status: string };

export function LeadForm({
  action,
  lead,
  submitLabel,
  cancelHref = "/dashboard",
}: {
  action: (state: LeadFormState, formData: FormData) => Promise<LeadFormState>;
  lead?: LeadValues;
  submitLabel: string;
  cancelHref?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const e = state?.errors ?? {};
  // After a failed submit, re-show what the user typed; otherwise show the saved lead.
  const v: Partial<Record<keyof LeadValues, string>> = state?.values ?? {
    ...lead,
    company: lead?.company ?? "",
  };

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {e.form && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{e.form}</p>}
      {state?.saved && (
        <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Lead saved.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" error={e.name}>
          <input id="name" name="name" className="input" defaultValue={v.name} aria-invalid={!!e.name} />
        </Field>
        <Field label="Email" name="email" error={e.email}>
          <input id="email" name="email" type="email" className="input" defaultValue={v.email} aria-invalid={!!e.email} />
        </Field>
        <Field label="Company" name="company" error={e.company}>
          <input id="company" name="company" className="input" defaultValue={v.company} />
        </Field>
        <Field label="Status" name="status" error={e.status}>
          <select id="status" name="status" className="input" defaultValue={v.status ?? "NEW"}>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0] + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Message from lead" name="message" error={e.message} hint="What the lead wrote to you — this is what AI analyzes.">
        <textarea id="message" name="message" rows={5} className="input" defaultValue={v.message} />
      </Field>
      <Field label="Notes" name="notes" error={e.notes} hint="Private notes for your team.">
        <textarea id="notes" name="notes" rows={3} className="input" defaultValue={v.notes} />
      </Field>

      <div className="flex gap-3">
        <SubmitButton pendingText="Saving…">{submitLabel}</SubmitButton>
        <ButtonLink href={cancelHref} variant="secondary">Cancel</ButtonLink>
      </div>
    </form>
  );
}
