import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const testDir = defineBddConfig({
  features: "features/**/*.feature",
  steps: "steps/**/*.ts",
  outputDir: ".features-gen",
});

export default defineConfig({
  testDir,
  globalSetup: "./global-setup.ts",
  outputDir: "target/test-results",
  fullyParallel: true,
  workers: 4,
  retries: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    trace: "on-first-retry",
    video: "on-first-retry",
    screenshot: "only-on-failure",
    ignoreHTTPSErrors: true,
    launchOptions: {
      args: [
        "--host-resolver-rules=MAP user-telemetry.local.dev-gutools.co.uk 127.0.0.1:3133",
      ],
    },
  },
  reporter: process.env.CI
    ? [["github"]]
    : [
        ["list", { printFailuresInline: true }],
        ["html", { outputFolder: "target/playwright-report", open: "never" }],
      ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});