import { Then, expect } from "./fixtures.js";

Then("I should see the front named {string}", async ({ page }, name: string) => {
  await expect(page.getByTestId("front-name")).toHaveText(name);
});

Then(
  "I should see the collection named {string}",
  async ({ page }, name: string) => {
    await expect(page.getByTitle(name, { exact: true })).toBeVisible();
  },
);

Then(
  "I should see the article card named {string}",
  async ({ page }, name: string) => {
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  },
);