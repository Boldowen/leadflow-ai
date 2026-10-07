import type { NextRequest } from "next/server";
import { apiError, authed, json, parseBody } from "@/lib/api";
import { deleteLead, getLead, updateLead } from "@/lib/leads";
import { leadUpdateSchema } from "@/lib/validation";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/leads/[id]">) {
  const auth = await authed();
  if (auth.response) return auth.response;
  const lead = await getLead(auth.user.id, (await ctx.params).id);
  return lead ? json({ lead }) : apiError(404, "Lead not found");
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/leads/[id]">) {
  const auth = await authed();
  if (auth.response) return auth.response;
  const body = await parseBody(request, leadUpdateSchema);
  if (body.response) return body.response;
  const lead = await updateLead(auth.user.id, (await ctx.params).id, body.data);
  return lead ? json({ lead }) : apiError(404, "Lead not found");
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/leads/[id]">) {
  const auth = await authed();
  if (auth.response) return auth.response;
  const deleted = await deleteLead(auth.user.id, (await ctx.params).id);
  return deleted ? new Response(null, { status: 204 }) : apiError(404, "Lead not found");
}
