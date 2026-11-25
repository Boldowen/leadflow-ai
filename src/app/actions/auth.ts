"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PROTECTED_EMAILS, resetPasswordWithToken, sendPasswordResetEmail } from "@/lib/password-reset";
import { hashPassword, verifyPassword } from "@/lib/passwords";
import { AUTH_IP_LIMIT, rateLimit } from "@/lib/rate-limit";
import { requestIp } from "@/lib/request-ip";
import { createSession, deleteSession } from "@/lib/session";
import { fieldErrors, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, safeNextPath } from "@/lib/validation";

export type AuthState = { errors?: Record<string, string>; values?: Record<string, string>; sent?: boolean } | undefined;

const MIN = 60 * 1000;
const tooMany = (values: Record<string, string>): AuthState => ({
  errors: { form: "Too many attempts. Wait a few minutes and try again." },
  values,
});

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: { name: raw.name, email: raw.email } };

  const { name, email, password } = parsed.data;
  if (!(await rateLimit(`register:ip:${await requestIp()}`, AUTH_IP_LIMIT, 60 * MIN))) return tooMany({ name, email });

  const exists = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) return { errors: { email: "An account with this email already exists" }, values: { name, email } };

  const user = await db.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
  });
  await createSession(user.id, user.sessionVersion);
  redirect("/dashboard");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: { email: raw.email } };

  const { email, password } = parsed.data;
  // Per-account limit stops password guessing; the per-IP one stops spraying many accounts.
  const allowed =
    (await rateLimit(`login:email:${email}`, 10, 15 * MIN)) && (await rateLimit(`login:ip:${await requestIp()}`, AUTH_IP_LIMIT, 15 * MIN));
  if (!allowed) return tooMany({ email });

  const user = await db.user.findUnique({ where: { email }, select: { id: true, passwordHash: true, sessionVersion: true } });
  // Same message and the same bcrypt work for unknown email and wrong password — don't leak which accounts exist.
  if (!(await verifyPassword(password, user?.passwordHash)) || !user) {
    return { errors: { form: "Invalid email or password" }, values: { email } };
  }
  await createSession(user.id, user.sessionVersion);
  redirect(safeNextPath(raw.next));
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

const SENT: AuthState = { sent: true };

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: { email: raw.email } };
  const { email } = parsed.data;

  const allowed =
    (await rateLimit(`reset:email:${email}`, 3, 60 * MIN)) && (await rateLimit(`reset:ip:${await requestIp()}`, AUTH_IP_LIMIT, 15 * MIN));
  if (!allowed) return tooMany({ email });

  // Look-up and sending happen after the response, so timing can't reveal whether the account exists.
  after(async () => {
    if (PROTECTED_EMAILS.includes(email)) return;
    const user = await db.user.findUnique({ where: { email }, select: { id: true, email: true, name: true } });
    if (!user) return;
    try {
      await sendPasswordResetEmail(user);
    } catch (err) {
      console.error("password reset email failed", err instanceof Error ? err.message : err);
    }
  });
  return SENT;
}

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  if (!(await rateLimit(`reset-submit:ip:${await requestIp()}`, AUTH_IP_LIMIT, 15 * MIN))) return tooMany({});

  if (!(await resetPasswordWithToken(parsed.data.token, parsed.data.password))) {
    return { errors: { form: "This reset link is invalid or has expired. Request a new one." } };
  }
  await deleteSession();
  redirect("/login?reset=1");
}
