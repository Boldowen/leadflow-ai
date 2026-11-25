import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`;
/** The app writes outgoing emails here during tests (see src/lib/mail.ts). */
export const MAIL_CAPTURE_FILE = join(tmpdir(), "emberza-e2e-mail.jsonl");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  // bcrypt (cost 12) on parallel workers can push a login past the 5 s default.
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /responsive\.spec\.ts/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /responsive\.spec\.ts/ },
  ],
  // Tests run against a production build with the offline AI analyzer, so they are fast and deterministic.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npm run build && npm run start -- -p ${PORT}`,
        url: `${baseURL}/api/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        // Many sign-ups come from one IP in the suite; per-account limits stay at their real values.
        env: { AI_MOCK: "1", APP_URL: baseURL, AUTH_RATE_LIMIT_PER_IP: "100000", TEST_MAIL_CAPTURE_FILE: MAIL_CAPTURE_FILE },
      },
});
