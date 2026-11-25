import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { findValidToken } from "@/lib/password-reset";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false }, referrer: "no-referrer" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const valid = typeof token === "string" && token.length <= 200 && (await findValidToken(token));

  if (!valid) {
    return (
      <>
        <h1 className="mb-1 text-xl font-semibold">Link expired</h1>
        <p className="mb-6 text-sm text-slate-600">This reset link is invalid, already used, or older than 30 minutes.</p>
        <ButtonLink href="/forgot-password" className="w-full">Request a new link</ButtonLink>
      </>
    );
  }
  return (
    <>
      <h1 className="mb-1 text-xl font-semibold">Choose a new password</h1>
      <p className="mb-6 text-sm text-slate-600">You&apos;ll be signed out on every device and can log in with the new password.</p>
      <ResetPasswordForm token={token as string} />
    </>
  );
}
