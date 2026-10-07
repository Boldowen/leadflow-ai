import type { NextRequest } from "next/server";
import { authed, json, parseBody } from "@/lib/api";
import { createLead, listLeads } from "@/lib/leads";
import { leadSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const auth = await authed();
  if (auth.response) return auth.response;
  const params = request.nextUrl.searchParams;
  const leads = await listLeads(auth.user.id, {
    q: params.get("q") ?? undefined,
    status: params.get("status") ?? undefined,
  });
  return json({ leads });
}

export async function POST(request: NextRequest) {
  const auth = await authed();
  if (auth.response) return auth.response;
  const body = await parseBody(request, leadSchema);
  if (body.response) return body.response;
  const lead = await createLead(auth.user.id, body.data, "api");
  return json({ lead }, 201);
}
