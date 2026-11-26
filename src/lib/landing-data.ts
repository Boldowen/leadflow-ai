// Copy and data for the landing page (ported from design/emberza-landing-demo.html).
// Keep every claim true to what the product actually does.

export type Level = "hot" | "warm" | "cold";

export const LEVELS: Record<Level, { name: string; color: string; text: string }> = {
  hot: { name: "Hot", color: "#fb923c", text: "A clear need plus a budget or a timeline. Call these first." },
  warm: { name: "Warm", color: "#fbbf24", text: "Real interest, but budget or timing is still unclear. Nurture and qualify." },
  cold: { name: "Cold", color: "#38bdf8", text: "Little signal of intent yet. Keep them in the loop without spending call time." },
};

export const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#demo", label: "Live demo" },
  { href: "#faq", label: "FAQ" },
  { href: "/docs", label: "Docs" },
];

export const HERO = {
  badge: "AI lead qualification & scoring, powered by Claude",
  titleStart: "Know which leads to ",
  titleAccent: "call first.",
  subtitle: "Capture leads from any form, let AI summarize and score them Hot, Warm or Cold, and get a clear next action for every one.",
};

export const PIPELINE_STAGES = ["New", "Contacted", "Qualified", "Won", "Lost"];

export const PREVIEW_ROWS: { name: string; note: string; level: Level; score: number; delay: number }[] = [
  { name: "Acme Studio", note: "Needs CRM sync, $5k budget, start next month", level: "hot", score: 92, delay: 0.3 },
  { name: "Nomad Labs", note: "Asked for pricing and integrations", level: "warm", score: 58, delay: 0.45 },
  { name: "Bright Dental", note: "Wants a demo for 3 locations", level: "hot", score: 81, delay: 0.6 },
  { name: "j.doe@mail", note: "Just browsing", level: "cold", score: 14, delay: 0.75 },
];

export const TICKER = [
  { title: "New Hot lead", detail: "Score 92 · call today", color: "#fb923c" },
  { title: "Lead qualified", detail: "Nomad Labs → Warm · 58", color: "#fbbf24" },
  { title: "Spam filtered", detail: "1 bot submission blocked", color: "#a5b4fc" },
];
export const TICKER_INTERVAL_MS = 2600;

export const MARQUEE = ["Web forms", "Webhooks", "REST API", "Google Sheets", "Telegram", "Next.js", "PostgreSQL", "Claude"];

export type FeatureIcon = "inbox" | "sparkles" | "flame" | "arrow" | "dashboard" | "zap";

export const FEATURES: { title: string; body: string; icon: FeatureIcon }[] = [
  { title: "Lead capture", body: "Forms, webhooks, API or manual entry, with spam filtering built in.", icon: "inbox" },
  { title: "AI summaries", body: "Every lead summarized in the lead’s own language.", icon: "sparkles" },
  { title: "Hot / Warm / Cold scoring", body: "Instant priority so your team knows where to start.", icon: "flame" },
  { title: "Recommended next action", body: "A concrete follow-up step for each lead, not just a number.", icon: "arrow" },
  { title: "Prioritization dashboard", body: "Move leads through New, Contacted, Qualified, Won and Lost.", icon: "dashboard" },
  { title: "Sheets & Telegram automation", body: "Push new leads to Google Sheets and get Telegram alerts.", icon: "zap" },
];

export const STEPS = [
  { title: "Connect your form", body: "Point your form or webhook at Emberza. No site rebuild." },
  { title: "Lead is saved", body: "Each submission is stored and filtered for spam." },
  { title: "AI qualifies it", body: "Claude summarizes, scores and suggests the next step." },
  { title: "Your team follows up", body: "Call the Hot leads first and track progress by stage." },
];

export type Preset = { text: string; score: number; level: Level; summary: string; action: string };

/** Sample messages for the scoring demo. The results are canned, not produced by the AI. */
export const PRESETS: Preset[] = [
  {
    text: "We need a CRM integration for our 12-person sales team. Budget is around $5k and we want to start next month.",
    score: 92,
    level: "hot",
    summary: "Clear need, a defined budget and a start date within 30 days.",
    action: "Call today and propose a kickoff call this week.",
  },
  {
    text: "Hi, can you send more information about your pricing and features?",
    score: 58,
    level: "warm",
    summary: "Interested in the product, but no budget or timeline mentioned yet.",
    action: "Send pricing and a short case study, follow up in 2 days.",
  },
  {
    text: "just browsing",
    score: 14,
    level: "cold",
    summary: "No stated need, budget or timeline.",
    action: "Add to the nurture list. No immediate follow-up.",
  },
];
export const THINKING_MS = 1100;

export const USE_CASES = [
  { title: "Agencies & freelancers", body: "Sort inbound briefs by fit and budget before you spend time on a call." },
  { title: "B2B service businesses", body: "Route serious requests to the right person while they are still hot." },
  { title: "Small sales teams", body: "One shared dashboard, clear priorities, no spreadsheet triage." },
];

/** `link` turns that phrase of the answer into an internal link. */
export const FAQS: { q: string; a: string; link?: { text: string; href: string } }[] = [
  { q: "What is AI lead qualification?", a: "AI reads each incoming lead, summarizes what they want and estimates how ready they are to buy, so you don’t have to triage by hand." },
  { q: "How does scoring work?", a: "Claude looks for a clear need, budget and timeline and labels the lead Hot, Warm or Cold. You can add notes, re-run the analysis or change the status anytime." },
  { q: "Do I need to change my website?", a: "No. Connect your existing form through a webhook or the API." },
  { q: "What integrations are supported?", a: "Web forms, webhooks, the REST API, Google Sheets and Telegram." },
  { q: "Does it work with non-English leads?", a: "Yes. Summaries are written in the lead’s language." },
  { q: "How is my data handled?", a: "See the Privacy policy for how lead data is stored and processed.", link: { text: "Privacy policy", href: "/privacy" } },
  { q: "How much does it cost?", a: "It’s free to start." },
];

export const FINAL_CTA = { titleStart: "Stop guessing. ", titleAccent: "Start calling.", subtitle: "Free to start. Connect your first form in minutes." };

export const FOOTER = {
  tagline: "Know which leads to call first.",
  email: "hello@emberza.dev",
  github: "https://github.com/Boldowen/leadflow-ai",
  groups: [
    { title: "Product", links: [{ href: "#features", label: "Features" }, { href: "#how", label: "How it works" }, { href: "#faq", label: "FAQ" }] },
    {
      title: "Resources",
      links: [{ href: "/docs", label: "Documentation" }, { href: "/docs#rest-api", label: "REST API" }, { href: "/privacy", label: "Privacy policy" }],
    },
    { title: "Account", links: [{ href: "/login", label: "Log in" }, { href: "/register", label: "Sign up free" }] },
  ],
};
