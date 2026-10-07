"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { fieldErrors, loginSchema, registerSchema } from "@/lib/validation";

export type AuthState = { errors?: Record<string, string>; values?: Record<string, string> } | undefined;

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: { name: raw.name, email: raw.email } };

  const { name, email, password } = parsed.data;
  const exists = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) return { errors: { email: "An account with this email already exists" }, values: { name, email } };

  const user = await db.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10) },
  });
  await createSession(user.id);
  redirect("/dashboard");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: { email: raw.email } };

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  // Same message for unknown email and wrong password — don't leak which accounts exist.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { errors: { form: "Invalid email or password" }, values: { email } };
  }
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
