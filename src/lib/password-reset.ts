import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { appUrl } from "./app-url";
import { db } from "./db";
import { sendMail } from "./mail";
import { hashPassword } from "./passwords";

const TTL_MS = 30 * 60 * 1000;
/** Their passwords are public, so nobody may take them over through a reset. */
export const PROTECTED_EMAILS = ["demo@emberza.dev", "demo@leadflow.dev"];

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** Issues a fresh single-use link (older unused ones stop working) and emails it. */
export async function sendPasswordResetEmail(user: { id: string; email: string; name: string }) {
  const token = randomBytes(32).toString("base64url");
  await db.$transaction([
    db.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    db.passwordResetToken.create({ data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + TTL_MS) } }),
  ]);
  const link = `${appUrl()}/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: "Reset your Emberza password",
    text: `Hi ${user.name},\n\nUse this link to choose a new password. It expires in 30 minutes and works once:\n${link}\n\nIf you didn't ask for this, ignore this email — your password stays the same.`,
    html: `<p>Hi ${escape(user.name)},</p><p>Use this link to choose a new password. It expires in 30 minutes and works once:</p><p><a href="${link}">Reset your password</a></p><p>If you didn't ask for this, ignore this email — your password stays the same.</p>`,
  });
}

/** Valid = exists, unused and not expired. Does not consume it. */
export async function findValidToken(token: string) {
  const row = await db.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) }, select: { id: true, userId: true, usedAt: true, expiresAt: true } });
  return row && !row.usedAt && row.expiresAt > new Date() ? row : null;
}

/** Sets the new password, burns the token and signs the user out everywhere. Returns false if the link is no longer valid. */
export async function resetPasswordWithToken(token: string, password: string) {
  const row = await findValidToken(token);
  if (!row) return false;
  const passwordHash = await hashPassword(password);
  // The conditional update makes the token single-use even if two requests race.
  const { count } = await db.passwordResetToken.updateMany({ where: { id: row.id, usedAt: null }, data: { usedAt: new Date() } });
  if (count !== 1) return false;
  await db.$transaction([
    db.user.update({ where: { id: row.userId }, data: { passwordHash, sessionVersion: { increment: 1 } } }),
    db.passwordResetToken.deleteMany({ where: { userId: row.userId, id: { not: row.id } } }),
  ]);
  return true;
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
