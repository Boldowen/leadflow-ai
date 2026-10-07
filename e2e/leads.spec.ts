import { test, expect, createLeadViaUi } from "./fixtures";

test.describe("Lead management", () => {
  test("user can create a lead and see it on the dashboard", async ({ page, user }) => {
    void user;
    await createLeadViaUi(page, { name: "Ada Lovelace", email: "ada@engine.io", company: "Analytical Engines" });

    await page.getByRole("link", { name: "← All leads" }).click();
    const list = page.getByRole("list", { name: "Lead list" });
    await expect(list.getByRole("link")).toHaveCount(1);
    await expect(list).toContainText("Ada Lovelace");
    await expect(list).toContainText("Analytical Engines");
    await expect(page.getByTestId("stat-total-leads")).toHaveText("1");
  });

  test("lead form validates required fields", async ({ page, user }) => {
    void user;
    await page.goto("/dashboard/leads/new");
    await page.getByLabel("Email").fill("bad-email");
    await page.getByRole("button", { name: "Create lead" }).click();

    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Enter a valid email")).toBeVisible();
    // Input is preserved after a failed submit.
    await expect(page.getByLabel("Email")).toHaveValue("bad-email");
  });

  test("user can edit a lead", async ({ page, user }) => {
    void user;
    await createLeadViaUi(page, { name: "Grace Hopper", email: "grace@navy.mil" });

    await page.getByLabel("Company").fill("US Navy");
    await page.getByLabel("Status").selectOption("QUALIFIED");
    await page.getByLabel("Notes").fill("Wants a COBOL migration.");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toHaveText("Lead saved.");

    await page.reload();
    await expect(page.getByLabel("Company")).toHaveValue("US Navy");
    await expect(page.getByLabel("Status")).toHaveValue("QUALIFIED");
    await expect(page.getByLabel("Notes")).toHaveValue("Wants a COBOL migration.");
  });

  test("user can delete a lead", async ({ page, user }) => {
    void user;
    await createLeadViaUi(page, { name: "Temp Lead", email: "temp@example.com" });

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete lead" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("No leads yet.")).toBeVisible();
  });

  test("cancelling the delete confirmation keeps the lead", async ({ page, user }) => {
    void user;
    await createLeadViaUi(page, { name: "Keep Me", email: "keep@example.com" });

    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: "Delete lead" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Keep Me" })).toBeVisible();
  });

  test("search and status filter narrow the list", async ({ page, user }) => {
    void user;
    await createLeadViaUi(page, { name: "Alice Acme", email: "alice@acme.com", company: "Acme" });
    await createLeadViaUi(page, { name: "Bob Globex", email: "bob@globex.com", company: "Globex" });

    await page.goto("/dashboard");
    const list = page.getByRole("list", { name: "Lead list" });
    await expect(list.getByRole("link")).toHaveCount(2);

    await page.getByLabel("Search leads").fill("globex");
    await page.getByRole("button", { name: "Filter" }).click();
    await expect(list.getByRole("link")).toHaveCount(1);
    await expect(list).toContainText("Bob Globex");

    await page.getByLabel("Search leads").fill("");
    await page.getByLabel("Filter by status").selectOption("WON");
    await page.getByRole("button", { name: "Filter" }).click();
    await expect(page.getByText("No leads match your filters.")).toBeVisible();
  });
});
