# Website form → AI → Google Sheets → Telegram

LeadFlow's automation turns any website contact form into a qualified, logged, notified lead — without the visitor waiting.

```
Website form ──POST──► /api/forms/:formKey
                         │  validation (Zod) · honeypot spam check · rate limit (10/min per IP)
                         ▼
                      Lead saved (source: website-form)   ──► 202 response to the visitor
                         │
                         ▼  after() — runs in the background
                      AI qualification (Claude: summary, Hot/Warm/Cold, next action)
                         ▼
                      Google Sheets row (Apps Script web app)
                         ▼
                      Telegram alert to the sales team
                         ▼
                      AutomationRun log: SUCCESS / PARTIAL / FAILED + per-step status and timing
```

**Design choices**
- **Never lose a lead.** The lead is saved before any external call. Each step is isolated; if Sheets is down, Telegram still fires, and the run is marked `PARTIAL` with the error.
- **Fast for the visitor.** AI and integrations run after the response via Next.js `after()`.
- **Safe public endpoint.** Validation with field errors, honeypot field, per-IP rate limit, CORS enabled for embedding, unknown form keys → 404, and form keys can be rotated.
- **No SSRF.** The Sheets URL must be a `https://script.google.com/macros/…` address; Telegram calls only go to `api.telegram.org`.

## Connect your website

Open **Dashboard → Automation**. You get:
- a **hosted form** (`/f/:formKey`) you can link to directly,
- an **HTML embed** snippet that works on any site (WordPress, Webflow, plain HTML),
- a **JSON webhook** for custom backends:

```bash
curl -X POST https://<your-app>/api/forms/<formKey> \
  -H "content-type: application/json" \
  -d '{"name":"Jane","email":"jane@acme.com","message":"We need a quote, budget approved."}'
# → 202 {"ok":true,"leadId":"..."}
```

## Google Sheets

1. Create a Google Sheet → **Extensions → Apps Script**.
2. Paste [`google-sheets-apps-script.js`](google-sheets-apps-script.js) and save.
3. **Deploy → New deployment → Web app** — *Execute as: Me*, *Who has access: Anyone*.
4. Paste the `/exec` URL into **Automation → Google Sheets web app URL**.

## Telegram

1. Message [@BotFather](https://t.me/BotFather) → `/newbot` → copy the token.
2. Send any message to your new bot, then get your chat ID from [@userinfobot](https://t.me/userinfobot) (or use a group/channel ID).
3. Paste both into **Automation**, save, and click **Send Telegram test**.

## Selling this as a service

This is the "Lead Automation" package: *website form → database → AI qualification → Hot/Warm/Cold → email/Telegram notification*. Typical scope: connect the client's existing form, tune the AI prompt to their business, set up Sheets + Telegram, hand over a 1-page guide. Upsell: monthly maintenance (monitoring the run log, prompt tweaks, new integrations).
