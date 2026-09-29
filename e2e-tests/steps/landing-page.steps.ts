import { Then, expect } from "./fixtures.js";

Then("I should see the Front priorities navigation", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Front priorities" }),
  ).toBeVisible();
});

Then("I should see a link to the editorial fronts", async ({ page }) => {
  await expect(page.getByRole("link", { name: "editorial" })).toBeVisible();
});