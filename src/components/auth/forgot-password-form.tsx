"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type AuthState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui";

export function ForgotPasswordForm() {
  const [state, action] = useActionState<AuthState, FormData>(requestPasswordReset, undefined);
  const e = state?.errors ?? {};

  if (state?.sent) {
    return (
      <div role="status" className="space-y-3 text-sm text-zinc-300">
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-200">
          If an account exists for that email, we&apos;ve sent a link to reset the password. It expires in 30 minutes.
        </p>
        <p>
          Didn&apos;t get it? Check your spam folder, or{" "}
          <Link href="/forgot-password" className="font-medium text-indigo-300 hover:underline">try again</Link>.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      {e.form && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{e.form}</p>}
      <Field label="Email" name="email" error={e.email}>
        <input id="email" name="email" type="email" className="input" autoComplete="email" defaultValue={state?.values?.email} aria-invalid={!!e.email} />
      </Field>
      <SubmitButton className="w-full" pendingText="Sending…">Send reset link</SubmitButton>
      <p className="text-center text-sm text-zinc-400">
        Remembered it? <Link href="/login" className="font-medium text-indigo-300 hover:underline">Log in</Link>
      </p>
    </form>
  );
}
