Feature: Fronts Tool landing page
  Editors can enter the Fronts Tool and choose the kind of front they want to
  manage from the priorities navigation

  Background:
    Given the application stack is running
    And I am signed in through pan-domain auth
    And I have opened the Fronts Tool landing page

  Scenario: The landing page offers editorial fronts
    Then I should see the Front priorities navigation
    And I should see a link to the editorial fronts
  # Evidence: fronts-client/src/components/App.tsx
  # Evidence: fronts-client/src/components/Home.tsx
  # Evidence: fronts-client/src/routes/routes.ts