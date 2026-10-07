import { z } from "zod";

export const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"] as const;

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

const leadFields = {
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  company: z.string().trim().max(120),
  message: z.string().trim().max(5000),
  notes: z.string().trim().max(5000),
  status: z.enum(LEAD_STATUSES),
};

/** Create: optional fields get defaults. */
export const leadSchema = z.object({
  ...leadFields,
  company: leadFields.company.optional().default(""),
  message: leadFields.message.optional().default(""),
  notes: leadFields.notes.optional().default(""),
  status: leadFields.status.optional().default("NEW"),
});

/** Update (PATCH): no defaults, so omitted fields are left untouched. */
export const leadUpdateSchema = z.object(leadFields).partial();

export type LeadInput = z.infer<typeof leadSchema>;

/** Flattens zod errors into { field: firstMessage }. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

/** Public website form. `website` is a honeypot: humans never see it, bots fill it. */
export const publicFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  company: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(10, "Tell us a bit more (at least 10 characters)").max(5000),
  website: z.string().optional().default(""),
});

const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

export const integrationsSchema = z.object({
  sheetsWebhookUrl: z.preprocess(
    emptyToNull,
    z
      .url("Enter a valid URL")
      .trim()
      .refine((u) => u.startsWith("https://script.google.com/macros/"), "Must be a Google Apps Script web app URL (https://script.google.com/macros/…)")
      .nullable(),
  ),
  telegramBotToken: z.preprocess(
    emptyToNull,
    z.string().trim().regex(/^\d{5,}:[\w-]{30,}$/, "Looks like an invalid bot token (format 123456:ABC…)").nullable(),
  ),
  telegramChatId: z.preprocess(
    emptyToNull,
    z.string().trim().regex(/^-?\d+$|^@\w{4,}$/, "Chat ID is a number (e.g. 123456789) or @channelname").nullable(),
  ),
});
