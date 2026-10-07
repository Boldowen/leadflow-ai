import { test, expect, createLeadViaUi, newUser, registerViaUi } from "./fixtures";

test.describe("Access control", () => {
  test("unauthenticated visitor is redirected from the dashboard to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("a forged session cookie does not grant access", async ({ page, baseURL }) => {
    await page.context().addCookies([{ name: "leadflow_session", value: "forged.token.value", url: baseURL! }]);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("signed-in user visiting /login is sent to the dashboard", async ({ page, user }) => {
    void user;
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("a user cannot open another user's lead", async ({ page, browser }) => {
    await registerViaUi(page, newUser());
    await createLeadViaUi(page, { name: "Private Lead", email: "private@example.com" });
    const leadUrl = page.url();

    const other = await browser.newContext();
    const otherPage = await other.newPage();
    await registerViaUi(otherPage, newUser());
    await otherPage.goto(leadUrl);
    await expect(otherPage.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await other.close();
  });
});
