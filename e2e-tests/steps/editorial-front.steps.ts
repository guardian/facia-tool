import type { Page } from "@playwright/test";
import { Given, Then, When, expect } from "./fixtures";

function collection(page: Page, name: string) {
  return page.getByTestId("collection").filter({ hasText: name });
}

Given(
  "the {string} card is visible",
  async ({ page }, headline: string) => {
    await expect(
      collection(page, "Top stories").getByText(headline, { exact: true }).first(),
    ).toBeVisible();
  },
);

Then("I should see the {string} front", async ({ page }, name: string) => {
  await expect(page.getByTestId("front-name")).toHaveText(name);
});

Then(
  "I should see the {string} collection",
  async ({ page }, name: string) => {
    await expect(collection(page, name)).toBeVisible();
  },
);

Then(
  "the {string} card should be visible",
  async ({ page }, headline: string) => {
    await expect(
      collection(page, "Top stories").getByText(headline, { exact: true }).first(),
    ).toBeVisible();
  },
);

Then(
  "the {string} card should be hidden",
  async ({ page }, headline: string) => {
    await expect(
      collection(page, "Top stories").getByText(headline, { exact: true }).first(),
    ).toBeHidden();
  },
);

When(
  "I collapse the {string} collection",
  async ({ page }, name: string) => {
    await collection(page, name).getByText("Fronts Tester").click();
  },
);

When(
  "I expand the {string} collection",
  async ({ page }, name: string) => {
    await collection(page, name).getByText("Fronts Tester").click();
  },
);