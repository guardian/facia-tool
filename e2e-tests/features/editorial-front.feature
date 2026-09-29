Feature: Seeded editorial front
  Editors can open the seeded editorial front and see its configured collection
  and synthetic article card

  Background:
    Given the application stack is running
    And I am signed in through pan-domain auth
    And I have opened the editorial fronts page

  Scenario: The seeded front displays its collection and card
    Then I should see the front named "Test Editorial Front"
    And I should see the collection named "E2E Editorial Collection"
    And I should see the article card named "Synthetic E2E article"
  # Evidence: fronts-client/src/components/FrontsEdit/Edit.tsx
  # Evidence: fronts-client/src/components/FrontsEdit/FrontSection/FrontSection.tsx
  # Evidence: fronts-client/src/components/CollectionDisplay.tsx
  # Evidence: fronts-client/src/components/card/article/ArticleBody.tsx
  # Evidence: fronts-client/src/index.tsx