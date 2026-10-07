"use client";

import { useState } from "react";
import { Button, Field, Spinner } from "@/components/ui";

export function ContactForm({ formKey, initiallySent = false }: { formKey: string; initiallySent?: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">(initiallySent ? "sent" : "idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrors({});
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch(`/api/forms/${formKey}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) return setStatus("sent");
      setErrors(data.details ?? { form: data.error ?? "Something went wrong" });
    } catch {
      setErrors({ form: "Network error — please try again." });
    }
    setStatus("idle");
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-xl bg-emerald-50 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-800">Thanks — message received!</p>
        <p className="mt-1 text-sm text-emerald-700">We&apos;ll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {errors.form && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" error={errors.name}>
          <input id="name" name="name" className="input" autoComplete="name" aria-invalid={!!errors.name} />
        </Field>
        <Field label="Email" name="email" error={errors.email}>
          <input id="email" name="email" type="email" className="input" autoComplete="email" aria-invalid={!!errors.email} />
        </Field>
      </div>
      <Field label="Company (optional)" name="company">
        <input id="company" name="company" className="input" autoComplete="organization" />
      </Field>
      <Field label="How can we help?" name="message" error={errors.message}>
        <textarea id="message" name="message" rows={5} className="input" aria-invalid={!!errors.message} />
      </Field>
      {/* Honeypot — hidden from people, tempting for bots */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Button type="submit" disabled={status === "sending"} className="w-full">
        {status === "sending" && <Spinner />}
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
