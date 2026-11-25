"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/client";
import { requireAdmin, type CurrentUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { mailConfigured, MailNotConfiguredError } from "@/lib/mail";
import { PROTECTED_EMAILS, sendPasswordResetEmail } from "@/lib/password-reset";
import { hashPassword } from "@/lib/passwords";
import { emailField, fieldErrors, nameField, newPassword } from "@/lib/validation";
import { z } from "zod";

export type AdminState = { ok?: string; error?: string; errors?: Record<string, string> } | undefined;

// Every action re-checks the role against the DB: server actions are public endpoints.
async function target(id: string) {
  const admin = await requireAdmin();
  const user = await db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true } });
  return { admin, user };
}

function audit(admin: CurrentUser, action: string, targetEmail: string | null, detail?: string) {
  return db.auditLog.create({ data: { actorId: admin.id, actorEmail: admin.email, action, targetEmail, detail } });
}

function done(id: string, ok: string): AdminState {
  revalidatePath("/admin");
  revalidatePath(`/admin/users/${id}`);
  return { ok };
}

const NOT_FOUND: AdminState = { error: "User not found." };

export async function updateUserProfile(id: string, _prev: AdminState, formData: FormData): Promise<AdminState> {
  const { admin, user } = await target(id);
  if (!user) return NOT_FOUND;
  const parsed = z.object({ name: nameField, email: emailField }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const { name, email } = parsed.data;
  if (email !== user.email && (await db.user.findUnique({ where: { email }, select: { id: true } }))) {
    return { errors: { email: "Another account already uses this email" } };
  }
  await db.user.update({ where: { id }, data: { name, email } });
  // Reset links already mailed to the old address must not keep working after an email change.
  if (email !== user.email) await db.passwordResetToken.deleteMany({ where: { userId: id } });
  const changes = [name !== user.name && `name "${user.name}" → "${name}"`, email !== user.email && `email ${user.email} → ${email}`].filter(Boolean);
  if (changes.length) await audit(admin, "update_profile", email, changes.join(", "));
  return done(id, changes.length ? "Profile saved." : "Nothing changed.");
}

export async function setUserPassword(id: string, _prev: AdminState, formData: FormData): Promise<AdminState> {
  const { admin, user } = await target(id);
  if (!user) return NOT_FOUND;
  const parsed = newPassword.safeParse(formData.get("password"));
  if (!parsed.success) return { errors: { password: parsed.error.issues[0].message } };
  await db.$transaction([
    db.user.update({ where: { id }, data: { passwordHash: await hashPassword(parsed.data), sessionVersion: { increment: 1 } } }),
    db.passwordResetToken.deleteMany({ where: { userId: id } }),
  ]);
  await audit(admin, "set_password", user.email, "signed out everywhere");
  if (id === admin.id) redirect("/login?reset=1"); // the admin's own session was just revoked
  return done(id, "Password changed. The user was signed out on every device.");
}

export async function sendResetLinkAction(id: string): Promise<AdminState> {
  const { admin, user } = await target(id);
  if (!user) return NOT_FOUND;
  if (PROTECTED_EMAILS.includes(user.email)) return { error: "The demo account can't receive reset emails." };
  if (!mailConfigured() && process.env.NODE_ENV === "production" && !process.env.TEST_MAIL_CAPTURE_FILE) {
    return { error: "Email isn't configured (RESEND_API_KEY, EMAIL_FROM). Set a password instead." };
  }
  try {
    await sendPasswordResetEmail(user);
  } catch (err) {
    return { error: err instanceof MailNotConfiguredError ? err.message : "Sending failed. Try again or set a password instead." };
  }
  await audit(admin, "send_reset_link", user.email);
  return done(id, `Reset link sent to ${user.email}.`);
}

export async function revokeSessionsAction(id: string): Promise<AdminState> {
  const { admin, user } = await target(id);
  if (!user) return NOT_FOUND;
  await db.user.update({ where: { id }, data: { sessionVersion: { increment: 1 } } });
  await audit(admin, "revoke_sessions", user.email);
  if (id === admin.id) redirect("/login?expired=1");
  return done(id, "Signed out on every device.");
}

export async function setUserRoleAction(id: string, role: Role): Promise<AdminState> {
  const { admin, user } = await target(id);
  if (!user) return NOT_FOUND;
  // You can't change your own role, so at least one admin (you) always remains.
  if (id === admin.id) return { error: "You can't change your own role." };
  if (role !== "ADMIN" && role !== "USER") return { error: "Unknown role." };
  if (role === "ADMIN" && PROTECTED_EMAILS.includes(user.email)) return { error: "The demo account's password is public; it can't be an admin." };
  if (user.role === role) return done(id, "Nothing changed.");
  await db.user.update({ where: { id }, data: { role } });
  await audit(admin, "set_role", user.email, `${user.role} → ${role}`);
  return done(id, role === "ADMIN" ? "Now an admin." : "Admin rights removed.");
}

export async function deleteUserAction(id: string, _prev: AdminState, formData: FormData): Promise<AdminState> {
  const { admin, user } = await target(id);
  if (!user) return NOT_FOUND;
  if (id === admin.id) return { error: "You can't delete your own account here." };
  if (String(formData.get("confirm") ?? "").trim().toLowerCase() !== user.email) {
    return { errors: { confirm: "Type the user's email exactly to confirm" } };
  }
  const [leads] = await db.$transaction([db.lead.count({ where: { ownerId: id } }), db.user.delete({ where: { id } })]);
  await audit(admin, "delete_user", user.email, `${leads} leads deleted`);
  revalidatePath("/admin");
  redirect("/admin?deleted=1");
}
