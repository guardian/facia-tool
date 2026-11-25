Feature: Fronts feed section
  Editors browse content to place on a front from the feed beside their open
  fronts, choosing between articles and event graphics, and can move items to
  the clipboard

  Background:
    Given the application stack is running
    And I am signed in through pan-domain auth
    And I have opened the editorial fronts page

  Scenario: The feed shows articles by default
    Then the feed type filter should be set to "Articles"
    And I should see the article search
    And I should see the article card named "Synthetic E2E article" in the feed
  # Evidence: fronts-client/src/components/feed/FeedSection.tsx lines 77, 82-99, 109
  # Evidence: fronts-client/src/components/feed/CapiSearchContainer.tsx lines 264-270
  # Evidence: fronts-client/src/components/feed/SearchInput.tsx lines 123
  # Evidence: fronts-client/src/components/FrontsEdit/Edit.tsx lines 79

  Scenario: The feed type filter offers articles and event graphics
    Then the feed type filter should offer "Articles" and "Event graphics"
  # Evidence: fronts-client/src/components/feed/FeedSection.tsx lines 82-94

  Scenario: Filtering by event graphics lists the available event graphics
    When I filter the feed by type "Event graphics"
    Then I should see every available event graphic with its kind
    And I should not see the article search
  # Evidence: fronts-client/src/components/feed/FeedSection.tsx lines 89, 95-96
  # Evidence: fronts-client/src/components/feed/EventGraphicsSearchContainer.tsx lines 39-42, 65-71
  # Evidence: fronts-client/src/components/feed/EventGraphicFeedItem.tsx lines 31, 42-46
  # Evidence: fronts-client/src/constants/eventGraphics.ts lines 22-33

  Scenario: Switching back to articles restores the article feed
    Given the feed is filtered by type "Event graphics"
    When I filter the feed by type "Articles"
    Then I should see the article search
    And I should not see any event graphics in the feed
  # Evidence: fronts-client/src/components/feed/FeedSection.tsx lines 77, 89, 95-99

  Scenario: Searching event graphics narrows the list to matches
    Given the feed is filtered by type "Event graphics"
    When I search event graphics for "2026"
    Then I should only see the event graphic "US general 2026 — congress"
  # Evidence: fronts-client/src/components/feed/EventGraphicsSearchContainer.tsx lines 37-47, 53-58, 65-71
  # Evidence: fronts-client/src/constants/eventGraphics.ts lines 22-33

  Scenario: Searching event graphics with no match shows an empty state
    Given the feed is filtered by type "Event graphics"
    When I search event graphics for "no such graphic"
    Then I should see "No results found" in the feed
  # Evidence: fronts-client/src/components/feed/EventGraphicsSearchContainer.tsx lines 39-47, 65-74

  Scenario: An event graphic can be added to the clipboard
    Given the clipboard is empty
    And the feed is filtered by type "Event graphics"
    When I add the event graphic "US general 2024 — congress" to the clipboard
    Then the clipboard should contain the event graphic "US general 2024 — congress"
  # Evidence: fronts-client/src/components/feed/EventGraphicFeedItem.tsx lines 17-25, 35
  # Evidence: fronts-client/src/components/feed/FeedItem.tsx lines 263-267
  # Evidence: fronts-client/src/components/feed/FeedSection.tsx lines 111
  # Evidence: app/controllers/UserDataController.scala lines 71-77

  Scenario: Event graphics have no View action
    Given the feed is filtered by type "Event graphics"
    When I hover over the event graphic "US general 2024 — congress"
    Then I should not see a View action for it
  # Evidence: fronts-client/src/components/feed/EventGraphicFeedItem.tsx lines 40-41
  # Evidence: fronts-client/src/components/feed/FeedItem.tsx lines 168, 257-259

  Scenario: The clipboard can be toggled while browsing event graphics
    Given the feed is filtered by type "Event graphics"
    And the clipboard is closed
    When I toggle the clipboard
    Then the clipboard should be open beside the feed
  # Evidence: fronts-client/src/components/feed/EventGraphicsSearchContainer.tsx lines 60
  # Evidence: fronts-client/src/components/ClipboardHeader.tsx lines 58-75
  # Evidence: fronts-client/src/components/Clipboard.tsx lines 152-168
  # Evidence: fronts-client/src/components/feed/FeedSection.tsx lines 108-111
  # Evidence: fronts-client/src/components/FrontsEdit/Edit.tsx lines 79

  Scenario: The feed header shows how many fronts are open
    Then the feed header should show the number of open fronts
  # Evidence: fronts-client/src/components/feed/FeedSection.tsx lines 106
  # Evidence: fronts-client/src/components/feed/FeedSectionHeader.tsx lines 132-136, 172

  Scenario: The feed header opens the current fronts menu
    When I open the current fronts menu from the feed header
    Then I should see the list of currently open fronts
  # Evidence: fronts-client/src/components/feed/FeedSectionHeader.tsx lines 127-130, 146-149, 179-182, 193-194
  # Evidence: fronts-client/src/components/FrontsEdit/Edit.tsx lines 81-84

  Scenario: The feed header offers a feedback link
    Then I should see a "Send us feedback" link in the feed header
  # Evidence: fronts-client/src/components/feed/FeedSectionHeader.tsx lines 150-160
