import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/client";
import { db } from "./db";
import { getSession } from "./session";

export type CurrentUser = { id: string; name: string; email: string; role: Role };

/** Returns the signed-in user, or null. Deduped per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, sessionVersion: true },
  });
  // Deleted account, password changed, or "sign out everywhere": the token is no longer valid.
  if (!user || user.sessionVersion !== session.v) return null;
  const { sessionVersion: _v, ...rest } = user;
  void _v;
  return rest;
});

/** For pages and server actions: redirects to /login when signed out. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    // A signed cookie that no longer maps to a valid session would bounce between /login and
    // /dashboard in the proxy; `expired` tells the proxy to let the login page render.
    redirect((await getSession()) ? "/login?expired=1" : "/login");
  }
  return user;
}

/** For admin pages and data: the role is read from the DB on every request, so revoking it applies immediately. 404s for everyone else. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") notFound();
  return user;
}
