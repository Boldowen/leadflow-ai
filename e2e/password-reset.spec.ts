import { test, expect, newUser, registerViaUi } from "./fixtures";
import { latestMailTo, resetLinkFrom } from "./mail";

test.describe("Password reset", () => {
  test.skip(!!process.env.BASE_URL, "reads emails captured by the local server");

  test("forgot password → email link → new password; old sessions and the link stop working", async ({ page, browser, user }) => {
    const since = Date.now();
    const visitor = await browser.newContext();
    const v = await visitor.newPage();
    await v.goto("/login");
    await v.getByRole("link", { name: "Forgot password?" }).click();
    await expect(v).toHaveURL(/\/forgot-password$/);
    await v.getByLabel("Email").fill(user.email.toUpperCase());
    await v.getByRole("button", { name: "Send reset link" }).click();
    await expect(v.getByRole("status")).toContainText("If an account exists for that email");

    const mail = await latestMailTo(user.email, since);
    expect(mail.subject).toBe("Reset your Emberza password");
    const link = resetLinkFrom(mail);
    await v.goto(link.pathname + link.search);
    await expect(v.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
    expect(await v.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");

    await v.getByLabel("New password", { exact: true }).fill("brand-new-pass-1");
    await v.getByLabel("Confirm new password").fill("something-else");
    await v.getByRole("button", { name: "Set new password" }).click();
    await expect(v.getByText("Passwords don't match")).toBeVisible();

    await v.getByLabel("New password", { exact: true }).fill("brand-new-pass-1");
    await v.getByLabel("Confirm new password").fill("brand-new-pass-1");
    await v.getByRole("button", { name: "Set new password" }).click();
    await expect(v).toHaveURL(/\/login\?reset=1$/);
    await expect(v.getByRole("status")).toHaveText("Password updated. Log in with your new password.");

    // The session that existed before the reset is revoked (and doesn't loop between /login and /dashboard).
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?expired=1$/);
    await expect(page.getByRole("status")).toHaveText("Your session ended. Please log in again.");

    // Old password fails, new one works.
    await v.getByLabel("Email").fill(user.email);
    await v.getByLabel("Password").fill(user.password);
    await v.getByRole("button", { name: "Log in" }).click();
    await expect(v.getByRole("main").getByRole("alert")).toHaveText("Invalid email or password");
    await v.getByLabel("Password").fill("brand-new-pass-1");
    await v.getByRole("button", { name: "Log in" }).click();
    await expect(v).toHaveURL(/\/dashboard$/);

    // The link is single-use.
    await v.goto(link.pathname + link.search);
    await expect(v.getByRole("heading", { name: "Link expired" })).toBeVisible();
    await visitor.close();
  });

  test("unknown emails get the same answer and no email", async ({ page }) => {
    const ghost = newUser().email;
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill(ghost);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("status")).toContainText("If an account exists for that email");
    await expect(latestMailTo(ghost)).rejects.toThrow();
  });

  test("a made-up token is rejected", async ({ page }) => {
    await page.goto("/reset-password?token=" + "x".repeat(43));
    await expect(page.getByRole("heading", { name: "Link expired" })).toBeVisible();
  });

  test("login is locked for an account after 10 attempts in 15 minutes", async ({ page }) => {
    const user = newUser();
    await registerViaUi(page, user);
    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    for (let i = 0; i < 10; i++) {
      await page.getByLabel("Password").fill(`wrong-${i}`);
      await page.getByRole("button", { name: "Log in" }).click();
      // The form resets once the action has answered; wait for that before the next try.
      await expect(page.getByLabel("Password")).toHaveValue("");
      await expect(page.getByRole("main").getByRole("alert")).toHaveText("Invalid email or password");
    }
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(/Too many attempts/);
  });

  test("after login the user returns to the page they asked for, never off-site", async ({ page }) => {
    const user = newUser();
    await registerViaUi(page, user);
    await page.context().clearCookies();
    await page.goto("/dashboard/automation");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Fautomation$/);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/dashboard\/automation$/);

    await page.context().clearCookies();
    await page.goto("/login?next=//evil.example.com");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/localhost:\d+\/dashboard$/);
  });
});
