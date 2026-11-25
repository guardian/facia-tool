# Feature-file generation plan

## Feature inventory

### 1. Application shell and landing navigation

The React application shell provides shared environment and error banners, global styling, routing, modal handling, and the authenticated landing page.

- Application shell and route switch: [`fronts-client/src/components/App.tsx`](../fronts-client/src/components/App.tsx)
- Landing page and permission-aware navigation: [`fronts-client/src/components/Home.tsx`](../fronts-client/src/components/Home.tsx)
- Route definitions: [`fronts-client/src/routes/routes.ts`](../fronts-client/src/routes/routes.ts)
- Server entry point for the V2 application: [`app/controllers/V2App.scala`](../app/controllers/V2App.scala)
- Authentication and application routes: [`conf/routes`](../conf/routes)

This is the foundational area because nearly every later journey depends on the shared authenticated shell and landing navigation.

### 2. Front editing and content curation

This is the core user journey: open a priority, inspect fronts, browse collections, manage cards, and move content between the feed, clipboard, and fronts.

- Main front editor: [`fronts-client/src/components/FrontsEdit/Edit.tsx`](../fronts-client/src/components/FrontsEdit/Edit.tsx)
- Front header, preview/live links, stages, rename, hide, and remove actions: [`fronts-client/src/components/FrontsEdit/FrontSection/FrontSection.tsx`](../fronts-client/src/components/FrontsEdit/FrontSection/FrontSection.tsx)
- Front/container layout and collection management: [`fronts-client/src/components/FrontsEdit/FrontContainer.tsx`](../fronts-client/src/components/FrontsEdit/FrontContainer.tsx), [`fronts-client/src/components/FrontsEdit/FrontContent.tsx`](../fronts-client/src/components/FrontsEdit/FrontContent.tsx)
- Collection display and editing controls: [`fronts-client/src/components/CollectionDisplay.tsx`](../fronts-client/src/components/CollectionDisplay.tsx)
- Feed and content search: [`fronts-client/src/components/feed/FeedSection.tsx`](../fronts-client/src/components/feed/FeedSection.tsx), [`fronts-client/src/components/feed/CapiSearchContainer.tsx`](../fronts-client/src/components/feed/CapiSearchContainer.tsx)
- Clipboard workflows: [`fronts-client/src/components/Clipboard.tsx`](../fronts-client/src/components/Clipboard.tsx), [`fronts-client/src/components/ClipboardHeader.tsx`](../fronts-client/src/components/ClipboardHeader.tsx)
- Card types: [`fronts-client/src/components/card/article/ArticleCard.tsx`](../fronts-client/src/components/card/article/ArticleCard.tsx), [`fronts-client/src/components/card/recipe/RecipeCard.tsx`](../fronts-client/src/components/card/recipe/RecipeCard.tsx), [`fronts-client/src/components/card/chef/ChefCard.tsx`](../fronts-client/src/components/card/chef/ChefCard.tsx), [`fronts-client/src/components/card/eventGraphic/EventGraphicCard.tsx`](../fronts-client/src/components/card/eventGraphic/EventGraphicCard.tsx)
- Content and user-data endpoints: [`app/controllers/FaciaToolController.scala`](../app/controllers/FaciaToolController.scala), [`app/controllers/UserDataController.scala`](../app/controllers/UserDataController.scala)

Important branches include article, event-graphic, recipe, and chef feeds; drag-and-drop; collection edit forms; clipboard persistence; previews; stale-front warnings; and edition-specific behavior.

### 3. Feed filtering and specialist content

The feed is a substantial child feature of the front editor and should be treated separately from the basic front display.

