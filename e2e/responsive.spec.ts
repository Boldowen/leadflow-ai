import { test, expect, createLeadViaUi } from "./fixtures";

// Runs on the "mobile" project (Pixel 7 viewport).
test("core flow works on a mobile viewport without horizontal scroll", async ({ page, user }) => {
  void user;
  await createLeadViaUi(page, { name: "Mobile Lead", email: "m@example.com", message: "Need a quote, budget ready, ASAP." });
  await page.getByRole("button", { name: "Analyze with AI" }).click();
  await expect(page.getByTestId("temperature-badge")).toHaveText(/Hot/);

  for (const path of ["/", "/dashboard", page.url()]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(0);
  }
});
