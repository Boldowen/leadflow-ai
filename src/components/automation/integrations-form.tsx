"use client";

import { useActionState } from "react";
import { saveIntegrationsAction, sendTelegramTestAction, type IntegrationsState, type TestState } from "@/app/actions/automation";
import { SubmitButton } from "@/components/submit-button";
import { Button, Field, Spinner } from "@/components/ui";

type Config = { sheetsWebhookUrl: string | null; telegramBotToken: string | null; telegramChatId: string | null };

export function IntegrationsForm({ config }: { config: Config }) {
  const [state, action] = useActionState<IntegrationsState, FormData>(saveIntegrationsAction, undefined);
  const [test, runTest, testing] = useActionState<TestState>(sendTelegramTestAction, undefined);
  const e = state?.errors ?? {};
  const v = state?.values ?? {
    sheetsWebhookUrl: config.sheetsWebhookUrl ?? "",
    telegramBotToken: config.telegramBotToken ?? "",
    telegramChatId: config.telegramChatId ?? "",
  };

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4" noValidate>
        {state?.saved && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Integrations saved.</p>}
        <Field label="Google Sheets web app URL" name="sheetsWebhookUrl" error={e.sheetsWebhookUrl} hint="Deploy the Apps Script from the docs as a web app and paste its URL.">
          <input id="sheetsWebhookUrl" name="sheetsWebhookUrl" className="input" placeholder="https://script.google.com/macros/s/…/exec" defaultValue={v.sheetsWebhookUrl} aria-invalid={!!e.sheetsWebhookUrl} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telegram bot token" name="telegramBotToken" error={e.telegramBotToken} hint="From @BotFather">
            <input id="telegramBotToken" name="telegramBotToken" type="password" className="input" autoComplete="off" defaultValue={v.telegramBotToken} aria-invalid={!!e.telegramBotToken} />
          </Field>
          <Field label="Telegram chat ID" name="telegramChatId" error={e.telegramChatId} hint="Message @userinfobot to get yours">
            <input id="telegramChatId" name="telegramChatId" className="input" defaultValue={v.telegramChatId} aria-invalid={!!e.telegramChatId} />
          </Field>
        </div>
        <SubmitButton pendingText="Saving…">Save integrations</SubmitButton>
      </form>

      <form action={runTest} className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        <Button type="submit" variant="secondary" disabled={testing}>
          {testing && <Spinner />} Send Telegram test
        </Button>
        {test?.ok && <span role="status" className="text-sm text-emerald-700">Test message sent ✓</span>}
        {test?.error && <span role="alert" className="text-sm text-red-600">{test.error}</span>}
      </form>
    </div>
  );
}
