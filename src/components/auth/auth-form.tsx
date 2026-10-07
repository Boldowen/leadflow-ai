"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register, type AuthState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [state, action] = useActionState<AuthState, FormData>(mode === "login" ? login : register, undefined);
  const e = state?.errors ?? {};
  const v = state?.values ?? {};
  const isLogin = mode === "login";

  return (
    <form action={action} className="space-y-4" noValidate>
      {e.form && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {e.form}
        </p>
      )}
      {!isLogin && (
        <Field label="Name" name="name" error={e.name}>
          <input id="name" name="name" className="input" autoComplete="name" defaultValue={v.name} aria-invalid={!!e.name} />
        </Field>
      )}
      <Field label="Email" name="email" error={e.email}>
        <input id="email" name="email" type="email" className="input" autoComplete="email" defaultValue={v.email} aria-invalid={!!e.email} />
      </Field>
      <Field label="Password" name="password" error={e.password} hint={isLogin ? undefined : "At least 8 characters"}>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          autoComplete={isLogin ? "current-password" : "new-password"}
          aria-invalid={!!e.password}
        />
      </Field>
      <SubmitButton className="w-full" pendingText={isLogin ? "Logging in…" : "Creating account…"}>
        {isLogin ? "Log in" : "Create account"}
      </SubmitButton>
      <p className="text-center text-sm text-slate-600">
        {isLogin ? "No account yet? " : "Already have an account? "}
        <Link href={isLogin ? "/register" : "/login"} className="font-medium text-indigo-600 hover:underline">
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
