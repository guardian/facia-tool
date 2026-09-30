# E2E test setup plan: Facia Tool

Living plan for a self-contained Playwright and Cucumber end-to-end suite. The
implementation follows the `e2e-test-setup` playbook, adapts it to Facia Tool,
and keeps this file current as each phase is completed.

## Confirmed scope and decisions

- Phases 0-6 are implemented: discovery, scaffold, stack, fixtures and mocks,
  validating feature tests, documentation, and CI. Phase 7 remains iterative
  and starts only after the setup is user-verified.
- Use Yarn for `e2e-tests/`, matching the V2 React client. The top-level npm
  lockfile belongs to the legacy V1 client.
- Run Play and Vite natively for `dev` and `dev:local`. Containerise the app only
  for `test:ci`, using a toolchain-only image with the repository bind-mounted.
- Mock all HTTP dependencies. No Guardian repository dependency runs from
  source, so no private checkout or GitHub App token is needed.
- Represent Facia Press and Editions downstream integrations through LocalStack
  SNS, SQS, and S3 rather than running their consumers.
- Test `/` as the landing route, including its redirect to `/v2`.
- Validate the main feature slice by opening a seeded editorial front, expanding
  one collection, and seeing its seeded cards.

## Phase 0: discovery

### Runtime

- Backend: Play Framework 3, Scala 2.13, sbt 1.9.6, and Java 11. The server runs
  with `sbt run` on port 9000.
- V2 frontend: React and TypeScript built by Vite, with Node 20.9 and Yarn 1.
  The development server runs on port 5173 and serves `/v2` assets.
- Local host access: dev-nginx terminates TLS for
  `https://fronts.local.dev-gutools.co.uk`.
- Configuration: the app reads `/etc/gu/facia-tool.properties` and
  `/etc/gu/facia-tool.application.secrets.conf`.

### Datastores and AWS services

| Dependency | E2E handling |
| --- | --- |
| PostgreSQL, including Play evolutions and Editions data | Stock PostgreSQL container |
| S3 fronts/config, pan-domain, permissions, switchboard, and Editions buckets | LocalStack |
| DynamoDB user data and front-press status | LocalStack |
| SQS publication event listener | LocalStack |
| SNS Facia Press and Feast publication topics | LocalStack |
| STS used for draft CAPI signing | LocalStack or avoided by mock-compatible e2e configuration |
| CloudWatch, RDS, and SSM | Not active in Play development mode |

All LocalStack clients use dummy credentials and explicit endpoints. The app
uses both AWS Java SDK v1 and v2, so endpoint environment variables alone are
not sufficient.

### HTTP and browser dependencies

| Dependency | Guardian source | E2E handling |
| --- | --- | --- |
| Content API live and draft | Guardian-operated; deployable source not publicly identified | WireMock |
| Ophan | Guardian-operated; deployable source not publicly identified | WireMock |
| Grid | `guardian/grid` | WireMock |
| Recipes | `guardian/recipes`, `guardian/recipes-backend` | WireMock |
| Mobile notifications | Guardian-operated; public clients only | WireMock |
| User telemetry | `guardian/editorial-tools-user-telemetry-service` | WireMock |
| Pinboard | `guardian/pinboard` | Keep permission disabled for initial tests |
| Video/Atom Maker | No public deployable source identified | Exclude from initial tests |
| Facia Press | `guardian/frontend` | LocalStack SNS contract only |
| Editions downstream | `guardian/editions` | LocalStack AWS contracts only |

Preview, email rendering, Editions Card Builder, live Guardian pages, image
CDNs, and arbitrary URL proxy destinations are feature-specific. Add controlled
fixtures only when a later scenario exercises them.

### Authentication

- Pan-domain auth verifies a signed cookie using settings loaded from S3.
- Each run generates a fresh RSA keypair and seeds the public key into the local
  pan-domain settings.
- Synthetic role emails are present in a local permissions fixture.
- Headless tests sign their cookie through a shared Playwright fixture.
- `dev:local` provides the cookie server-side through a local auth redirect, so
  manual browsers need no forced cookie or browser mock.

### Environment

- Docker client and daemon 29.7.2 are available in the dev container.
- The e2e GitHub Actions workflow uses a Docker-capable `ubuntu-22.04` runner.

## Feature overview

No end-to-end feature files exist on the rebased branch.

### Foundational journeys

- Pan-domain authentication, access permission checks, login and unauthorized
  states.
- Root landing route and the default redirect into the V2 application.
- V2 application shell, navigation, front overview, and priority selection.

