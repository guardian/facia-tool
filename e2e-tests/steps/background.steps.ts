import { Given, expect } from "./fixtures.js";

Given("the application stack is running", async ({ stack }) => {
  const response = await fetch(`${stack.baseUrl}/_healthcheck`);
  expect(response.ok).toBe(true);
});

Given("I am signed in through pan-domain auth", async ({ page, stack }) => {
  await page.goto(`${stack.baseUrl}/cookie`);
  await expect(page).toHaveURL(`${stack.baseUrl}/v2`);
});

Given("I have opened the Fronts Tool landing page", async ({ page, stack }) => {
  await page.goto(`${stack.baseUrl}/v2`);
});

Given("I have opened the editorial fronts page", async ({ page, stack }) => {
  await page.goto(`${stack.baseUrl}/v2/editorial`);
});