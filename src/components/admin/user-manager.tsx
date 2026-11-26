"use client";

import { useActionState } from "react";
import type { AdminState } from "@/app/admin/actions";
import { SubmitButton } from "@/components/submit-button";
import { Card, Field } from "@/components/ui";

type FormAction = (prev: AdminState, formData: FormData) => Promise<AdminState>;
type ButtonAction = () => Promise<AdminState>;

function Feedback({ state }: { state: AdminState }) {
  if (state?.ok) return <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.ok}</p>;
  if (state?.error) return <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>;
  return null;
}

export function ProfileForm({ action, name, email }: { action: FormAction; name: string; email: string }) {
  const [state, run] = useActionState(action, undefined);
  const e = state?.errors ?? {};
  return (
    <Card className="space-y-4 p-6">
      <h2 className="font-semibold">Profile</h2>
      <form action={run} className="space-y-4" noValidate>
        <Feedback state={state} />
        <Field label="Name" name="name" error={e.name}>
          <input id="name" name="name" className="input" defaultValue={name} aria-invalid={!!e.name} />
        </Field>
        <Field label="Email" name="email" error={e.email}>
          <input id="email" name="email" type="email" className="input" defaultValue={email} aria-invalid={!!e.email} />
        </Field>
        <SubmitButton pendingText="Saving…">Save profile</SubmitButton>
      </form>
    </Card>
  );
}

export function PasswordCard({ setPassword, sendLink, revoke }: { setPassword: FormAction; sendLink: ButtonAction; revoke: ButtonAction }) {
  const [state, run] = useActionState(setPassword, undefined);
  const [linkState, runLink] = useActionState(sendLink, undefined);
  const [revokeState, runRevoke] = useActionState(revoke, undefined);
  return (
    <Card className="space-y-4 p-6">
      <div>
        <h2 className="font-semibold">Password &amp; sessions</h2>
        <p className="text-sm text-slate-500">Changing the password signs the user out on every device.</p>
      </div>
      <form action={run} className="space-y-3" noValidate>
        <Feedback state={state} />
        <Field label="New password" name="password" error={state?.errors?.password} hint="At least 8 characters. Share it with the user over a safe channel.">
          <input id="password" name="password" type="password" className="input" autoComplete="new-password" aria-invalid={!!state?.errors?.password} />
        </Field>
        <SubmitButton pendingText="Saving…">Set password</SubmitButton>
      </form>
      <div className="space-y-3 border-t border-slate-100 pt-4">
        <Feedback state={linkState} />
        <Feedback state={revokeState} />
        <div className="flex flex-wrap gap-3">
          <form action={runLink}>
            <SubmitButton variant="secondary" pendingText="Sending…">Email a reset link</SubmitButton>
          </form>
          <form action={runRevoke}>
            <SubmitButton variant="secondary" pendingText="Signing out…">Sign out everywhere</SubmitButton>
          </form>
        </div>
      </div>
    </Card>
  );
}

export function RoleCard({ isAdmin, isSelf, action }: { isAdmin: boolean; isSelf: boolean; action: ButtonAction }) {
  const [state, run] = useActionState(action, undefined);
  return (
    <Card className="space-y-3 p-6">
      <h2 className="font-semibold">Role</h2>
      <p className="text-sm text-slate-600">
        {isAdmin ? "Admins can see usage across all accounts and manage users." : "Regular user. Sees only their own leads."}
      </p>
      <Feedback state={state} />
      {isSelf ? (
        <p className="text-sm text-slate-500">You can&apos;t change your own role.</p>
      ) : (
        <form
          action={run}
          onSubmit={(e) => {
            if (!confirm(isAdmin ? "Remove admin rights?" : "Give this user full admin rights?")) e.preventDefault();
          }}
        >
          <SubmitButton variant={isAdmin ? "danger" : "secondary"} pendingText="Saving…">
            {isAdmin ? "Remove admin rights" : "Make admin"}
          </SubmitButton>
        </form>
      )}
    </Card>
  );
}

export function DeleteUserCard({ action, email, isSelf }: { action: FormAction; email: string; isSelf: boolean }) {
  const [state, run] = useActionState(action, undefined);
  return (
    <Card className="space-y-3 border-red-200 p-6">
      <h2 className="font-semibold text-red-700">Delete account</h2>
      <p className="text-sm text-slate-600">Deletes the account with all its leads, automation runs and settings. This can&apos;t be undone.</p>
      {isSelf ? (
        <p className="text-sm text-slate-500">You can&apos;t delete your own account here.</p>
      ) : (
        <form action={run} className="space-y-3" noValidate>
          <Feedback state={state} />
          <Field label={`Type ${email} to confirm`} name="confirm" error={state?.errors?.confirm}>
            <input id="confirm" name="confirm" className="input" autoComplete="off" aria-invalid={!!state?.errors?.confirm} />
          </Field>
          <SubmitButton variant="danger" pendingText="Deleting…">Delete account</SubmitButton>
        </form>
      )}
    </Card>
  );
}
