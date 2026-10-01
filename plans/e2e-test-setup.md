# facia-tool: end-to-end test setup plan

Living plan for a self-contained Playwright, Cucumber BDD and Testcontainers
end-to-end test suite. This applies the repository's `e2e-test-setup` playbook
to facia-tool rather than copying its reference stack.

## Phase 0 status

- Discovery completed from source on 28 September 2026.
- Docker availability verified in the dev container.
- Dependency treatment, delivery scope, landing page and starter feature
  confirmed on 28 September 2026.
- Phase 0 validation completed: source-evidence review, `git diff --check`, 26
  local evidence links resolved, and no editor diagnostics found.

## Runtime inventory

| Area | Finding | Evidence |
| --- | --- | --- |
| Server | Play 3, Scala 2.13 and Java 11, built and run with sbt | [`build.sbt`](../build.sbt), [`.tool-versions`](../.tool-versions) |
| V2 client | React/Redux and TypeScript built by Vite; Yarn 1 workspace | [`fronts-client/package.json`](../fronts-client/package.json), [`fronts-client/yarn.lock`](../fronts-client/yarn.lock), [`fronts-client/vite.config.mts`](../fronts-client/vite.config.mts) |
| V1 client | JSPM/Grunt JavaScript; npm workspace | [`package.json`](../package.json), [`package-lock.json`](../package-lock.json), [`Gruntfile.js`](../Gruntfile.js) |
| Native development | `yarn watch` starts Vite on port 5173, Docker Compose starts Postgres, and `sbt run` starts Play on port 9000 | [`scripts/dev-start.sh`](../scripts/dev-start.sh), [`fronts-client/vite.config.mts`](../fronts-client/vite.config.mts) |
| Local URL | dev-nginx maps `https://fronts.local.dev-gutools.co.uk` to Play port 9000 | [`nginx/nginx-mapping.yml`](../nginx/nginx-mapping.yml) |
| CI build | V1 uses npm, V2 uses Yarn, and the server is packaged with `sbt debian:packageBin` | [`.github/workflows/improvedci.yml`](../.github/workflows/improvedci.yml) |

**Confirmed package-manager decision:** use Yarn for the `e2e-tests/`
workspace, matching the V2 application under test and its existing Yarn
workspace.

## Data stores and AWS services

| Dependency | Application use | E2E treatment |
| --- | --- | --- |
| PostgreSQL | Editions issues, fronts, collections and packages; schema managed by Play evolutions | Real Postgres Testcontainer with seeded rows |
| S3 | Front and collection state, published/preview Editions, switchboard state, pan-domain settings and permissions cache | One LocalStack container with seeded buckets/objects |
| DynamoDB | Front press status and per-user UI data | LocalStack with seeded tables/items |
| SQS | Editions publication event listener | LocalStack queue |
| SNS | Front press and Feast publication topics | LocalStack topics |
| STS | IAM-authenticated draft CAPI requests | LocalStack when exercised; otherwise keep calls dormant |
| CloudWatch | Application metrics | Disable in development where supported; route any remaining calls to LocalStack |
| RDS and SSM | Production-only database endpoint and password discovery | Not started for e2e because Play development mode uses explicit Postgres configuration |

The owning construction path is [`app/Components.scala`](../app/Components.scala).
Configuration keys and production/development branching are in
[`app/conf/Configuration.scala`](../app/conf/Configuration.scala) and
[`conf/application.conf`](../conf/application.conf).

### AWS isolation constraint

Only the fronts-state S3 client currently supports `aws.localS3Endpoint`; the
pan-domain S3 client, switchboard S3 client, DynamoDB, SNS, SQS, STS and other
AWS clients do not share that override. Phase 2 must add the smallest possible
configuration-driven endpoint path, use static dummy credentials, and verify
at runtime that no request reaches an `amazonaws.com` endpoint. Relevant code:

- [`app/services/S3.scala`](../app/services/S3.scala)
- [`app/services/AwsEndpoints.scala`](../app/services/AwsEndpoints.scala)
- [`app/services/editions/publishing/events/PublishEventsQueueFacade.scala`](../app/services/editions/publishing/events/PublishEventsQueueFacade.scala)
- [`app/controllers/BaseFaciaController.scala`](../app/controllers/BaseFaciaController.scala)

## HTTP and browser integrations

Public repository visibility was checked against the GitHub API on 28 September
2026. A missing public result means only "not publicly visible at that exact
name"; it does not prove that no private Guardian repository exists.

