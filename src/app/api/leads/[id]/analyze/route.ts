import type { NextRequest } from "next/server";
import { apiError, authed, json } from "@/lib/api";
import { AnalysisError } from "@/lib/ai";
import { runLeadAnalysis } from "@/lib/leads";

export async function POST(_req: NextRequest, ctx: RouteContext<"/api/leads/[id]/analyze">) {
  const auth = await authed();
  if (auth.response) return auth.response;
  try {
    const lead = await runLeadAnalysis(auth.user.id, (await ctx.params).id);
    return lead ? json({ lead }) : apiError(404, "Lead not found");
  } catch (err) {
    if (err instanceof AnalysisError) return apiError(422, err.message);
    throw err;
  }
}
