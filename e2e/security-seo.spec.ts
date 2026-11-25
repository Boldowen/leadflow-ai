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

test.describe("SEO", () => {
  test("home page has canonical, social preview and structured data", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Emberza — AI lead qualification for small teams");
    const head = page.locator("head");
    expect(await head.locator('link[rel="canonical"]').getAttribute("href")).toMatch(/^https?:\/\/[^/]+\/?$/);
    expect(await head.locator('meta[name="description"]').getAttribute("content")).toContain("Hot, Warm or Cold");
    expect(await head.locator('meta[property="og:image"]').first().getAttribute("content")).toContain("/opengraph-image");
    expect(await head.locator('meta[name="twitter:card"]').getAttribute("content")).toBe("summary_large_image");
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    expect(ld["@type"]).toBe("SoftwareApplication");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("robots.txt, sitemap, icons and OG image are served", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /dashboard");
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("<loc>");
    expect(sitemap).not.toContain("/dashboard");
    for (const path of ["/opengraph-image", "/apple-icon", "/icon.svg", "/manifest.webmanifest"]) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
    expect((await request.get("/opengraph-image")).headers()["content-type"]).toBe("image/png");
  });

  test("private pages are marked noindex", async ({ page, user }) => {
    void user;
    await page.goto("/dashboard");
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");
  });
});
