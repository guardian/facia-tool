import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";
import {
  BROWSER_MOCKS,
  CI_APP_BASE_URL,
  LOCAL_APP_BASE_URL,
} from "./setup/constants";

const testDir = defineBddConfig({
  features: "features/**/*.feature",
  steps: "steps/**/*.ts",
});

const resolverRules = [
  ...BROWSER_MOCKS.map(
    ({ hostname, httpsHostPort }) =>
      `MAP ${hostname} 127.0.0.1:${httpsHostPort}`,
  ),
].join(",");

const baseURL =
  process.env.E2E_START_STACK || process.env.CI
    ? CI_APP_BASE_URL
    : LOCAL_APP_BASE_URL;

export default defineConfig({
  testDir,
  globalSetup: "./global-setup.ts",
  outputDir: "target/test-results",
  fullyParallel: true,
  workers: 2,
  retries: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    video: "on-first-retry",
    screenshot: "only-on-failure",
    ignoreHTTPSErrors: true,
    launchOptions: {
      args: [`--host-resolver-rules=${resolverRules}`],
    },
  },
  reporter: process.env.CI
    ? [
        ["github"],
        ["html", { outputFolder: "target/playwright-report", open: "never" }],
      ]
    : [
        ["list"],
        ["html", { outputFolder: "target/playwright-report", open: "never" }],
      ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