- Article/event-graphic selector and clipboard integration: [`fronts-client/src/components/feed/FeedSection.tsx`](../fronts-client/src/components/feed/FeedSection.tsx)
- Event graphic search and results: [`fronts-client/src/components/feed/EventGraphicsSearchContainer.tsx`](../fronts-client/src/components/feed/EventGraphicsSearchContainer.tsx), [`fronts-client/src/components/feed/EventGraphicFeedItem.tsx`](../fronts-client/src/components/feed/EventGraphicFeedItem.tsx)
- Recipe and chef browsing: [`fronts-client/src/components/feed/RecipeSearchContainer.tsx`](../fronts-client/src/components/feed/RecipeSearchContainer.tsx), [`fronts-client/src/components/feed/ChefFeedItem.tsx`](../fronts-client/src/components/feed/ChefFeedItem.tsx)
- Search, filtering, pagination, and feed headers: [`fronts-client/src/components/feed/SearchInput.tsx`](../fronts-client/src/components/feed/SearchInput.tsx), [`fronts-client/src/components/feed/FieldFilter.tsx`](../fronts-client/src/components/feed/FieldFilter.tsx), [`fronts-client/src/components/feed/Pagination.tsx`](../fronts-client/src/components/feed/Pagination.tsx), [`fronts-client/src/components/feed/FeedSectionHeader.tsx`](../fronts-client/src/components/feed/FeedSectionHeader.tsx)

### 4. Editions and issue management

The editions area allows editors to select editions, find or create issues, open issue-specific fronts, and manage issue publication workflows.

- Edition landing and date-based issue selection: [`fronts-client/src/components/Editions/ManageView.tsx`](../fronts-client/src/components/Editions/ManageView.tsx), [`fronts-client/src/components/Editions/ManageEdition.tsx`](../fronts-client/src/components/Editions/ManageEdition.tsx)
- Issue display and issue-version management: [`fronts-client/src/components/Editions/Issue.tsx`](../fronts-client/src/components/Editions/Issue.tsx), [`fronts-client/src/components/Editions/IssueVersions/index.tsx`](../fronts-client/src/components/Editions/IssueVersions/index.tsx), [`fronts-client/src/components/Editions/IssueVersions/VersionPublicationTable.tsx`](../fronts-client/src/components/Editions/IssueVersions/VersionPublicationTable.tsx)
- Edition issue routes: [`fronts-client/src/routes/routes.ts`](../fronts-client/src/routes/routes.ts)
- Issue, collection, front, proofing, preview, and publishing API: [`app/controllers/EditionsController.scala`](../app/controllers/EditionsController.scala)

This area has high branching and should follow the base front editor because issue pages reuse front, feed, collection, and card vocabulary.

### 5. Feast packages

Package management is a separate editing experience with search, filtering, creation, saving, unsaved-change protection, and publishing.

- Main package workflow: [`fronts-client/src/components/Packages/ManageFeastPackages.tsx`](../fronts-client/src/components/Packages/ManageFeastPackages.tsx)
- Package list and filtering: [`fronts-client/src/components/Packages/PackageListHeader.tsx`](../fronts-client/src/components/Packages/PackageListHeader.tsx), [`fronts-client/src/components/Packages/PackageListView.tsx`](../fronts-client/src/components/Packages/PackageListView.tsx)
- Package editor and collection builder: [`fronts-client/src/components/Packages/PackageCollectionBuilder.tsx`](../fronts-client/src/components/Packages/PackageCollectionBuilder.tsx)
- Package API: [`app/controllers/PackageController.scala`](../app/controllers/PackageController.scala)
- Package routes: [`conf/routes`](../conf/routes)

### 6. Custom subnav administration

Custom subnavs provide list, create, edit, save-draft, publish, discard, unpublish, delete, preview, and permission-denied journeys.

- Route container and permission handling: [`fronts-client/src/components/Subnav/index.tsx`](../fronts-client/src/components/Subnav/index.tsx)
- List view: [`fronts-client/src/components/Subnav/SubnavListView.tsx`](../fronts-client/src/components/Subnav/SubnavListView.tsx)
- Create/edit form: [`fronts-client/src/components/Subnav/SubnavForm.tsx`](../fronts-client/src/components/Subnav/SubnavForm.tsx), [`fronts-client/src/components/Subnav/SubnavEditRoute.tsx`](../fronts-client/src/components/Subnav/SubnavEditRoute.tsx)
- Server controller and persistence actions: [`app/controllers/CustomSubnavController.scala`](../app/controllers/CustomSubnavController.scala)
- API routes: [`conf/routes`](../conf/routes)

