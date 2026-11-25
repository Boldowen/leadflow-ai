import { test, expect, adminScript, createLeadViaUi } from "./fixtures";

test.describe("Admin", () => {
  test("unauthenticated visitor is redirected to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin$/);
  });

  test("a regular user gets a 404 and no admin link", async ({ page, user }) => {
    void user;
    await expect(page.getByRole("navigation").getByRole("link", { name: "Admin" })).toHaveCount(0);
    const res = await page.goto("/admin");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    expect(await page.content()).not.toContain("Latest automation problems");
  });

  test("the admin script refuses the public demo account and unknown emails", () => {
    for (const email of ["demo@emberza.dev", "demo@leadflow.dev"]) {
      expect(() => adminScript("grant", email)).toThrow(/Refusing/);
    }
    test.skip(!!process.env.BASE_URL, "needs direct database access");
    expect(() => adminScript("grant", "nobody@example.invalid")).toThrow(/No account/);
  });

  test("an admin sees usage and can search users; revoking applies immediately", async ({ page, user }) => {
    test.skip(!!process.env.BASE_URL, "needs direct database access");
    await createLeadViaUi(page, { name: "Secret Customer", email: "secret@example.com", message: "Confidential request" });
    adminScript("grant", user.email);

    await page.goto("/dashboard");
    await page.getByRole("navigation").getByRole("link", { name: "Admin" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { level: 1, name: "Admin" })).toBeVisible();
    await expect(page.getByTestId("admin-stat-users")).toHaveText(/^[1-9][\d,]*$/);
    await expect(page.getByTestId("admin-stat-ai-calls")).toHaveText(/^[\d,]+ \/ [\d,]+$/);

    await page.getByLabel("Search users").fill(user.email);
    await page.getByRole("button", { name: "Search" }).click();
    const row = page.getByRole("table", { name: "Users" }).getByRole("row").filter({ hasText: user.email });
    await expect(page.getByRole("table", { name: "Users" }).getByRole("row")).toHaveCount(2); // header + 1
    await expect(row.getByRole("cell").nth(1)).toHaveText("Admin");
    await expect(row.getByRole("cell").nth(3)).toHaveText("1");
    // Other people's customers are not exposed here.
    expect(await page.content()).not.toContain("Secret Customer");

    await page.goto("/admin?q=no-such-user-anywhere");
    await expect(page.getByText("No users match your search.")).toBeVisible();

    adminScript("revoke", user.email);
    const res = await page.goto("/admin");
    expect(res?.status()).toBe(404);
  });
});
