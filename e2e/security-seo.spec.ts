import { test, expect } from "./fixtures";

test.describe("Security headers", () => {
  test("app pages can't be framed and send hardening headers", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["content-security-policy"]).toContain("object-src 'none'");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["strict-transport-security"]).toContain("max-age=");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["x-powered-by"]).toBeUndefined();
  });

  test("the hosted contact form can be embedded on other sites", async ({ page, user }) => {
    void user;
    await page.goto("/dashboard/automation");
    const formKey = (await page.getByLabel("Webhook endpoint").textContent())!.split("/api/forms/")[1];
    const res = await page.request.get(`/f/${formKey}`);
    expect(res.headers()["content-security-policy"]).toContain("frame-ancestors *");
    expect(res.headers()["x-frame-options"]).toBeUndefined();
  });
});

const PUBLIC_PAGES = ["/", "/docs", "/privacy"];

test.describe("Landing page interactions", () => {
  test("scoring demo, temperature tabs and FAQ accordion work", async ({ page }) => {
    await page.goto("/");
    const demo = page.locator("#demo");
    await demo.getByRole("radio", { name: /just browsing/ }).click();
    await expect(demo.getByRole("radio", { name: /just browsing/ })).toHaveAttribute("aria-checked", "true");
    await demo.getByRole("button", { name: "Analyze lead" }).click();
    await expect(demo.getByText("Claude is reading the lead")).toBeVisible();
    await expect(demo.getByText("No stated need, budget or timeline.")).toBeVisible();
    await expect(demo.getByText("14", { exact: true })).toBeVisible();
    await expect(demo.getByRole("button", { name: "Re-run analysis" })).toBeVisible();

    await demo.getByRole("tab", { name: "Warm" }).click();
    await expect(demo.getByRole("tab", { name: "Warm" })).toHaveAttribute("aria-selected", "true");
    await expect(demo.getByRole("tabpanel")).toHaveText(/budget or timing is still unclear/);

    const faq = page.locator("#faq");
    const first = faq.getByRole("button", { name: "What is AI lead qualification?" });
    const second = faq.getByRole("button", { name: "How does scoring work?" });
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await second.click();
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(first).toHaveAttribute("aria-expanded", "false"); // single-open
    await expect(faq.getByText("Claude looks for a clear need, budget and timeline")).toBeVisible();
  });

  test("/signup redirects to the sign-up page", async ({ request }) => {
    const res = await request.get("/signup", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toMatch(/\/register$/);
  });
});

test.describe("SEO", () => {
  test("home page has the target title, description, canonical, social preview and structured data", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Emberza | AI Lead Qualification & Scoring");
    const head = page.locator("head");
    const description = await head.locator('meta[name="description"]').getAttribute("content");
    expect(description).toContain("qualify inbound leads");
    expect(description!.length).toBeLessThanOrEqual(160);
    expect(await head.locator('link[rel="canonical"]').getAttribute("href")).toMatch(/^https?:\/\/[^/]+\/?$/);
    expect(await head.locator('meta[property="og:image"]').first().getAttribute("content")).toContain("/opengraph-image");
    expect(await head.locator('meta[name="twitter:card"]').getAttribute("content")).toBe("summary_large_image");
    expect(await page.locator("html").getAttribute("lang")).toBe("en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    const graph = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)["@graph"];
    const types = graph.map((n: { "@type": string }) => n["@type"]);
    expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite", "SoftwareApplication", "FAQPage"]));
    // Every FAQ answer in the structured data is visible on the page.
    const faq = graph.find((n: { "@type": string }) => n["@type"] === "FAQPage");
    for (const q of faq.mainEntity) await expect(page.getByRole("heading", { name: q.name })).toHaveCount(1);
  });

  test("crawlers get the full landing content without JavaScript", async ({ request }) => {
    const html = await (await request.get("/")).text();
    const text = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
    // The redesigned landing (design/emberza-landing-demo.html) has ~640 words; the previous version had ~1,080.
    expect(text.split(/\s+/).filter(Boolean).length).toBeGreaterThan(600);
    for (const phrase of ["AI lead scoring", "How it works", "Questions, answered", "Built for teams that live in their inbox"]) expect(text).toContain(phrase);
    // Collapsed FAQ answers are still in the HTML, so they match the FAQPage structured data.
    expect(text).toContain("Connect your existing form through a webhook or the API.");
    expect(html).toContain('aria-label="Preview of the Emberza lead dashboard with sample leads"');
  });

  test("every public page has a unique title, description and self-canonical, and its internal links work", async ({ page, request }) => {
    const titles = new Set<string>();
    const links = new Set<string>();
    for (const path of PUBLIC_PAGES) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      titles.add(await page.title());
      expect(await page.locator('meta[name="description"]').getAttribute("content"), path).toBeTruthy();
      expect(new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).pathname.replace(/\/$/, "") || "/").toBe(path);
      expect(await page.locator('meta[name="robots"]').getAttribute("content") ?? "index", path).not.toContain("noindex");
      for (const href of await page.locator("a[href^='/']").evaluateAll((as) => as.map((a) => a.getAttribute("href")!))) links.add(href.split("#")[0] || "/");
    }
    expect(titles.size).toBe(PUBLIC_PAGES.length);
    for (const href of links) {
      const res = await request.get(href, { maxRedirects: 0 });
      expect([200, 307, 308], href).toContain(res.status());
    }
  });

  test("robots.txt, sitemap, icons, manifest and OG image are served", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /dashboard");
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    expect(locs.sort()).toEqual(["/", "/docs", "/privacy"]);
    for (const path of ["/favicon.ico", "/icon.png", "/apple-icon.png", "/brand/icon-192.png", "/brand/icon-512.png", "/brand/logo.png", "/manifest.webmanifest"]) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
    const og = await request.get("/opengraph-image");
    expect(og.headers()["content-type"]).toBe("image/png");
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest.icons.map((i: { sizes: string }) => i.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  });

  test("auth, private and 404 pages are noindex", async ({ page, user }) => {
    void user;
    for (const path of ["/dashboard", "/admin/nope"]) {
      await page.goto(path);
      expect(await page.locator('meta[name="robots"]').first().getAttribute("content"), path).toContain("noindex");
    }
    await page.context().clearCookies();
    for (const path of ["/login", "/register", "/forgot-password", "/no-such-page"]) {
      await page.goto(path);
      expect(await page.locator('meta[name="robots"]').first().getAttribute("content"), path).toContain("noindex");
    }
    const res = await page.goto("/no-such-page");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("link", { name: "Go to the homepage" })).toBeVisible();
  });
});
