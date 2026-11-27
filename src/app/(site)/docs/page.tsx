import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/site/json-ld";
import { PageIntro, Prose } from "@/components/site/prose";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Docs: Website Form Integration, Automations & REST API",
  description:
    "Connect your website contact form to Emberza, send leads to Google Sheets and Telegram, and use the REST API to create and AI-score leads.",
  alternates: { canonical: "/docs" },
  openGraph: { url: "/docs" },
};

const toc = [
  ["quick-start", "Quick start"],
  ["connect-your-website", "Connect your website"],
  ["form-fields", "Form fields and validation"],
  ["ai-lead-qualification", "AI lead qualification"],
  ["google-sheets", "Google Sheets"],
  ["telegram", "Telegram alerts"],
  ["run-log", "Automation run log"],
  ["rest-api", "REST API"],
];

const embed = `<form action="https://emberza.dev/api/forms/YOUR_FORM_KEY" method="POST">
  <input name="name" placeholder="Name" required>
  <input name="email" type="email" placeholder="Email" required>
  <input name="company" placeholder="Company">
  <textarea name="message" placeholder="How can we help?" required></textarea>
  <!-- honeypot: keep hidden -->
  <input name="website" style="display:none" tabindex="-1" autocomplete="off">
  <button type="submit">Send</button>
</form>`;

const curl = `curl -X POST https://emberza.dev/api/forms/YOUR_FORM_KEY \\
  -H "content-type: application/json" \\
  -d '{"name":"Jane","email":"jane@acme.com","message":"We need a quote for a new website, budget approved."}'

# → 202 {"ok":true,"leadId":"..."}`;

const appsScript = `const HEADERS = ["createdAt", "name", "email", "company", "temperature", "summary", "nextAction", "message", "score"];

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

  const data = JSON.parse(e.postData.contents);
  sheet.appendRow(HEADERS.map((key) => data[key] || ""));

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}`;

