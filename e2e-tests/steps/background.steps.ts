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

Given("I have opened a Feast editions issue", async ({ page, stack }) => {
  // Each scenario creates its own issue so parallel workers never share one.
  const response = await page.request.post(
    `${stack.baseUrl}/editions-api/editions/feast-northern-hemisphere/issues`,
    { data: { issueDate: new Date().toISOString().slice(0, 10) } },
  );
  expect(response.status()).toBe(201);
  const issue = (await response.json()) as { id: string };
  await page.goto(`${stack.baseUrl}/v2/issues/${issue.id}`);
});