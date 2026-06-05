# Plan: Investigate & fix flakey karma tests in `public/test`

Three distinct intermittent failures appear across the CI logs. All three are timing/race-condition failures rather than logic bugs — the tests rely on hard‑coded timeouts and event ordering that occasionally lose a race under CI load. The plan instruments the tests to confirm root cause, then replaces timing-based synchronization with deterministic waits.

**The three failures**
1. `Latest widget > searches articles` (failure-1, failure-3) — `Cannot read properties of undefined (reading '$component')` at [latest.articles.spec.js](public/test/spec/latest.articles.spec.js#L28). `getAutocomplete` does `ko.contextFor(host.container.querySelector('autocomplete').firstChild).$component`. The test resolves on the first `widget:load` event, but `widget:load` is emitted by *every* `BaseWidget` after 20ms ([base-widget.js](public/src/js/widgets/base-widget.js#L9)), so the `<autocomplete>` element's `firstChild` may not be rendered yet → `contextFor` returns `undefined`.
2. `Config Front > create fronts and collections` (failure-1) — `Timeout waiting for condition` from `wait.condition` (5000ms default) at [wait.js](public/test/utils/wait.js#L33). A long multi-step test whose CAPI backfill `waiting.check` predicate occasionally exceeds the budget.
3. `Breaking News > Alerts the user before launch` (failure-2) — `edit action timeout, endpoint /edits` from the 2000ms hard timeout in [base-action.js](public/test/utils/actions/base-action.js#L13).

**Hypotheses (to confirm in Phase 2)**
- **H1 (failure 1):** `getAutocomplete` resolves on the *first* `widget:load` event, but that event is emitted by every `BaseWidget` 20ms after construction ([base-widget.js](public/src/js/widgets/base-widget.js#L9)). When a non-autocomplete widget wins the race, `querySelector('autocomplete').firstChild` is still null/un-rendered, so `ko.contextFor(...)` returns `undefined` and reading `.$component` throws. Expected to confirm by tracing which widget emits the resolving event vs. the autocomplete DOM state at that moment.
- **H2 (failure 2):** A CAPI backfill step's `waiting.check` predicate occasionally takes longer than `wait.condition`'s 5000ms budget because the mocked `fetchContent` (50ms delay) plus `searchDebounceMs` (50ms) stack across the many sequential steps under CI load. Expected to confirm by logging elapsed time and the unmet predicate at timeout.
- **H3 (failure 3):** The `/edits` POST either (a) is never triggered by the paste→edit chain within 2000ms, or (b) is triggered but its `onAfterComplete` resolution (an inner 20ms `setTimeout`) is cleared/lost during teardown — so `waitForRequest` rejects. Expected to confirm by tracing whether the mockjax interceptor fired and whether `lastRequest` was captured before the timeout.

**Steps**

*Phase 1 — Reproduce & instrument (parallelizable)*
1. Establish a local repro loop: run the karma suite repeatedly (e.g. `grunt karma:static` in a loop, or temporarily set `singleRun` and re-run N times) to get an empirical flake rate per test before any change.
2. Add temporary tracing (behind a debug flag, removed before final):
   - In [base-widget.js](public/src/js/widgets/base-widget.js#L9) / `getAutocomplete`, log which widget emits `widget:load` and the DOM state of `<autocomplete>` at that moment (confirms the race for failure 1).
   - In [base-action.js](public/test/utils/actions/base-action.js#L13), on timeout log whether the mockjax interceptor was ever hit and the last request seen (distinguishes "request never sent" vs "response callback never fired" for failure 3).
   - In [wait.js](public/test/utils/wait.js#L26) `condition`, on timeout log elapsed time and final predicate inputs (pinpoints which `check` stalls for failure 2).

*Phase 2 — Diagnose* (*depends on Phase 1*)
3. Using the traces from Phase 1, confirm or refute each of H1, H2, and H3 above, and record the precise failing synchronization point for each.

*Phase 3 — Targeted fixes* (*depends on Phase 2*)
4. **Failure 1**: Make `getAutocomplete` wait for the specific autocomplete widget rather than the first `widget:load`. Either filter the `widget:load` event by the emitting widget/element, or poll with `wait.condition` until `querySelector('autocomplete').firstChild` exists and has a ko context before reading `$component`.
5. **Failure 3**: Replace/raise the fixed 2000ms in [base-action.js](public/test/utils/actions/base-action.js#L13) with a deterministic wait and ensure the paste→edit chain actually triggers the request before `execute()` awaits it; verify the `onAfterComplete` 20ms inner `setTimeout` isn't being cleared by teardown.
6. **Failure 2**: Tighten the `create fronts and collections` flow so each backfill/CAPI step awaits a real signal instead of a debounce-length race; if a genuine timeout budget is needed, scale `wait.condition`'s default and the 50ms mock delays consistently.

*Phase 4 — Verify & clean up* (*depends on Phase 3*)
7. Remove temporary tracing (or gate it behind a permanent debug switch if broadly useful).
8. Re-run the repro loop to confirm the flake rate drops to zero for each test.

**Relevant files**
- [public/test/utils/wait.js](public/test/utils/wait.js) — `event()` (2000ms), `condition()` (5000ms) timeouts; central to failures 1 & 2.
- [public/test/utils/actions/base-action.js](public/test/utils/actions/base-action.js) — 2000ms request timeout; failure 3.
- [public/test/utils/actions/edit-actions.js](public/test/utils/actions/edit-actions.js) — `/edits` mock + `TIMEOUT_ERROR_MSG`.
- [public/test/utils/actions.js](public/test/utils/actions.js) — `schedule`/`execute` action chain.
- [public/src/js/widgets/base-widget.js](public/src/js/widgets/base-widget.js) — emits `widget:load` after 20ms (source of the race).
- [public/test/spec/latest.articles.spec.js](public/test/spec/latest.articles.spec.js#L28) — `getAutocomplete` + `widget:load` wait.
- [public/test/spec/config.front.spec.js](public/test/spec/config.front.spec.js#L88) — `create fronts and collections`.
- [public/test/spec/breaking-news.spec.js](public/test/spec/breaking-news.spec.js#L22) — `Alerts the user before launch`.
- [grunt-configs/karma.js](grunt-configs/karma.js), [public/test/conf/karma.conf.js](public/test/conf/karma.conf.js) — runner config.

**Verification**
1. Run `grunt validate` (or `grunt karma:static`) in a loop of ~20–50 iterations and confirm 0 failures for the three tests.
2. For each fix, force the race (e.g. artificially delay the autocomplete render / mock response) and confirm the test now waits deterministically instead of throwing/timing out.
3. Confirm no new slow-test warnings (the runner reports `reportSlowerThan: 3000`).

**Further considerations**
1. Scope: fix only these three tests, or also audit other specs using the same `wait.event`/`base-action` timeout patterns for the same fragility? Recommendation: **fix the three, then harden the shared `wait.js`/`base-action.js` utilities** since the root cause is shared (Option A: three tests only / Option B: three tests + shared utility hardening ← recommended / Option C: full suite audit).
2. Tracing longevity: remove instrumentation after diagnosis, or keep a permanent opt-in debug flag in the test utilities? Recommendation: keep a lightweight gated flag in `wait.js`/`base-action.js`, remove ad-hoc logs.
3. Should the test runner enforce randomized spec order (Jasmine `random: true`) to surface ordering-dependent flakes earlier? Recommendation: optional follow-up, not part of this fix.
