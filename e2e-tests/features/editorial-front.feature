Feature: View a seeded editorial front
  Editors should be able to open an editorial front, inspect its first
  collection, and expand or collapse the seeded cards.

  Background:
    Given the application stack is running
    And I am signed in through pan-domain auth
    And I have opened the seeded editorial front page

  Scenario: The seeded front loads its collection and card
    Then I should see the "Editorial Test Front" front
    And I should see the "Top stories" collection
    And the "Seeded E2E story" card should be visible
  # Evidence: app/controllers/V2App.scala
  # Evidence: app/controllers/FaciaToolController.scala
  # Evidence: app/controllers/FaciaToolV2Controller.scala
  # Evidence: fronts-client/src/components/FrontsEdit/Edit.tsx
  # Evidence: fronts-client/src/actions/Collections.ts
  # Evidence: fronts-client/src/components/FrontsEdit/FrontSection/FrontSection.tsx
  # Evidence: fronts-client/src/components/CollectionDisplay.tsx
  # Evidence: e2e-tests/fixtures/fronts/config.json
  # Evidence: e2e-tests/fixtures/fronts/e2e-editorial.collection.json

  Scenario: A collection can be collapsed and expanded
    Given the "Seeded E2E story" card is visible
    When I collapse the "Top stories" collection
    Then the "Seeded E2E story" card should be hidden
    When I expand the "Top stories" collection
    Then the "Seeded E2E story" card should be visible
  # Evidence: fronts-client/src/components/CollectionDisplay.tsx
  # Evidence: fronts-client/src/components/FrontsEdit/CollectionComponents/Collection.tsx
  # Evidence: e2e-tests/fixtures/fronts/e2e-editorial.collection.json
