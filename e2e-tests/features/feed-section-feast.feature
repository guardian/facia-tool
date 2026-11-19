Feature: Feast feed section
  When editing a Feast editions issue, the feed offers recipes and chefs to
  place on the issue instead of articles and event graphics

  Background:
    Given the application stack is running
    And I am signed in through pan-domain auth
    And I have opened a Feast editions issue

  Scenario: A Feast issue shows the recipe feed instead of the fronts feed
    Then I should see the recipe search
    And I should not see the feed type filter
  # Evidence: fronts-client/src/components/feed/FeedSection.tsx lines 82-94, 109, 116-118
  # Evidence: fronts-client/src/components/feed/RecipeSearchContainer.tsx lines 188-193, 305-320
  # Evidence: fronts-client/src/routes/routes.ts lines 34-37

  Scenario: Choosing chefs switches the feed to chef search
    When I choose to browse chefs in the feed
    Then I should see the chef search
  # Evidence: fronts-client/src/components/feed/RecipeSearchContainer.tsx lines 189-193, 314-320

  Scenario: The feed header shows the edition header instead of the feedback link
    Then I should see the edition header in the feed header
    And I should not see a "Send us feedback" link in the feed header
  # Evidence: fronts-client/src/components/feed/FeedSection.tsx lines 106
  # Evidence: fronts-client/src/components/feed/FeedSectionHeader.tsx lines 112-116, 150-160