const endpoints = [
  ["GET", "/api/leads", "List your leads. Optional query: q (search name, email, company), status."],
  ["POST", "/api/leads", "Create a lead: name, email, company, message, notes, status."],
  ["GET", "/api/leads/:id", "Read one lead."],
  ["PATCH", "/api/leads/:id", "Update only the fields you send."],
  ["DELETE", "/api/leads/:id", "Delete a lead."],
  ["POST", "/api/leads/:id/analyze", "Run AI lead scoring: summary, Hot/Warm/Cold, a 0–100 score (aiScore) and next action."],
  ["POST", "/api/forms/:formKey", "Public endpoint for website forms (JSON or HTML form post)."],
  ["GET", "/api/health", "Service and database status."],
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <JsonLd graph={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Docs", path: "/docs" }])]} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-zinc-400">
        <Link href="/" className="hover:underline">Home</Link> <span aria-hidden>/</span> <span aria-current="page">Docs</span>
      </nav>
      <PageIntro eyebrow="Documentation" title="Connect your website and automate lead qualification">
        Everything you need to send inbound leads to Emberza, get them scored by AI and pass them on to Google Sheets and Telegram.
      </PageIntro>

      <nav aria-label="On this page" className="mt-8 rounded-xl border border-white/[.08] bg-white/[.03] p-5">
        <h2 className="text-sm font-semibold">On this page</h2>
        <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {toc.map(([id, label]) => (
            <li key={id}><a href={`#${id}`} className="text-indigo-300 hover:underline">{label}</a></li>
          ))}
        </ol>
      </nav>

      <div className="mt-10">
        <Prose>
          <h2 id="quick-start">Quick start</h2>
          <ol>
            <li><Link href="/register">Create a free Emberza account</Link>.</li>
            <li>Open <strong>Dashboard → Automation</strong>. Your private form key, hosted form link, HTML snippet and webhook URL are shown there.</li>
            <li>Connect your website using one of the options below and submit a test message.</li>
            <li>The lead appears on your dashboard with an AI summary, a Hot, Warm or Cold score and a recommended next action.</li>
          </ol>

          <h2 id="connect-your-website">Connect your website</h2>
          <p>Every account has a private form key. Choose whichever option fits your site; all three create the same kind of lead.</p>
          <h3>Hosted contact form</h3>
          <p>
            Link to <code>/f/YOUR_FORM_KEY</code> from a button or menu, or embed it in an iframe. It is the quickest way to start and
            shows your name to the visitor. If you ever need to invalidate old links, rotate the form key on the Automation page.
          </p>
          <h3>HTML form embed</h3>
          <p>Paste this snippet into any site — WordPress, Webflow or plain HTML. After submitting, the visitor lands on a thank-you page.</p>
          <pre><code>{embed}</code></pre>
          <h3>JSON webhook</h3>
          <p>Post JSON from your own backend or a no-code tool. The endpoint answers immediately; AI and integrations run afterwards.</p>
          <pre><code>{curl}</code></pre>

          <h2 id="form-fields">Form fields and validation</h2>
          <table>
            <thead>
              <tr><th>Field</th><th>Rules</th></tr>
            </thead>
            <tbody>
              <tr><td><code>name</code></td><td>Required, up to 120 characters.</td></tr>
              <tr><td><code>email</code></td><td>Required, a valid email address.</td></tr>
              <tr><td><code>company</code></td><td>Optional, up to 120 characters.</td></tr>
              <tr><td><code>message</code></td><td>Required, 10 to 5,000 characters.</td></tr>
              <tr><td><code>website</code></td><td>Honeypot. Leave empty and hidden; submissions that fill it are accepted but not stored.</td></tr>
            </tbody>
          </table>
          <p>
            Responses: <code>202</code> when a JSON lead is accepted, a <code>303</code> redirect to the thank-you page for HTML forms,{" "}
            <code>422</code> with per-field errors, <code>404</code> for an unknown form key and <code>429</code> after 10 submissions
            per minute from the same IP address.
          </p>

          <h2 id="ai-lead-qualification">AI lead qualification</h2>
          <p>
            Emberza sends the lead&apos;s name, company, message and internal notes to Claude, Anthropic&apos;s AI model, and stores four
            results on the lead:
          </p>
          <ul>
            <li><strong>Summary</strong> — one or two sentences on who the lead is and what they want.</li>
            <li><strong>Temperature</strong> — Hot (clear need plus budget or timeline), Warm (interested but vague) or Cold (no real intent).</li>
            <li><strong>Score</strong> — 0 to 100, always inside its temperature&apos;s band: Hot 70–100, Warm 40–69, Cold 0–39. Use it to order leads of the same temperature.</li>
            <li><strong>Next action</strong> — one concrete step for the salesperson.</li>
          </ul>
          <p>
            Results are written in the language of the lead&apos;s message. Website leads are analyzed automatically; for other leads, click{" "}
            <strong>Analyze with AI</strong> on the lead page or call the analyze endpoint. A lead needs a message before it can be
            analyzed, and an hourly limit per account keeps usage predictable.
          </p>

          <h2 id="google-sheets">Google Sheets</h2>
          <ol>
            <li>Create a Google Sheet and open <strong>Extensions → Apps Script</strong>.</li>
            <li>Paste the script below and save.</li>
            <li>Choose <strong>Deploy → New deployment → Web app</strong>, set <em>Execute as: Me</em> and <em>Who has access: Anyone</em>.</li>
            <li>Copy the <code>https://script.google.com/macros/…/exec</code> URL into <strong>Automation → Google Sheets web app URL</strong>.</li>
          </ol>
          <pre><code>{appsScript}</code></pre>
          <p>
            Each new website lead adds a row with the date, contact details, AI temperature, summary, next action, message and score. If you
            set up the script before the score existed, add <code>&quot;score&quot;</code> to the end of <code>HEADERS</code> and a
            matching column header in the sheet.
          </p>

          <h2 id="telegram">Telegram alerts</h2>
          <ol>
            <li>Message <a href="https://t.me/BotFather" rel="noopener">@BotFather</a>, send <code>/newbot</code> and copy the bot token.</li>
            <li>Send any message to your new bot, then get your chat ID from <a href="https://t.me/userinfobot" rel="noopener">@userinfobot</a>, or use a group or channel ID.</li>
            <li>Paste both on the Automation page, save, and click <strong>Send Telegram test</strong>.</li>
          </ol>
          <p>Alerts include the temperature and score, contact details, the AI summary, the next action and a link to the lead.</p>

          <h2 id="run-log">Automation run log</h2>
          <p>
            Every website lead starts a run: AI qualification, then Google Sheets, then Telegram. The lead is saved first, so a failing
            step never loses it. Steps you haven&apos;t configured are skipped. Each run is marked <strong>SUCCESS</strong>,{" "}
            <strong>PARTIAL</strong> (some steps failed) or <strong>FAILED</strong>, with the error for each failed step.
          </p>

          <h2 id="rest-api">REST API</h2>
          <p>
            The API uses your signed-in session cookie, so it works from the browser or any HTTP client that keeps cookies after you log
            in. Send JSON with <code>content-type: application/json</code>. Invalid input returns <code>422</code> with per-field details;
            other people&apos;s leads always return <code>404</code>.
          </p>
          <table>
            <thead>
              <tr><th>Method</th><th>Path</th><th>Description</th></tr>
            </thead>
            <tbody>
              {endpoints.map(([method, path, description]) => (
                <tr key={method + path}><td><code>{method}</code></td><td><code>{path}</code></td><td>{description}</td></tr>
              ))}
            </tbody>
          </table>
          <p>
            Questions or problems? Email <a href="mailto:hello@emberza.dev">hello@emberza.dev</a>. See also the{" "}
            <Link href="/privacy">privacy policy</Link> and the <Link href="/#faq">FAQ</Link>.
          </p>
        </Prose>
      </div>
    </div>
  );
}