### Front curation

- Load fronts and collections for editorial, commercial, training, email, and
  showcase priorities.
- Expand and collapse collections, inspect cards, and refresh collection data.
- Search CAPI feeds, add or remove cards, reorder cards and collections, edit
  metadata, discard changes, and publish or launch fronts.
- Clipboard, favourite fronts, front ordering, feature switches, Grid images,
  Ophan page views, Pinboard, video atoms, recipes, and external snap links.

### Configuration and specialist tools

- Front and collection configuration, metadata, geolocation, and custom
  subnavigation.
- Breaking-news curation and notification delivery.
- Editions and Feast issue creation, issue lists, templates, proofing,
  publishing, preflight checks, collection prefills, and version history.
- Legacy V1 collection/config editors and server-rendered priority views.
- Troubleshoot and authentication status pages.

## Recommended feature generation order

For every item, use `feature-file-from-templates` to write the feature and
`feature-file-step-definitions` immediately afterwards so shared steps grow with
executable coverage.

1. Landing and V2 editorial-front load: establishes auth, navigation, seeded
   fronts, collections, and card rendering. This is the initial validation set.
2. Core card curation: add, move, edit, discard, and publish cards using the
   foundational front and collection steps.
3. V2 front configuration and custom subnavigation: reuses V2 navigation and
   permission fixtures.
4. Editions and Feast: adds PostgreSQL-heavy issue workflows after the shared
   application steps are stable.
5. Grid, recipes, Ophan, video, Pinboard, and snap-link integrations: add each
   mock only as its feature is covered.
6. Breaking news: isolated permissions and notification behavior.
7. Legacy V1 editors, troubleshoot, and auth status: server-rendered flows with
   less reusable V2 step vocabulary.

## Phase checklist

- [x] Phase 0: discovery, dependency decisions, feature overview, and scope.
- [x] Phase 1: Yarn scaffold, Playwright/BDD configuration, and shared lifecycle.
- [x] Phase 2: PostgreSQL, LocalStack, WireMock, native development startup, and
  bind-mounted CI app container.
- [x] Phase 3: synthetic auth, permissions, S3, DynamoDB, SQS, fronts data, and
  HTTP fixtures.
- [x] Phase 4: landing redirect and seeded editorial-front feature tests with
  step definitions.
- [x] Phase 5: `e2e-tests/README.md` describing the implemented suite.
- [x] Phase 6: pinned GitHub Actions workflow running `yarn test:ci` and
  uploading Playwright artifacts on failure.
- [ ] Phase 7: iterative coverage expansion. Start only after phases 0-6 are
  verified by the user.

## Verification record

- Phase 0: codebase discovery and Docker availability confirmed.
- Phase 1: Yarn install and lockfile generation completed; `yarn typecheck`
  passes.
- Phase 2: `dev:local` boots PostgreSQL, LocalStack, all WireMocks, native Play,
  native Vite, and the server-side auth proxy. Play health returns 200 and the
  stack tears down cleanly on SIGTERM. A separate container-mode check built the
  toolchain-only image, started the bind-mounted app and CI nginx proxy, returned
  health 200 and the expected root redirect, then tore down successfully.
- Phase 3: LocalStack logs confirm S3, DynamoDB, SNS, SQS, and STS traffic. The
  app successfully reads pan-domain settings, switchboard data, front config,
  user data, collection data, and both live and preview CAPI responses without
  contacting AWS endpoints.
- Phase 4: `yarn bddgen` and `yarn typecheck` pass. A clean Chromium session
  manually verified `/` redirects to `/v2`, the editorial front and `Top
  stories` render, `Seeded E2E story` appears, and the collection collapses and
  expands. The Playwright suite itself was not run because the setup agent only
  runs it when explicitly requested.
- Phase 5: README written from the implemented commands, ports, routing, and
  fixture layout.
- Phase 6: `.github/workflows/e2e-tests.yml` installs the V2 and e2e Yarn
  workspaces, installs the Chromium headless shell only, runs `yarn test:ci`,
  and uploads `target/test-results` on failure. No private dependency checkout
  or GitHub App token is required. Actionlint passes, both frozen Yarn installs
  succeed locally, setup-node v4.4.0 supports the selected `.tool-versions`
  file, and Playwright supports `--only-shell`.

## Open follow-ups

- Confirm the first pull-request workflow run passes on GitHub-hosted amd64.
- After the setup is user-verified, choose the next Phase 7 feature from the
  generation order above.
