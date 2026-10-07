"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { AnalysisError } from "@/lib/ai";
import { createLead, deleteLead, runLeadAnalysis, updateLead } from "@/lib/leads";
import { fieldErrors, leadSchema } from "@/lib/validation";

export type LeadFormState =
  | { errors?: Record<string, string>; values?: Record<string, string>; saved?: boolean }
  | undefined;

export async function createLeadAction(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: raw };

  const lead = await createLead(user.id, parsed.data);
  revalidatePath("/dashboard");
  redirect(`/dashboard/leads/${lead.id}`);
}

export async function updateLeadAction(id: string, _prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: raw };

  const lead = await updateLead(user.id, id, parsed.data);
  if (!lead) return { errors: { form: "Lead not found" } };
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/leads/${id}`);
  return { saved: true };
}

export async function deleteLeadAction(id: string) {
  const user = await requireUser();
  await deleteLead(user.id, id);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export type AnalyzeState = { error?: string; ok?: boolean } | undefined;

export async function analyzeLeadAction(id: string): Promise<AnalyzeState> {
  const user = await requireUser();
  try {
    const lead = await runLeadAnalysis(user.id, id);
    if (!lead) return { error: "Lead not found" };
  } catch (err) {
    if (err instanceof AnalysisError) return { error: err.message };
    throw err;
  }
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/leads/${id}`);
  return { ok: true };
}
