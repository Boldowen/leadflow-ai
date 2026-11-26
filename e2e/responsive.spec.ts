import { test, expect, adminScript, createLeadViaUi } from "./fixtures";

// Runs on the "mobile" project (Pixel 7 viewport).
test("core flow works on a mobile viewport without horizontal scroll", async ({ page, user }) => {
  void user;
  await createLeadViaUi(page, { name: "Mobile Lead", email: "m@example.com", message: "Need a quote, budget ready, ASAP." });
  await page.getByRole("button", { name: "Analyze with AI" }).click();
  await expect(page.getByTestId("temperature-badge")).toHaveText(/Hot/);

  for (const path of ["/", "/docs", "/privacy", "/dashboard", page.url()]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(0);
  }
});

test("admin page works on a mobile viewport without horizontal scroll", async ({ page, user }) => {
  test.skip(!!process.env.BASE_URL, "needs direct database access");
  adminScript("grant", user.email);
  await page.setViewportSize({ width: 360, height: 800 }); // smallest common phone width
  await page.goto("/admin");
  await expect(page.getByRole("heading", { level: 1, name: "Admin" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  adminScript("revoke", user.email);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("landing page has no horizontal scroll at 375, 768 and 1280 px, with or without motion", async ({ page }) => {
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      await page.emulateMedia({ reducedMotion });
      await page.goto("/");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${width}px ${reducedMotion}`).toBeLessThanOrEqual(0);
    }
  }
  // With reduced motion every scroll-reveal block is visible straight away.
  const hidden = await page.locator("[data-reveal]").evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity !== "1").length);
  expect(hidden).toBe(0);
});
