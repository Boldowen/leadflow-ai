import { test, expect, newUser, registerViaUi } from "./fixtures";

test.describe("Authentication", () => {
  test("user can register and lands on an empty dashboard", async ({ page }) => {
    const user = newUser();
    await registerViaUi(page, user);
    await expect(page.getByRole("heading", { name: "Leads" })).toBeVisible();
    await expect(page.getByText("No leads yet.")).toBeVisible();
    await expect(page.getByTestId("stat-total-leads")).toHaveText("0");
  });

  test("user can log out and log back in", async ({ page, user }) => {
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("current-user")).toHaveText(user.name);
  });

  test("invalid password is rejected", async ({ page, user }) => {
    await page.getByRole("button", { name: "Log out" }).click();
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Invalid email or password");
    await expect(page).toHaveURL(/\/login$/);
    // Email is kept so the user doesn't have to retype it.
    await expect(page.getByLabel("Email")).toHaveValue(user.email);
  });

  test("unknown email gets the same generic error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(newUser().email);
    await page.getByLabel("Password").fill("whatever123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Invalid email or password");
  });

  test("registration validates input", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Name").fill("A");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Name must be at least 2 characters")).toBeVisible();
    await expect(page.getByText("Enter a valid email")).toBeVisible();
    await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
  });

  test("cannot register the same email twice", async ({ page, user }) => {
    await page.context().clearCookies();
    await page.goto("/register");
    await page.getByLabel("Name").fill("Someone Else");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill("another-pass-123");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("An account with this email already exists")).toBeVisible();
  });
});
