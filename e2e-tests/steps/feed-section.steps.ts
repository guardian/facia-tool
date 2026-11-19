import type { Page } from "@playwright/test";
import { Given, Then, When, expect } from "./fixtures.js";

// Mirrors the hard-coded list in fronts-client/src/constants/eventGraphics.ts.
const eventGraphicTitles = [
  "US general 2024 — congress",
  "US general 2026 — congress",
];
const eventGraphicKind = "Election Tracker";

const feedTypeFilter = (page: Page) => page.getByLabel("Filter by type:");
const feedItem = (page: Page, text: string) =>
  page.getByTestId("feed-item").filter({ hasText: text });
const clipboardToggle = (page: Page) =>
  page.getByLabel("Clipboard", { exact: true });
const feedHeaderLogo = (page: Page) =>
  page.getByTitle("Click to manage active fronts");

const filterFeedByType = async ({ page }: { page: Page }, label: string) => {
  await feedTypeFilter(page).selectOption({ label });
};

Given("the feed is filtered by type {string}", filterFeedByType);
When("I filter the feed by type {string}", filterFeedByType);

Then(
  "the feed type filter should be set to {string}",
  async ({ page }, label: string) => {
    await expect(feedTypeFilter(page).locator("option:checked")).toHaveText(
      label,
    );
  },
);

Then(
  "the feed type filter should offer {string} and {string}",
  async ({ page }, first: string, second: string) => {
    await expect(feedTypeFilter(page).locator("option")).toHaveText([
      first,
      second,
    ]);
  },
);

Then("I should not see the feed type filter", async ({ page }) => {
  await expect(feedTypeFilter(page)).toHaveCount(0);
});

Then("I should see the article search", async ({ page }) => {
  await expect(page.getByPlaceholder("Search content")).toBeVisible();
});

Then("I should not see the article search", async ({ page }) => {
  await expect(page.getByPlaceholder("Search content")).toHaveCount(0);
});

Then(
  "I should see the article card named {string} in the feed",
  async ({ page }, name: string) => {
    await expect(feedItem(page, name)).toBeVisible();
  },
);

Then(
  "I should see every available event graphic with its kind",
  async ({ page }) => {
    for (const title of eventGraphicTitles) {
      await expect(feedItem(page, title)).toContainText(eventGraphicKind);
    }
  },
);

Then("I should not see any event graphics in the feed", async ({ page }) => {
  await expect(feedItem(page, eventGraphicKind)).toHaveCount(0);
});

When(
  "I search event graphics for {string}",
  async ({ page }, query: string) => {
    await page.getByPlaceholder("Search event graphics").fill(query);
  },
);

Then(
  "I should only see the event graphic {string}",
  async ({ page }, title: string) => {
    await expect(page.getByTestId("feed-item")).toHaveCount(1);
    await expect(feedItem(page, title)).toBeVisible();
  },
);

Then("I should see {string} in the feed", async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: true })).toBeVisible();
});

Given("the clipboard is empty", async ({ page, stack }) => {
  // Clipboard contents persist per user, so reset them and reload the page.
  const response = await page.request.put(`${stack.baseUrl}/userdata/clipboard`, {
    data: [],
  });
  expect(response.ok()).toBe(true);
  await page.reload();
});

When(
  "I add the event graphic {string} to the clipboard",
  async ({ page }, title: string) => {
    const item = feedItem(page, title);
    await item.hover();
    await item.getByTestId("add-to-clipboard-hover-button").click();
  },
);

Then(
  "the clipboard should contain the event graphic {string}",
  async ({ page }, title: string) => {
    await expect(
      page
        .getByTestId("clipboard")
        .getByTestId("event-graphic")
        .filter({ hasText: title }),
    ).toBeVisible();
  },
);

When(
  "I hover over the event graphic {string}",
  async ({ page }, title: string) => {
    await feedItem(page, title).hover();
  },
);

Then("I should not see a View action for it", async ({ page }) => {
  const hovered = page.locator('[data-testid="feed-item"]:hover');
  await expect(
    hovered.getByTestId("add-to-clipboard-hover-button"),
  ).toBeVisible();
  // The View action is the only link among the hover actions for event graphics.
  await expect(
    hovered.getByTestId("hover-actions-wrapper").getByRole("link"),
  ).toHaveCount(0);
});

Given("the clipboard is closed", async ({ page }) => {
  const clipboard = page.getByTestId("clipboard-wrapper");
  await expect(clipboardToggle(page)).toBeVisible();
  if (await clipboard.isVisible()) {
    await clipboardToggle(page).click();
  }
  await expect(clipboard).toBeHidden();
});

When("I toggle the clipboard", async ({ page }) => {
  await clipboardToggle(page).click();
});

Then("the clipboard should be open beside the feed", async ({ page }) => {
  await expect(page.getByTestId("clipboard-wrapper")).toBeVisible();
});

Then(
  "the feed header should show the number of open fronts",
  async ({ page }) => {
    await expect(page.getByTestId("front-name").first()).toBeVisible();
    const openFronts = await page.getByTestId("front-name").count();
    await expect(feedHeaderLogo(page)).toHaveText(String(openFronts));
  },
);

When(
  "I open the current fronts menu from the feed header",
  async ({ page }) => {
    await feedHeaderLogo(page).click();
  },
);

Then("I should see the list of currently open fronts", async ({ page }) => {
  const frontNames = await page.getByTestId("front-name").allTextContents();
  expect(frontNames.length).toBeGreaterThan(0);
  for (const name of frontNames) {
    // Each open front's heading carries the same title, so exclude it.
    await expect(
      page
        .getByTitle(name, { exact: true })
        .and(page.locator(':not([data-testid="front-name"])')),
    ).toBeVisible();
  }
});

Then(
  "I should see a {string} link in the feed header",
  async ({ page }, name: string) => {
    await expect(page.getByRole("link", { name })).toBeVisible();
  },
);

Then(
  "I should not see a {string} link in the feed header",
  async ({ page }, name: string) => {
    await expect(page.getByRole("link", { name })).toHaveCount(0);
  },
);

Then("I should see the recipe search", async ({ page }) => {
  await expect(page.getByPlaceholder("Search recipes")).toBeVisible();
});

When("I choose to browse chefs in the feed", async ({ page }) => {
  // The radio input sits visually hidden behind its label, which users click.
  await page.getByText("Chefs", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "Chefs" })).toBeChecked();
});

Then("I should see the chef search", async ({ page }) => {
  await expect(page.getByPlaceholder("Search chefs")).toBeVisible();
});

Then("I should see the edition header in the feed header", async ({ page }) => {
  await expect(page.getByText("Feast Northern Hemisphere")).toBeVisible();
});
