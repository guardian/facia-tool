import { Then, expect } from "./fixtures";

Then("the browser path should be {string}", async ({ page }, path: string) => {
  await expect(page).toHaveURL(new RegExp(`${path.replace("/", "\\/")}$`));
});

Then(
  "I should see the {string} heading",
  async ({ page }, heading: string) => {
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  },
);

Then(
  "I should see the {string} priority link",
  async ({ page }, priority: string) => {
    await expect(page.getByRole("link", { name: priority })).toBeVisible();
  },
);
