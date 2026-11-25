"use client";

import { useActionState } from "react";
import { resetPassword, type AuthState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState<AuthState, FormData>(resetPassword, undefined);
  const e = state?.errors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      {e.form && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{e.form}</p>}
      <input type="hidden" name="token" value={token} />
      <Field label="New password" name="password" error={e.password} hint="At least 8 characters">
        <input id="password" name="password" type="password" className="input" autoComplete="new-password" aria-invalid={!!e.password} />
      </Field>
      <Field label="Confirm new password" name="confirm" error={e.confirm}>
        <input id="confirm" name="confirm" type="password" className="input" autoComplete="new-password" aria-invalid={!!e.confirm} />
      </Field>
      <SubmitButton className="w-full" pendingText="Saving…">Set new password</SubmitButton>
    </form>
  );
}
