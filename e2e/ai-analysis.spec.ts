import { test, expect, createLeadViaUi } from "./fixtures";

// Runs against the offline analyzer (AI_MOCK=1) so results are deterministic.
test.describe("AI lead analysis", () => {
  test("analysis returns summary, temperature and next action", async ({ page, user }) => {
    void user;
    await createLeadViaUi(page, {
      name: "Hot Prospect",
      email: "cto@startup.io",
      company: "Startup Inc",
      message: "We have a budget of $5k and need a new web app ASAP. Ready to sign a contract this week.",
    });

    await page.getByRole("button", { name: "Analyze with AI" }).click();
    const result = page.getByTestId("ai-result");
    await expect(result).toBeVisible();
    await expect(result).toContainText("Hot Prospect (Startup Inc)");
    await expect(result).toContainText("book a 20-minute call");
    await expect(page.getByTestId("temperature-badge")).toHaveText(/Hot/);
    await expect(page.getByRole("button", { name: "Re-analyze" })).toBeVisible();

    // Score shows up on the dashboard too.
    await page.goto("/dashboard");
    await expect(page.getByTestId("stat-hot")).toHaveText("1");
  });

  test("cold leads are classified as cold", async ({ page, user }) => {
    void user;
    await createLeadViaUi(page, {
      name: "Browsing Ben",
      email: "ben@example.com",
      message: "Just looking around, no budget right now. Maybe later.",
    });
    await page.getByRole("button", { name: "Analyze with AI" }).click();
    await expect(page.getByTestId("temperature-badge")).toHaveText(/Cold/);
  });

  test("analysis without a message shows a helpful error", async ({ page, user }) => {
    void user;
    await createLeadViaUi(page, { name: "Silent Sam", email: "sam@example.com" });
    await page.getByRole("button", { name: "Analyze with AI" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Add the lead's message before running AI analysis.");
  });
});
