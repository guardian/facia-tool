# Plan: Investigate & fix flakey karma tests in `public/test`

Five distinct intermittent failure signatures appear across the 47 CI logs. Most are timing/race-condition failures rather than logic bugs — the tests rely on hard‑coded timeouts and event ordering that occasionally lose a race under CI load. Two low-frequency signatures (D, E below) are assertion mismatches caused by async state propagation, not hard timeouts. The plan instruments the tests to confirm root cause, then replaces timing-based synchronization with deterministic waits.

**Empirical distribution across the 47 logs** (47 total):

| Sig | Error | Test | Spec | Count |
|---|---|---|---|---|
| A | `Timeout waiting for condition` (wait.condition, 5000ms) | `create fronts and collections` | [config.front.spec.js](public/test/spec/config.front.spec.js#L88) | 24 |
| B | `edit action timeout, endpoint /edits` (base-action.js, 2000ms) | `Allows the same alert to be sent multiple times` (11) + `Alerts the user before launch` (6) | [breaking-news.spec.js](public/test/spec/breaking-news.spec.js) | 17 |
| C | `Cannot read properties of undefined (reading '$component')` | `searches articles` | [latest.articles.spec.js](public/test/spec/latest.articles.spec.js#L28) | 4 |
| D | `Expected 'Open Source' to be 'Nothing happened for once'` | `copy to clipboard` | [collections.spec.js](public/test/spec/collections.spec.js#L324) | 1 |
| E | `Expected 1 to be close to 0.6` | `marks an article visited from clipboard as visited…` | [visited.articles.spec.js](public/test/spec/visited.articles.spec.js#L31) | 1 |

**The five failure signatures**
1. **(Sig C)** `Latest widget > searches articles` — `Cannot read properties of undefined (reading '$component')` at [latest.articles.spec.js](public/test/spec/latest.articles.spec.js#L28). `getAutocomplete` does `ko.contextFor(host.container.querySelector('autocomplete').firstChild).$component`. The test resolves on the first `widget:load` event, but `widget:load` is emitted by *every* `BaseWidget` after 20ms ([base-widget.js](public/src/js/widgets/base-widget.js#L9)), so the `<autocomplete>` element's `firstChild` may not be rendered yet → `contextFor` returns `undefined`. The trace logs confirm this: lines like `widget:load emitted by <non-autocomplete widget> … DOM autocomplete: null` show other widgets winning the race.
2. **(Sig A)** `Config Front > create fronts and collections` — `Timeout waiting for condition` from `wait.condition` (5000ms default) at [wait.js](public/test/utils/wait.js#L33). A long multi-step test whose CAPI backfill `waiting.check` predicate occasionally exceeds the budget. Trace confirms a *tight* overshoot, not a stuck predicate: `condition timeout - elapsed: 5039, timeout: 5000, predicate result: false`.
3. **(Sig B)** `Breaking News > Alerts the user before launch` **and** `Breaking News > Allows the same alert to be sent multiple times` — `edit action timeout, endpoint /edits` from the 2000ms hard timeout in [base-action.js](public/test/utils/actions/base-action.js#L13). Both tests live in [breaking-news.spec.js](public/test/spec/breaking-news.spec.js) and share the same `/edits` request-timeout race; "Allows the same alert…" (11) actually flakes more often than "Alerts the user before launch" (6).
4. **(Sig D)** `Collections > copy to clipboard` ([collections.spec.js](public/test/spec/collections.spec.js#L324)) — `Expected 'Open Source' to be 'Nothing happened for once'`. Copies `latest().trail(5)` to the clipboard then asserts the clipboard's first trail headline. The wrong article lands in the clipboard, i.e. the latest list is not fully/stably populated when `trail(5)` is resolved, or clipboard state leaks across tests. **This is an assertion flake, not a hard timeout.**
5. **(Sig E)** `Visited articles > marks an article visited from clipboard as visited in visited articles list` ([visited.articles.spec.js](public/test/spec/visited.articles.spec.js#L31), assertion at line 52) — `Expected 1 to be close to 0.6`. Copies `latest().trail(1)`, opens the link in the clipboard, then expects the matching trail in the latest list to be dimmed (`opacity ≈ 0.6`) but it is still `1`. The "visited" state hasn't propagated back to the latest list when the assertion runs. **Also an assertion flake driven by async state propagation, not a hard timeout.**

**Hypotheses (to confirm in Phase 2)**
- **H1 (Sig C — searches articles):** `getAutocomplete` resolves on the *first* `widget:load` event, but that event is emitted by every `BaseWidget` 20ms after construction ([base-widget.js](public/src/js/widgets/base-widget.js#L9)). When a non-autocomplete widget wins the race, `querySelector('autocomplete').firstChild` is still null/un-rendered, so `ko.contextFor(...)` returns `undefined` and reading `.$component` throws. **Confirmed by the trace logs** (`widget:load emitted by <non-autocomplete widget> … DOM autocomplete: null`).
- **H2 (Sig A — create fronts and collections):** A CAPI backfill step's `waiting.check` predicate occasionally takes longer than `wait.condition`'s 5000ms budget because the mocked `fetchContent` (50ms delay) plus `searchDebounceMs` (50ms) stack across the many sequential steps under CI load. **Confirmed by the trace** (`condition timeout - elapsed: 5039, timeout: 5000, predicate result: false`) — a ~40ms overshoot, i.e. a budget race rather than a stuck predicate.
- **H3 (Sig B — both breaking-news tests):** The `/edits` POST either (a) is never triggered by the paste→edit chain within 2000ms, or (b) is triggered but its `onAfterComplete` resolution (an inner 20ms `setTimeout`) is cleared/lost during teardown — so `waitForRequest` rejects. The same race affects both `Alerts the user before launch` and `Allows the same alert to be sent multiple times`. Expected to confirm by tracing whether the mockjax interceptor fired and whether `lastRequest` was captured before the timeout.
- **H4 (Sig D — copy to clipboard):** `latest().trail(5)` is resolved before the latest list has stably rendered all 5 trails (or clipboard state leaks from a prior spec), so a different article (`'Open Source'`) is copied instead of the expected `'Nothing happened for once'`. Expected to confirm by tracing the latest list contents/length at copy time and whether the clipboard was non-empty at test start.
- **H5 (Sig E — visited articles):** After `openLink()` on the clipboard trail, the "visited" flag propagates to the matching trail in the latest list asynchronously (gated by `CONST.detectPendingChangesInClipboard`, set to 300ms in the test). The opacity assertion (`≈ 0.6`) runs before that propagation completes, so the latest trail is still at full opacity (`1`). Expected to confirm by tracing the visited-state propagation timing vs. the assertion point.

**Steps**

*Phase 1 — Reproduce & instrument (parallelizable)*
1. Establish a local repro loop: run the karma suite repeatedly (e.g. `grunt karma:static` in a loop, or temporarily set `singleRun` and re-run N times) to get an empirical flake rate per test before any change.
2. Add temporary tracing (behind a debug flag, removed before final):
   - In [base-widget.js](public/src/js/widgets/base-widget.js#L9) / `getAutocomplete`, log which widget emits `widget:load` and the DOM state of `<autocomplete>` at that moment (confirms the race for failure 1).
   - In [base-action.js](public/test/utils/actions/base-action.js#L13), on timeout log whether the mockjax interceptor was ever hit and the last request seen (distinguishes "request never sent" vs "response callback never fired" for Sig B).
   - In [wait.js](public/test/utils/wait.js#L26) `condition`, on timeout log elapsed time and final predicate inputs (pinpoints which `check` stalls for Sig A). *(Already added — trace present in logs.)*
   - In [collections.spec.js](public/test/spec/collections.spec.js#L324) `copy to clipboard`, log the latest list trail count/contents at copy time and the clipboard state at test start (confirms Sig D race vs. state leak).
   - In [visited.articles.spec.js](public/test/spec/visited.articles.spec.js#L31), log the visited-state propagation timing relative to the opacity assertion (confirms Sig E timing).

*Phase 2 — Diagnose* (*depends on Phase 1*)
3. Using the traces from Phase 1, confirm or refute each of H1–H5 above, and record the precise failing synchronization point for each. (H1 and H2 are already confirmed by the existing traces.)

*Phase 3 — Targeted fixes* (*depends on Phase 2*)
4. **Sig C (searches articles)**: Make `getAutocomplete` wait for the specific autocomplete widget rather than the first `widget:load`. Either filter the `widget:load` event by the emitting widget/element, or poll with `wait.condition` until `querySelector('autocomplete').firstChild` exists and has a ko context before reading `$component`.
5. **Sig B (both breaking-news tests)**: Replace/raise the fixed 2000ms in [base-action.js](public/test/utils/actions/base-action.js#L13) with a deterministic wait and ensure the paste→edit chain actually triggers the request before `execute()` awaits it; verify the `onAfterComplete` 20ms inner `setTimeout` isn't being cleared by teardown. This single fix should resolve both `Alerts the user before launch` and `Allows the same alert to be sent multiple times`.
6. **Sig A (create fronts and collections)**: Tighten the flow so each backfill/CAPI step awaits a real signal instead of a debounce-length race; if a genuine timeout budget is needed, scale `wait.condition`'s default and the 50ms mock delays consistently.
7. **Sig D (copy to clipboard)**: Ensure the latest list is fully populated before resolving `trail(5)` (await a deterministic "latest loaded" signal), and assert/clear clipboard isolation in `beforeEach`/`afterEach` so state can't leak between specs.
8. **Sig E (visited articles)**: Await the visited-state propagation deterministically (a real signal that the latest list trail has been re-flagged) rather than reading opacity immediately after `openLink()`; if `CONST.detectPendingChangesInClipboard` gates it, wait on that completion explicitly before asserting.

*Phase 4 — Verify & clean up* (*depends on Phase 3*)
9. Remove temporary tracing (or gate it behind a permanent debug switch if broadly useful).
10. Re-run the repro loop to confirm the flake rate drops to zero for each test.

**Relevant files**
- [public/test/utils/wait.js](public/test/utils/wait.js) — `event()` (2000ms), `condition()` (5000ms) timeouts; central to Sigs A & C.
- [public/test/utils/actions/base-action.js](public/test/utils/actions/base-action.js) — 2000ms request timeout; Sig B.
- [public/test/utils/actions/edit-actions.js](public/test/utils/actions/edit-actions.js) — `/edits` mock + `TIMEOUT_ERROR_MSG`.
- [public/test/utils/actions.js](public/test/utils/actions.js) — `schedule`/`execute` action chain.
- [public/src/js/widgets/base-widget.js](public/src/js/widgets/base-widget.js) — emits `widget:load` after 20ms (source of the race).
- [public/test/spec/latest.articles.spec.js](public/test/spec/latest.articles.spec.js#L28) — `getAutocomplete` + `widget:load` wait.
- [public/test/spec/config.front.spec.js](public/test/spec/config.front.spec.js#L88) — `create fronts and collections` (Sig A).
- [public/test/spec/breaking-news.spec.js](public/test/spec/breaking-news.spec.js#L241) — `Allows the same alert to be sent multiple times` & `Alerts the user before launch` (Sig B).
- [public/test/spec/collections.spec.js](public/test/spec/collections.spec.js#L324) — `copy to clipboard` (Sig D).
- [public/test/spec/visited.articles.spec.js](public/test/spec/visited.articles.spec.js#L31) — `marks an article visited from clipboard as visited…` (Sig E).
- [grunt-configs/karma.js](grunt-configs/karma.js), [public/test/conf/karma.conf.js](public/test/conf/karma.conf.js) — runner config.

**Verification**
1. Run `grunt validate` (or `grunt karma:static`) in a loop of ~20–50 iterations and confirm 0 failures across all five signatures (A–E).
2. For each fix, force the race (e.g. artificially delay the autocomplete render / mock response / latest-list population) and confirm the test now waits deterministically instead of throwing/timing out/mis-asserting.
3. Confirm no new slow-test warnings (the runner reports `reportSlowerThan: 3000`).

**Further considerations**
1. Scope: fix only these five tests, or also audit other specs using the same `wait.event`/`base-action` timeout patterns for the same fragility? Recommendation: **fix the five, then harden the shared `wait.js`/`base-action.js` utilities** since the root cause is shared for A–C (Option A: five tests only / Option B: five tests + shared utility hardening ← recommended / Option C: full suite audit).
2. Tracing longevity: remove instrumentation after diagnosis, or keep a permanent opt-in debug flag in the test utilities? Recommendation: keep a lightweight gated flag in `wait.js`/`base-action.js`, remove ad-hoc logs.
3. Should the test runner enforce randomized spec order (Jasmine `random: true`) to surface ordering-dependent flakes earlier? Recommendation: optional follow-up, not part of this fix — but note Sigs D & E look ordering/state-leak sensitive, so randomization may help surface them.
