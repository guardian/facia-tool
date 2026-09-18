import { Given, expect } from "./fixtures";

Given("the application stack is running", async ({ request, stackInfo }) => {
  const response = await request.get(stackInfo.healthUrl);
  expect(response.ok()).toBe(true);
});

Given("I am signed in through pan-domain auth", async ({ signIn }) => {
  await signIn("default");
});

Given("I have opened the Fronts Tool landing page", async ({ page }) => {
  await page.goto("/");
});

Given("I have opened the seeded editorial front page", async ({ page }) => {
  await page.goto("/v2/editorial");
  await expect(page.getByTestId("front-name")).toHaveText(
    "Editorial Test Front",
  );
});