### 7. Feature switches and configuration

- Feature-switch page: [`fronts-client/src/components/Features/FeaturesView.tsx`](../fronts-client/src/components/Features/FeaturesView.tsx)
- Feature-switch form: [`fronts-client/src/components/Features/FeaturesForm.tsx`](../fronts-client/src/components/Features/FeaturesForm.tsx)
- Feature-switch persistence: [`app/controllers/UserDataController.scala`](../app/controllers/UserDataController.scala)
- Legacy configuration editor: [`app/controllers/ViewsController.scala`](../app/controllers/ViewsController.scala), [`conf/routes`](../conf/routes)

### 8. Legacy V1 editor and admin flows

These are server-rendered or Knockout-based flows with little shared vocabulary with the React application.

- Server-rendered priority and collection/configuration pages: [`app/controllers/ViewsController.scala`](../app/controllers/ViewsController.scala)
- Legacy bootstrap and route loading: [`public/src/js/main.js`](../public/src/js/main.js), [`public/src/js/modules/router.js`](../public/src/js/modules/router.js), [`public/src/js/modules/route-handlers.js`](../public/src/js/modules/route-handlers.js)
- Legacy front editor: [`public/src/js/widgets/columns/fronts.js`](../public/src/js/widgets/columns/fronts.js)
- Legacy configuration editor: [`public/src/js/widgets/columns/fronts-config.js`](../public/src/js/widgets/columns/fronts-config.js)
- Troubleshooting/admin page: [`app/controllers/TroubleshootController.scala`](../app/controllers/TroubleshootController.scala), [`public/src/js/troubleshoot/main.js`](../public/src/js/troubleshoot/main.js)
- Authentication/login pages: [`app/controllers/PandaAuthController.scala`](../app/controllers/PandaAuthController.scala), [`conf/routes`](../conf/routes)

## Existing coverage

Existing feature files are in [`e2e-tests/features/`](../e2e-tests/features/).

1. **Landing page**
   - [`landing-page.feature`](../e2e-tests/features/landing-page.feature)
   - Covers authenticated entry to the Fronts Tool, the priorities navigation, and the editorial link.
   - Steps: [`landing-page.steps.ts`](../e2e-tests/steps/landing-page.steps.ts)

2. **Basic seeded editorial front**
   - [`editorial-front.feature`](../e2e-tests/features/editorial-front.feature)
   - Covers opening the editorial fronts page and seeing the seeded front, collection, and article card.
   - Steps: [`editorial-front.steps.ts`](../e2e-tests/steps/editorial-front.steps.ts)

3. **Front feed**
   - [`feed-section.feature`](../e2e-tests/features/feed-section.feature)
   - Covers article/event-graphic selection, event-graphic search and empty states, clipboard addition, event-graphic hover actions, clipboard toggling, open-front count/menu, and the feedback link.
   - Steps: [`feed-section.steps.ts`](../e2e-tests/steps/feed-section.steps.ts)

Shared stack and authentication steps are available in [`background.steps.ts`](../e2e-tests/steps/background.steps.ts).

## Recommended generation order

For each item, complete the feature file and its step definitions together:

- Use the **`feature-file-from-templates` skill** to write the evidence-annotated `.feature` file.
- Immediately use the **`feature-file-step-definitions` skill** to wire it to runnable Playwright/BDD tests.

### Phase 1 — Establish the shared application journey

1. **Extend landing-page coverage**
   - Add permission-aware landing navigation for editions, Feast packages, custom subnavs, feature switches, and manage-editions links.
   - **Rationale:** Establishes reusable navigation steps and exposes the main user-facing areas.

2. **Complete the foundational editorial front**
   - Add opening/closing fronts, front menus, draft/live browsing, collection expansion, basic card actions, preview/live links, and front error/stale states.
   - **Rationale:** Builds reusable “front loaded/open/displayed” steps for later edition and Feast journeys.

3. **Complete feed and clipboard behavior**
   - Extend the existing feed feature with article search, pagination/filtering, card hover actions, clipboard persistence/removal/clearing, and drag/drop into collections.
   - **Rationale:** Feed and clipboard behavior are dependencies of content-curation scenarios and already have a growing step vocabulary.

