import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/site/json-ld";
import { PageIntro, Prose } from "@/components/site/prose";
import { breadcrumbJsonLd, SITE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What data Emberza stores, which service providers process it, how AI lead analysis uses your data, and how to have it deleted.",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy" },
};

const UPDATED = "2026-11-26";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <JsonLd graph={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Privacy policy", path: "/privacy" }])]} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-zinc-400">
        <Link href="/" className="hover:underline">Home</Link> <span aria-hidden>/</span> <span aria-current="page">Privacy policy</span>
      </nav>
      <PageIntro eyebrow="Legal" title="Privacy policy">
        How Emberza handles your account data and the leads you store in it. Last updated{" "}
        <time dateTime={UPDATED}>November 26, 2026</time>.
      </PageIntro>

      <div className="mt-10">
        <Prose>
          <h2 id="what-we-store">What we store</h2>
          <ul>
            <li><strong>Your account:</strong> name, email address and a bcrypt hash of your password (never the password itself).</li>
            <li><strong>Your leads:</strong> the name, email, company, message, notes and status of each lead you add or receive through your forms, plus the AI summary, temperature and next action.</li>
            <li><strong>Integration settings:</strong> your Google Sheets web app URL and Telegram bot token and chat ID, if you add them.</li>
            <li><strong>Activity records:</strong> automation run logs, timestamps of AI analyses (to enforce usage limits) and short-lived rate-limit counters based on IP or email address; counters older than a day are removed automatically.</li>
            <li><strong>Password reset links:</strong> only a hash of each link is stored, and it expires after 30 minutes.</li>
          </ul>

          <h2 id="how-we-use-it">How we use it</h2>
          <p>
            Only to run the service: to log you in, show and update your leads, analyze leads with AI, send the notifications you set up,
            send password reset emails and protect the service from abuse. We don&apos;t sell your data or use it for advertising.
          </p>

          <h2 id="service-providers">Service providers</h2>
          <ul>
            <li><strong>Vercel</strong> hosts the application.</li>
            <li><strong>Neon</strong> hosts the PostgreSQL database.</li>
            <li><strong>Anthropic</strong> processes a lead&apos;s name, company, message and notes when AI analysis runs, to produce the summary, score and next action.</li>
            <li><strong>Resend</strong> delivers password reset emails.</li>
            <li><strong>Google</strong> and <strong>Telegram</strong> receive lead details only if you connect Google Sheets or Telegram yourself.</li>
          </ul>

          <h2 id="cookies">Cookies</h2>
          <p>
            Emberza sets one essential cookie that keeps you signed in for up to seven days. It is HTTP-only and is not used for tracking.
            There are no analytics, advertising or third-party tracking scripts.
          </p>

          <h2 id="who-can-see-your-data">Who can see your data</h2>
          <p>
            Your leads are visible only to your account. Administrators of the service can see account-level information such as names,
            email addresses and lead counts to operate the service, but not lead contents or integration secrets. Every administrative
            change is recorded in an audit log.
          </p>

          <h2 id="retention-and-deletion">Retention and deletion</h2>
          <p>
            Leads stay until you delete them. To delete your account and everything in it, email{" "}
            <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> from the address you signed up with. Deleting an account also
            deletes its leads, run logs and settings.
          </p>

          <h2 id="security">Security</h2>
          <p>
            Connections use HTTPS. Passwords are hashed with bcrypt, sign-in attempts are rate-limited, and changing your password signs
            you out on every device. No system is perfectly secure; if you find a vulnerability, please report it to{" "}
            <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
          </p>

          <h2 id="contact">Changes and contact</h2>
          <p>
            We will update this page when our practices change and adjust the date above. Questions:{" "}
            <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. You can also read the <Link href="/docs">documentation</Link>.
          </p>
        </Prose>
      </div>
    </div>
  );
}
