import { test, expect, adminScript, createLeadViaUi, newUser, registerViaUi } from "./fixtures";
import { latestMailTo } from "./mail";

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

test.describe("Admin user management", () => {
  test.skip(!!process.env.BASE_URL, "needs direct database access");

  test("an admin can edit, reset, promote, sign out and delete another user", async ({ page, browser, user: admin }) => {
    adminScript("grant", admin.email);
    try {
      const target = newUser();
      const targetCtx = await browser.newContext();
      const t = await targetCtx.newPage();
      await registerViaUi(t, target);

      await page.goto(`/admin?q=${encodeURIComponent(target.email)}`);
      await page.getByRole("link", { name: target.name }).click();
      await expect(page).toHaveURL(/\/admin\/users\/[a-z0-9]+$/);
      await expect(page.getByRole("heading", { level: 1, name: target.name })).toBeVisible();

      // Profile: duplicate email is refused, a new name is saved.
      await page.getByLabel("Email", { exact: true }).fill(admin.email);
      await page.getByRole("button", { name: "Save profile" }).click();
      await expect(page.getByText("Another account already uses this email")).toBeVisible();
      await page.getByLabel("Email", { exact: true }).fill(target.email);
      await page.getByLabel("Name").fill("Renamed Tester");
      await page.getByRole("button", { name: "Save profile" }).click();
      await expect(page.getByText("Profile saved.")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1, name: "Renamed Tester" })).toBeVisible();

      // Password: the user is signed out everywhere and can log in with the new one.
      await page.getByLabel("New password").fill("short");
      await page.getByRole("button", { name: "Set password" }).click();
      await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
      await page.getByLabel("New password").fill("admin-set-pass-1");
      await page.getByRole("button", { name: "Set password" }).click();
      await expect(page.getByText("Password changed. The user was signed out on every device.")).toBeVisible();
      await t.goto("/dashboard");
      await expect(t).toHaveURL(/\/login\?expired=1$/);
      await t.getByLabel("Email").fill(target.email);
      await t.getByLabel("Password").fill("admin-set-pass-1");
      await t.getByRole("button", { name: "Log in" }).click();
      await expect(t).toHaveURL(/\/dashboard$/);

      // Reset link by email.
      const since = Date.now();
      await page.getByRole("button", { name: "Email a reset link" }).click();
      await expect(page.getByText(`Reset link sent to ${target.email}.`)).toBeVisible();
      expect((await latestMailTo(target.email, since)).subject).toBe("Reset your Emberza password");

      // Role.
      page.once("dialog", (d) => d.accept());
      await page.getByRole("button", { name: "Make admin" }).click();
      await expect(page.getByText("Now an admin.")).toBeVisible();
      await t.goto("/admin");
      await expect(t.getByRole("heading", { level: 1, name: "Admin" })).toBeVisible();
      page.once("dialog", (d) => d.accept());
      await page.getByRole("button", { name: "Remove admin rights" }).click();
      await expect(page.getByText("Admin rights removed.")).toBeVisible();
      expect((await t.goto("/admin"))?.status()).toBe(404);

      // Sign out everywhere.
      await page.getByRole("button", { name: "Sign out everywhere" }).click();
      await expect(page.getByText("Signed out on every device.")).toBeVisible();
      await t.goto("/dashboard");
      await expect(t).toHaveURL(/\/login\?expired=1$/);

      // Delete: needs the exact email.
      await page.getByLabel(`Type ${target.email} to confirm`).fill("nope");
      await page.getByRole("button", { name: "Delete account" }).click();
      await expect(page.getByText("Type the user's email exactly to confirm")).toBeVisible();
      await page.getByLabel(`Type ${target.email} to confirm`).fill(target.email);
      await page.getByRole("button", { name: "Delete account" }).click();
      await expect(page).toHaveURL(/\/admin\?deleted=1$/);
      await expect(page.getByRole("status")).toHaveText("Account deleted.");
      await t.goto("/login");
      await t.getByLabel("Email").fill(target.email);
      await t.getByLabel("Password").fill("admin-set-pass-1");
      await t.getByRole("button", { name: "Log in" }).click();
      await expect(t.getByRole("main").getByRole("alert")).toHaveText("Invalid email or password");

      // Everything above is in the audit log.
      const log = page.getByRole("list", { name: "Audit log" });
      for (const action of ["update profile", "set password", "send reset link", "set role", "revoke sessions", "delete user"]) {
        await expect(log).toContainText(action);
      }
      await targetCtx.close();
    } finally {
      adminScript("revoke", admin.email);
    }
  });

  test("admins can't lock themselves out", async ({ page, user: admin }) => {
    adminScript("grant", admin.email);
    try {
      await page.goto(`/admin?q=${encodeURIComponent(admin.email)}`);
      await page.getByRole("link", { name: admin.name }).click();
      await expect(page.getByText("You can't change your own role.")).toBeVisible();
      await expect(page.getByText("You can't delete your own account here.")).toBeVisible();
      await expect(page.getByRole("button", { name: "Delete account" })).toHaveCount(0);
    } finally {
      adminScript("revoke", admin.email);
    }
  });

  test("regular users get a 404 on admin user pages", async ({ page, user }) => {
    void user;
    expect((await page.goto("/admin/users/anything"))?.status()).toBe(404);
  });
});
