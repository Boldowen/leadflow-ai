import { after, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, runInboundWorkflow } from "@/lib/automation";
import { createLead } from "@/lib/leads";
import { fieldErrors, publicFormSchema } from "@/lib/validation";

// Public endpoint: website contact forms anywhere can POST here (JSON or a plain HTML form).
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

const reply = (data: unknown, status: number) => Response.json(data, { status, headers: CORS });

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request: NextRequest, ctx: RouteContext<"/api/forms/[formKey]">) {
  const { formKey } = await ctx.params;
  const isHtmlForm = !request.headers.get("content-type")?.includes("application/json");

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(`${formKey}:${ip}`)) return reply({ error: "Too many submissions. Try again in a minute." }, 429);

  const owner = await db.user.findUnique({ where: { formKey }, select: { id: true } });
  if (!owner) return reply({ error: "Form not found" }, 404);

  let raw: unknown;
  try {
    raw = isHtmlForm ? Object.fromEntries(await request.formData()) : await request.json();
  } catch {
    return reply({ error: "Invalid request body" }, 400);
  }

  const parsed = publicFormSchema.safeParse(raw);
  if (!parsed.success) return reply({ error: "Validation failed", details: fieldErrors(parsed.error) }, 422);

  const { website, ...data } = parsed.data;
  // Honeypot filled → pretend success so bots learn nothing, but store nothing.
  if (website) return isHtmlForm ? thanks(request, formKey) : reply({ ok: true }, 202);

  const lead = await createLead(owner.id, { ...data, notes: "", status: "NEW" }, "website-form");
  // AI + integrations run after the response, so the visitor never waits on them.
  after(() => runInboundWorkflow(owner.id, lead.id));

  return isHtmlForm ? thanks(request, formKey) : reply({ ok: true, leadId: lead.id }, 202);
}

function thanks(request: NextRequest, formKey: string) {
  return Response.redirect(new URL(`/f/${formKey}?sent=1`, request.url), 303);
}