| Integration | Repository evidence | Proposed E2E treatment |
| --- | --- | --- |
| Content API, live and IAM draft | Backend not publicly visible as `guardian/content-api`; public Guardian client/model repositories exist | WireMock |
| Ophan API | Backend not publicly visible as `guardian/ophan` | WireMock |
| Grid/media API and usage API | Public `guardian/grid` and `guardian/media-service` | WireMock |
| Recipes API | Public `guardian/recipes` | WireMock |
| Mobile notifications API | Public `guardian/mobile-n10n` | WireMock |
| Pan-domain OAuth/login | Public `guardian/pan-domain-authentication` library; hosted login service repository unresolved | Do not run OAuth; provide signed local settings and authentication server-side |
| Editorial permissions | Public `guardian/editorial-permissions-client`; runtime data is an AWS cache | Seed the LocalStack permissions object |
| Pinboard | Public `guardian/pinboard`; loader injected only for permitted users | Omit permission in starter fixtures or WireMock when covered |
| User telemetry | Public `guardian/editorial-tools-user-telemetry-service` | WireMock |
| Sentry | Third-party and disabled by the V2 client in DEV | Disable |
| Preview/frontend, email rendering and Editions Card Builder | Browser navigation targets; `guardian/editions-card-builder` is public, while `guardian/email-rendering` is not publicly visible at that name | Exclude from starter scenarios; mock only when a selected feature needs them |

The server-side HTTP call sites are concentrated in
[`app/controllers/FaciaContentApiProxy.scala`](../app/controllers/FaciaContentApiProxy.scala),
[`app/controllers/GridProxy.scala`](../app/controllers/GridProxy.scala),
[`app/services/Ophan.scala`](../app/services/Ophan.scala) and
[`app/updates/BreakingNewsUpdate.scala`](../app/updates/BreakingNewsUpdate.scala).
Browser destinations are configured in
[`fronts-client/src/constants/url.ts`](../fronts-client/src/constants/url.ts)
and [`app/controllers/V2App.scala`](../app/controllers/V2App.scala).

The generic HTTP/JSON proxy, image and video CDNs, YouTube embeds and arbitrary
user-entered snap URLs are feature-dependent edges. They are not baseline stack
dependencies and must be added to WireMock only when selected coverage uses
them.

**Confirmed real-service decision:** run no Guardian-owned HTTP service from
source. Mock all HTTP dependencies above. This avoids a private checkout and a
GitHub App token in CI while retaining real facia-tool behaviour and real local
datastores.

## Authentication model

Authenticated routes use pan-domain authentication. The app validates the
signed pan-domain cookie against public settings loaded from S3, applies
Guardian user validation, then checks the editorial permissions cache. The
OAuth callback is hosted by the configured pan-domain login service.

For e2e, generate an ephemeral keypair, seed pan-domain settings and matching
permissions, and issue authentication server-side. Native local development
must not require a developer to force a cookie or install browser mocks.
Playwright may use a signed-cookie fixture for isolated headless runs, while the
host-browser path receives equivalent authentication from a server-side local
endpoint or proxy.

Evidence: [`app/controllers/BaseFaciaController.scala`](../app/controllers/BaseFaciaController.scala),
[`app/controllers/PandaAuthController.scala`](../app/controllers/PandaAuthController.scala)
and [`conf/routes`](../conf/routes).

## Environment and execution model

- Dev-container Docker client and daemon verified at version 29.7.2 on ARM64.
- Existing GitHub Actions jobs run on Ubuntu hosted runners and already use a
  Postgres service container, confirming Docker availability in CI.
- Per the project setup request, the app runs natively in development and is
  containerised only in CI. This intentionally adapts the reference playbook's
  all-modes container model.
- Browser requirements are still provided server-side. Development must not
  depend on forced cookies or Playwright/browser network mocks.

## Confirmed delivery scope

Each numbered phase is a separate branch, commit and pull request. A later phase
may be stacked on its unmerged predecessor, with the dependency and merge order
stated in the PR body.

- [ ] Phase 0 - this discovery plan
- [ ] Phase 1 - Playwright/Cucumber BDD scaffold only
- [ ] Phase 2 - Testcontainers stack and native-development/CI execution modes
- [ ] Phase 3 - deterministic fixtures and WireMock mappings
- [ ] Phase 4 - starter feature tests only
- [ ] Phase 5 - `e2e-tests/README.md`
- [ ] Phase 6 - GitHub Actions workflow and failure artifacts
- [ ] Phase 7 - later coverage increments, one reviewed PR per feature

Build-speed measures belong in Phase 2: one shared WireMock image, one LocalStack
container, minimal CI app-image context, bind-mounted source, persistent sbt
caches and concurrent startup where dependencies permit.

## Confirmed starter feature scope

- **Landing page:** `/v2`, the main React Fronts client. `/` remains the
  legacy priorities page and can be covered later unless it is the intended
  product entry point.
- **Feature slice:** open a seeded editorial front and verify its
  seeded collection and card. Do not include Content API search in this phase.
  This exercises auth, Play, the V2 bundle, S3 front state and DynamoDB user
  state without attempting broad product coverage.

## Confirmed Phase 0 decisions

1. Use Yarn for the `e2e-tests/` workspace.
2. Mock all Guardian-owned HTTP services; run none from source.
3. Deliver Phases 0-6, with a separate pull request for each phase.
4. Use `/v2` as the landing page.
5. Validate the starter setup by opening a seeded editorial front and checking
   its collection and card, without a Content API search scenario.

Phase 0 delivery consists only of this plan. Later phases must preserve these
decisions unless a reviewed plan update records why the implementation differs.