### Phase 2 — Cover the core editing value

4. **Collection editing and card management**
   - Cover collection metadata, card ordering, add/remove/move operations, collection warnings, forms, image/video settings, and save/discard behavior.
   - **Rationale:** Covers the primary editor value using the front, feed, clipboard, card, and collection steps from Phase 1.

5. **Front configuration and front-level actions**
   - Cover front creation/removal, rename, hidden-state changes, favourites, front navigation, and configuration-related permissions.
   - **Rationale:** Depends on the front editor container and follows collection interactions.

6. **Specialist content flows**
   - Cover Feast recipe/chef browsing, Feast collections, event graphics beyond the existing feed cases, and card-specific forms.
   - **Rationale:** Higher-branch child flows can reuse the established feed, clipboard, card, and collection steps.

### Phase 3 — Editions and issue workflows

7. **Manage Editions landing**
   - Cover edition selection, date-picker behavior, existing issue lookup, no-issue states, and permission-denied messaging.
   - **Rationale:** Establishes the issue-management vocabulary.

8. **Issue creation and opening**
   - Cover creating a new issue, Feast “from previous issue” creation, opening an issue, and issue-specific front loading.
   - **Rationale:** Depends on the manage-edition flow and reuses the established front editor behavior.

9. **Issue versions, proofing, preview, publishing, and metadata**
   - Cover version tables, last-proofed versions, preflight checks, preview, publish/delete actions, hidden fronts, front metadata, and collection movement.
   - **Rationale:** This is the largest and riskiest editions area, so it should follow the basic issue journey.

### Phase 4 — Independent React administration

10. **Custom subnav list**
    - Cover loading, empty states, list entries, status badges, edit links, and permission denial.
    - **Rationale:** The list view is the container for later subnav mutations.

11. **Custom subnav create/edit**
    - Cover adding/removing/reordering navigation items, page configuration, preview refresh, saving drafts, and editing existing entries.
    - **Rationale:** Create/edit forms depend on the list and shared loading, error, and notification behavior.

12. **Custom subnav lifecycle**
    - Cover publish, discard, unpublish, delete, confirmation dialogs, pending states, and error notifications.
    - **Rationale:** Lifecycle mutations are the highest-risk subnav branches and should follow form persistence.

13. **Feature switches**
    - Cover loading the feature-switch page, toggling supported switches, persistence, and permission/error states.
    - **Rationale:** Small and independent, but benefits from shared authenticated navigation and notification steps.

14. **Feast package management**
    - Cover package search/filtering, visibility filtering, create/edit, collection building, save validation, unsaved-change protection, retry/error states, and publishing confirmation.
    - **Rationale:** A large independent editor with its own API and state model.

### Phase 5 — Legacy and server-rendered flows

15. **Legacy V1 front editor**
    - Cover `/editorial`, `/commercial`, `/training`, `/email`, and `/showcase` where applicable, including front loading, collection editing, search, press actions, and breaking-news/treats variants.
    - **Rationale:** These flows use Knockout widgets and legacy route vocabulary, so they share little with the React suite.

16. **Legacy configuration editor**
    - Cover `/priority/config`, front/collection configuration, card types, navigation sections, and configuration permissions.
    - **Rationale:** A separate server-rendered/Knockout workflow.

17. **Troubleshooting/admin page**
    - Cover `/troubleshoot`, stale-content views, refresh/scheduler behavior, and administrative error states.
    - **Rationale:** Isolated admin journey with minimal overlap with the main application.

18. **Authentication and server-rendered edge pages**
    - Cover login/auth-error/status behavior, logout, redirects, vanity redirects, and remaining server-rendered landing variants.
    - **Rationale:** Cross-cutting and infrastructure-sensitive flows are best added after the primary authenticated journeys are stable.

## Practical workflow

For each numbered item:

1. Write the `.feature` file with **`feature-file-from-templates`**.
2. Wire its steps with **`feature-file-step-definitions`**.
3. Run focused BDD generation, type-checking, and the affected test.
4. Proceed to the next item so the shared Playwright step library grows incrementally.