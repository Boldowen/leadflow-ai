import "server-only";
import { z } from "zod";
import { getCurrentUser } from "./dal";
import { fieldErrors } from "./validation";

export const json = (data: unknown, status = 200) => Response.json(data, { status });

export const apiError = (status: number, error: string, details?: Record<string, string>) =>
  json({ error, ...(details ? { details } : {}) }, status);

/** Resolves the session user or returns a 401 response. */
export async function authed() {
  const user = await getCurrentUser();
  return user ? { user } : { response: apiError(401, "Unauthorized") };
}

export async function parseBody<T extends z.ZodType>(request: Request, schema: T) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { response: apiError(400, "Body must be valid JSON") };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { response: apiError(422, "Validation failed", fieldErrors(parsed.error)) };
  return { data: parsed.data as z.infer<T> };
}
