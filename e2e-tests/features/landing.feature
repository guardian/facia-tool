Feature: Open the Fronts Tool landing page
  Editors entering at the root route should arrive in the current V2 tool and
  see the available areas of the application.

  Background:
    Given the application stack is running
    And I am signed in through pan-domain auth
    And I have opened the Fronts Tool landing page

  Scenario: The root route opens the V2 home page
    Then the browser path should be "/v2"
    And I should see the "Front priorities" heading
    And I should see the "editorial" priority link
  # Evidence: conf/routes
  # Evidence: app/controllers/ViewsController.scala
  # Evidence: app/controllers/V2App.scala
  # Evidence: fronts-client/src/components/Home.tsx
