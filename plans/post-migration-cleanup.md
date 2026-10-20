# facia-tool: post-migration cleanup plan

Handoff plan for the follow-up work identified by the post-migration review of
the completed CloudFormation → GuCDK migration (see
[cloudformation-to-cdk-migration.md](cloudformation-to-cdk-migration.md) for the
migration itself).

Task numbers are deliberately non-contiguous (1, 2, 4, 5, 6, 7, 8) — they match
the numbering of the original review so the two documents can be read together.
Item 3 was considered and dropped. Task 9 was added later, during review of
task 6.

## Status

Tasks 1, 2, 4a, 4b, 6a, 7 and 8 are merged, as is step 2 of task 5. The rest of
task 5, the rest of task 6, and task 9 are open.

| Task | PR | State |
| --- | --- | --- |
| 1 — dead `Stage` parameter | [#2113](https://github.com/guardian/facia-tool/pull/2113) | Merged |
| 2 — `kms:Decrypt` | [#2114](https://github.com/guardian/facia-tool/pull/2114) | Merged |
| 4a — policy refactor | [#2115](https://github.com/guardian/facia-tool/pull/2115) | Merged |
| 4b — policy narrowing | [#2116](https://github.com/guardian/facia-tool/pull/2116) | Merged |
| 5 — SSM path (step 2) | [#2132](https://github.com/guardian/facia-tool/pull/2132) | Merged |
| 5 — SSM path (steps 4–6) | — | Not started; must follow #2132 being deployed to both stages |
| 6a — network parameters | [#2117](https://github.com/guardian/facia-tool/pull/2117) | Merged (needed a manual `update-stack` first — see below) |
| 6b, 6f — account IDs | [#2134](https://github.com/guardian/facia-tool/pull/2134) | Draft. Seven parameters removed via `@guardian/aws-account-setup`; CI green |
| 6c — `CapiPreviewRole` | — | **Closed, no change.** A documented operator knob; see 6c |
| 6c — `DBSecurityGroupIdNewVPC` | — | Deferred to task 9 |
| 6d, 6e — `StaticBucketName`, `AMIFaciatool` | — | No action needed; see below |
| 6g — CloudFront certificate (part 1) | [#2133](https://github.com/guardian/facia-tool/pull/2133) | Draft. Creates the certificate; **blocked on [riffraff-platform#827](https://github.com/guardian/riffraff-platform/pull/827)** |
| 6g — CloudFront certificate (part 2) | — | Not started; must follow #2133 being deployed and `ISSUED` |
| 7 — CloudFront L2 | [#2118](https://github.com/guardian/facia-tool/pull/2118) | Merged. `FaciaCloudfront` only; see revised task 7 |
| 8 — static bucket OAC | [#2121](https://github.com/guardian/facia-tool/pull/2121) | Merged — deleted the distribution rather than adding OAC; see revised task 8 |
| 9 — absorb `facia-editions.yml` | — | Not started. Added after review; subsumes the `DBSecurityGroupIdNewVPC` half of 6c |

Three findings change the plan as written; each is folded into the relevant
task below.

1. **Riff-Raff cannot deploy a parameter whose type changes.** Its
   `combineParameters` marks *every* parameter already on the stack as
   `UseExistingValue`, and a template default does not override that. Any task 6
   wave needs a one-off manual `update-stack` per stage before Riff-Raff can take
   over. This affects 6a, 6b and 6c, and was not anticipated in the plan.
2. **`StaticCloudfront` has been returning 403 and nothing uses it.** Task 8 is
   not "add OAC", it is "propose deleting this".
3. **The developer policy's `kms:Decrypt` was dead, not load-bearing**, because
   local development never reads the password from Parameter Store.

### Verification technique used throughout

A throwaway resolver (`/tmp/resolve.js`) that resolves CloudFormation intrinsics
in both the live template (`aws cloudformation get-template`) and the synthesized
one, flattens every IAM policy document to one line per
(principal, effect, action, resource, condition), and set-compares them. It was
validated first by confirming the **unmodified** synth matched both live stacks
exactly, so a reported difference means a real difference. Worth rebuilding for
any future IAM change here; `cdk diff` alone is not sufficient.

## Starting state

The migration is complete. `cdk/` is the sole source of truth
(`CDK -> cfn.json`, no `CfnInclude`, no `cloudformation/` directory). Everything
below is **cleanup of parity debt** deliberately carried over from the legacy
template — none of it is required for the service to work, and none of it should
change behaviour except where explicitly stated.

Relevant files:

- [cdk/lib/facia-tool.ts](../cdk/lib/facia-tool.ts) — the whole stack.
- [cdk/bin/cdk.ts](../cdk/bin/cdk.ts) — per-stage values.
- [app/conf/Configuration.scala](../app/conf/Configuration.scala) — the only app
  code touched (task 5).
- [riff-raff.yaml](../riff-raff.yaml) — untouched by this plan.

## Ground rules

Read these before starting. They are not optional; several tasks can cause an
outage if done casually.

1. **Node.** The repo root pins node 16 via both `.nvmrc` and `.tool-versions`,
   which shadows your shell. Prefix every CDK command with
   `mise exec node@24 --`, e.g. `mise exec node@24 -- npm ci`. Run from `cdk/`.
2. **After every change**, in `cdk/`: `npm run lint`, `npm test`,
   `npm run synth`. Snapshot churn is expected — review the snapshot diff, don't
   blind-update it.
3. **`cdk diff` against both live stacks before opening any PR**:
   `mise exec node@24 -- npm run diff -- --profile <profile> FaciaTool-euwest-1-CODE`
   and the same for `-PROD`. The read-only `cmsFronts` profile was used during
   the migration; refresh it if the token has expired.
4. **`cdk diff` cannot be trusted on IAM or stateful resources.** With a
   read-only profile it degrades to a template-only diff and reports spurious
   `requires replacement` for properties whose *resolved* value is unchanged. For
   any task touching IAM, the DynamoDB table, the SNS topics or the CloudFront
   distributions, get a real change set from someone with
   `cloudformation:CreateChangeSet`:
   ```shell
   mise exec node@24 -- npx cdk deploy --no-execute FaciaTool-euwest-1-CODE
   aws cloudformation describe-change-set --stack-name facia-CODE \
     --change-set-name cdk-deploy-change-set \
     --query "Changes[].ResourceChange.[LogicalResourceId,Action,Replacement]" --output table
   ```
   `Replacement: Conditional` is normal (the property derives from a `Ref`/
   `GetAtt`); check the parent resource is `False`. **Any `Remove` action, or any
   `Replacement: True`, means stop and rethink.**
5. **One PR per task.** Draft first, repo PR template, `maintenance` label.
   Deploy CODE, verify, soak, then PROD. Never deploy both in one go.
6. **Never commit AWS account IDs** to code, commit messages or PR
   descriptions. Task 6 specifically involves removing one that is already
   there — take the value from SSM at deploy time, don't move it to another file.
7. **Update** [cloudformation-to-cdk-migration.md](cloudformation-to-cdk-migration.md)
   and this file as you go, including decisions *not* to act.
8. Creating/changing SSM parameters and S3 bucket policies needs write
   credentials. Where a task requires that, **ask the user to run it** — don't
   assume you can.

## Suggested order

Risk ascending. Tasks 1, 2 and 4 are independent of each other. 5 is easier
after 2. 6 is independent but large — split it. 7 should precede 8.

```
1 (dead parameter)  ─┐
2 (kms:Decrypt)     ─┼─ independent, any order
4a (policy refactor)─┘
        ↓
4b (policy narrowing)   ← after 4a
        ↓
5 (SSM path)            ← after 2 (same policy)
        ↓
6a..6d (parameters)     ← independent, but do one wave per PR
        ↓
7 (CloudFront L2)
        ↓
8 (static bucket OAC)
        ↓
9 (absorb facia-editions.yml)   ← last; subsumes part of 6c
```

> **In practice.** 4a was stacked directly on 2 rather than run in parallel, so
> the `kms:Decrypt` statement could be shared rather than duplicated — sharing a
> statement the two policies spell differently isn't possible. 7 was done before 5
> and 6b–6d only because those are blocked on write credentials, not for any
> ordering reason.

> **Task 6 reshaped after review.** Of the eight parameters left, three need no
> work at all (`StaticBucketName`, `AMIFaciatool`, `CapiPreviewRole`), one is
> deferred to task 9 (`DBSecurityGroupIdNewVPC`), and `CloudFrontCertificateArn`
> turned out to be a "create the certificate in CDK" job rather than a parameter
> job. The account IDs are the only remaining wave, and they turn out not to need
> SSM at all — see 6b. See 6b–6g.

---

## Task 1 — remove the dead `Stage` template parameter

**Goal.** Delete one unreferenced CloudFormation parameter. No behaviour change.

**Why.** The `Stage` parameter was recreated in Phase 5b only so the DynamoDB
table name kept its exact expression. That expression now uses `this.stage`, so
the parameter is referenced by nothing. Verified by scanning the synthesized
templates: of 22 parameters, `Stage` is the only one with zero `Ref` or `${…}`
usages, in both stages.

**Steps.**

1. In [cdk/lib/facia-tool.ts](../cdk/lib/facia-tool.ts), remove the `Stage`
   entry from the `definitions` array in `templateParameters()`.
2. Confirm nothing calls `parameter('Stage')`. (`this.stage`, supplied by
   `GuStack` from `bin/cdk.ts`, is unaffected — it is a TypeScript value, not a
   template parameter.)
3. Re-run the check below on both synthesized templates; it should report 21
   parameters and no unreferenced ones.

```js
// /tmp/dead-params.js — run: mise exec node@24 -- node /tmp/dead-params.js <abs path to template.json>
const t = require(process.argv[2]);
const s = JSON.stringify({ Resources: t.Resources, Outputs: t.Outputs });
const used = new Set();
for (const m of s.matchAll(/"Ref":"([A-Za-z0-9]+)"/g)) used.add(m[1]);
for (const m of s.matchAll(/\$\{([A-Za-z0-9]+)\}/g)) used.add(m[1]);
const dead = Object.keys(t.Parameters).filter((p) => !used.has(p));
console.log('total:', Object.keys(t.Parameters).length);
console.log('unreferenced:', dead.length ? dead.join(', ') : '(none)');
```

**Verify.** `cdk diff` for both stages shows exactly one change: the `Stage`
parameter removed. Confirm the `Stage` *tag* on resources is untouched — it comes
from `GuStack`, not this parameter. Removing an unreferenced parameter is a no-op
at deploy time; Riff-Raff only supplies parameters the template declares.

> **Done — [#2113](https://github.com/guardian/facia-tool/pull/2113).** `cdk diff`
> showed exactly the one parameter removal and no resource changes in either
> stage; the scan now reports 21 parameters and none unreferenced; the `Stage` tag
> is still present.

**Risk.** Negligible. **Rollback.** Revert and redeploy.

---

## Task 2 — narrow `kms:Decrypt` from `*`

**Goal.** Replace `resources: ['*']` on the `kms:Decrypt` statement in
`ParameterStorePolicy` with a scoped grant.

**Why.** The instance role currently grants `kms:Decrypt` on every key in the
account. It exists for exactly one call: `Configuration.postgres.getPassword`
reads the SecureString `/facia-tool/cms-fronts/<stage>/db/password` with
`withDecryption(true)`, which needs decrypt permission on the key that encrypted
it (the AWS-managed `aws/ssm` key).

**Important — do not copy the developer policy's spelling.** `RunFaciaToolLocally`
grants `kms:Decrypt` on
`this.formatArn({ service: 'kms', resource: 'key', resourceName: 'alias/aws/ssm' })`,
which renders as `arn:aws:kms:<region>:<account>:key/alias/aws/ssm`. **That is not
a valid KMS resource ARN** — IAM policy `Resource` elements do not accept alias
ARNs, so that statement most likely matches nothing. Investigate whether local
development actually works through some other grant, and fix it the same way you
fix the instance role.

> **Done — [#2114](https://github.com/guardian/facia-tool/pull/2114).** Took the
> condition option. Resolved: local development works because it never exercises
> the path — `Configuration.postgres.getPassword` only reads Parameter Store when
> `isProd`; in `DEV` it reads `db.default.password` from the local config file. So
> the broken statement was dead, not compensated for elsewhere. Also confirmed the
> `aws/ssm` key policy only allows decrypt under
> `kms:ViaService = ssm.eu-west-1.amazonaws.com` anyway, so the condition removes
> no access that ever worked.

**Two valid narrowings** — pick one and say which in the PR:

- *(preferred, account-portable)* keep `resources: ['*']` but add a condition
  restricting use to SSM:
  ```ts
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['kms:Decrypt'],
    resources: ['*'],
    conditions: { StringEquals: { 'kms:ViaService': `ssm.${this.region}.amazonaws.com` } },
  })
  ```
  This is the idiomatic way to scope access to an AWS-managed key, which has no
  stable ARN you can write down.
- *(explicit)* resolve the real key ARN and use it:
  `aws kms describe-key --key-id alias/aws/ssm --query KeyMetadata.Arn`. Note
  this embeds an account ID, so it must come from a parameter, not a literal —
  which makes it the worse option here.

**Verify.** Change set shows a single `Modify` on the policy, `Replacement:
False`. Then the real test: deploy CODE and **roll the ASG**. The password is
read at startup, so a wrong grant means the instance fails its health check
immediately and visibly. Confirm the target group returns to healthy and
`/_healthcheck` responds through CloudFront before going near PROD.

**Risk.** Medium — a wrong grant prevents instances booting. Mitigated by the
CODE roll. **Rollback.** Revert to `resources: ['*']` and redeploy.

---

## Task 4 — de-duplicate the instance role and the developer policy

`applicationPolicies()` (the `GuEc2App` instance role) and `developerPolicy()`
(the CODE-only `RunFaciaToolLocally` managed policy) grant overlapping access and
are maintained by hand in two places. Split this into two PRs.

### 4a — pure refactor, zero effective change

**Goal.** Derive both policies from one shared list of statement factories, with
no change to the effective permissions of either.

**Steps.**

1. Extract a private method returning the statements both need, parameterised by
   the ARNs they already take (`userDataTableName`, `frontPressedTable`,
   `frontsUpdateTopicArn`, `feastPublicationTopicArn`, `capiPreviewRole`,
   `switchboardBucket`, `lowerCaseStage`).
2. Keep instance-only statements (`ses:SendEmail`, the CloudWatch metrics grant,
   `sts:AssumeRole` on `frontendRoleToAssume`, `rds:DescribeDBInstances`) and
   developer-only statements (`facia-dist` read, the ec2/autoscaling `Describe*`
   block the instance gets from `GuInstanceRole`) where they are.
3. **Preserve the existing wildcards exactly** in this PR — the narrowing is 4b.
   The point of 4a is that the change set proves nothing moved.

**Verify.** This is the task most likely to silently change permissions, so
verify by *resolved effect*, not by reading the diff. Write a throwaway script
that fetches the live templates
(`aws cloudformation get-template --stack-name facia-CODE`), resolves the
intrinsics in both the live and synthesized documents, and compares the resulting
statement sets for the instance role and `RunFaciaToolLocally`. They must match
exactly, in both stages. (The migration used this technique; it is the only
reliable check.) Then confirm the change set has no `Remove` and no
`Replacement: True`.

> **Done — [#2115](https://github.com/guardian/facia-tool/pull/2115).** Stacked on
> #2114 so the `kms:Decrypt` statement could genuinely be shared. The shared
> statements are keyed **by instance-role policy logical ID**, not returned as a
> flat list — the instance's grants live in nine separate `AWS::IAM::Policy`
> resources, and flattening them would have been nine `Remove`s and one `Add`.
> PROD synthesizes byte-identically; in CODE the only resource that moves is
> `RunFaciaToolLocally`, whose two `sns:Publish` statements merge into the single
> one the instance role already used (losing the cosmetic `AllowPublishToMyTopic`
> `Sid`). Resolved permissions identical in both stages.

### 4b — narrow the three wildcards the developer policy already narrows

**Goal.** Tighten the instance role where the developer policy demonstrates a
narrower grant is sufficient.

**The diff.** These are the places the two disagree, with the instance role being
broader:

| Resource | Instance role | Developer policy |
| --- | --- | --- |
| `facia-private` | `facia-private/*` | two named keys |
| `pan-domain-auth-settings` | `.../ *` | named settings files + `*.p12` |
| `permissions-cache` | `permissions-cache/*` | `permissions-cache/<stage>/*` |

**Steps.** Narrow each, but derive the correct value from what the *instance*
does, not by copying the developer policy verbatim — they legitimately differ:

- `facia-private`: user data copies
  `s3://facia-private/facia-tool.application.secrets.<STAGE>.conf`. That is the
  only object the instance reads, so grant that key. Check the app doesn't read
  anything else from that bucket at runtime before narrowing.
- `permissions-cache`: scope to `<stage>/*`, matching the developer policy.
- `pan-domain-auth-settings`: the instance needs the settings for *its own*
  domain plus the `.p12`; the developer policy's `local.dev-gutools.co.uk`
  entries are developer-specific. Derive the instance's keys from the
  pan-domain configuration, don't guess.

**Verify.** Change set clean, then deploy CODE and **exercise the affected
paths** — log in (pan-domain), load a front (permissions), and roll an instance
(private config). A too-narrow S3 grant typically shows up as a 500 or a login
loop rather than a boot failure, so this needs real end-to-end testing, not just
a healthy target group. Soak before PROD.

**Risk.** Medium-high — this is the only behaviour-changing task in the plan by
design. Keep it small and separate so a revert is cheap.

> **Done — [#2116](https://github.com/guardian/facia-tool/pull/2116).** Values
> derived, not copied:
>
> - `facia-private` → `facia-tool.application.secrets.<STAGE>.conf`. The running
>   app never touches the bucket; only user data does. Worth knowing the bucket
>   also holds `story-packages.application.secrets.conf` and other applications'
>   secrets, all of which the instance role could previously read.
> - `pan-domain-auth-settings` → `<domain>.settings` only. The three-argument
>   `PanDomainAuthSettingsRefresher.apply` hardcodes `s"$domain.settings"`, and
>   `pandomain.domain` is the **parent** domain — `code.dev-gutools.co.uk` /
>   `gutools.co.uk`, *not* `fronts.…`. Confirmed against both the live secrets
>   files and the bucket itself (`fronts.code.dev-gutools.co.uk.settings` does not
>   exist). Because that value lives in the secrets file rather than the repo, it
>   is now an explicit `authDomain` prop in `bin/cdk.ts` — **if `pandomain.domain`
>   ever changes, `authDomain` must change with it.** Plus `*.p12`: `AuthActions`
>   derives `multifactorChecker` from the settings file rather than defaulting to
>   `None`, and `Google2FAGroupChecker` loads the Google service account key named
>   by `googleServiceAccountCert` from the *same* bucket on every OAuth callback.
>   Since `validateUser` is `PanDomain.guardianValidation`, which requires
>   `multiFactor`, dropping that grant would reject every login. The key's name is
>   only known at runtime, so the grant stays `*.p12` as the developer policy has
>   it. No `.settings.public` — only `PublicSettings` reads that, and the app
>   builds a `PanDomainAuthSettingsRefresher` instead.
> - `permissions-cache` → `<stage>/*`, confirmed by
>   `permissions-cache/{CODE,PROD}/permissions.json` existing. This makes the grant
>   identical to the developer policy's, so it moved into the shared set.
>
> `pandomain.host`, `pandomain.roleArn`, `pandomain.user.groups`,
> `settingsFileKey` and `permissions.cache` are all defined in
> `Configuration.scala` but referenced nowhere — unrelated dead config, noted in
> passing.

---

## Task 5 — consolidate the SSM parameter path

**Goal.** Move the app's one SSM parameter onto the GuCDK convention path and
delete the bespoke `ssm:GetParameter` grant.

**Why.** The app reads `/facia-tool/cms-fronts/<stage>/db/password` (legacy
path), while `GuEc2App`'s `GuParameterStoreReadPolicy` already grants the
convention path `/<stage>/<stack>/<app>/*`. Both are currently granted — a
transitional state from the migration, not a design.

**First, verify the convention path.** Don't assume the ordering: read the
`GuParameterStoreReadPolicy` resource ARN out of
`cdk/cdk.out/FaciaTool-euwest-1-PROD.template.json` and use whatever it actually
says.

> **Verified**: the convention path is `/<stage>/<stack>/<app>/*`, i.e.
> `arn:aws:ssm:eu-west-1:<account>:parameter/PROD/cms-fronts/facia-tool/*`. The
> legacy path the app uses is `/facia-tool/cms-fronts/<stage>/db/password`, and
> both parameters are `SecureString` encrypted with `alias/aws/ssm`. Step 1 needs
> write credentials, so the task is otherwise untouched.

**Steps — order matters.**

1. *(write creds — ask the user)* Create the SecureString parameter at the
   convention path in **both** stages, with the same value as the existing one.
   Copy it; do not retype it, and do not print it.
2. Change the path in
   [app/conf/Configuration.scala](../app/conf/Configuration.scala)
   `postgres.getPassword`. No IAM change is needed for this step — the grant for
   the new path already exists, which is what makes this safely reversible.
3. Deploy the app to CODE. The password is read at startup, so success is
   visible immediately. Soak, then PROD.
4. Only once both stages are running on the new path: remove the
   `ssm:GetParameter` statement from `ParameterStorePolicy` in
   [cdk/lib/facia-tool.ts](../cdk/lib/facia-tool.ts). **Keep the `kms:Decrypt`
   statement** (as narrowed in task 2) — the parameter is still a SecureString,
   and `GuParameterStoreReadPolicy` does not grant decryption. If the KMS
   statement is all that remains, rename the policy to reflect that.
5. Make the same path change in `RunFaciaToolLocally`.
6. *(write creds — ask the user)* Delete the old parameters, after a soak.

**Verify.** After step 3, confirm instances boot and the app can reach Postgres
in both stages. After step 4, roll an instance again — removing a grant the app
still needs would otherwise lie dormant until the next deploy.

**Risk.** Low if the order is respected; high if step 4 happens before step 3 is
deployed everywhere. **Rollback.** Revert the Scala change (the old parameter and
its grant still exist until step 6).

### Progress

**Step 1 — done.** Both convention-path parameters now exist and their values
match the legacy ones (compared by hash, neither printed):

```
CODE match
PROD match
```

So [#2132](https://github.com/guardian/facia-tool/pull/2132) is no longer
blocked. The commands used to create them are below, kept for reference; they
never print or persist the value. `put-parameter` defaults to no-overwrite, so a
second run is a safe no-op rather than a clobber.

```shell
for STAGE in CODE PROD; do
  aws ssm put-parameter --profile cmsFronts --region eu-west-1 \
    --name "/$STAGE/cms-fronts/facia-tool/db/password" \
    --type SecureString --key-id alias/aws/ssm --no-overwrite \
    --description "Postgres master password for facia-tool ($STAGE)" \
    --value "$(aws ssm get-parameter --profile cmsFronts --region eu-west-1 \
        --name "/facia-tool/cms-fronts/$STAGE/db/password" --with-decryption \
        --query Parameter.Value --output text)" >/dev/null && echo "$STAGE created"
done
```

Then confirm the two values match, again without printing either:

```shell
for STAGE in CODE PROD; do
  get() { aws ssm get-parameter --profile cmsFronts --region eu-west-1 \
    --name "$1" --with-decryption --query Parameter.Value --output text | sha256sum; }
  [ "$(get "/facia-tool/cms-fronts/$STAGE/db/password")" \
    = "$(get "/$STAGE/cms-fronts/facia-tool/db/password")" ] \
    && echo "$STAGE match" || echo "$STAGE MISMATCH"
done
```

The value only ever travels through a command substitution, so it reaches
neither shell history nor disk. It is briefly visible in the process list of the
machine you run it on.

> **Step 2 done — [#2132](https://github.com/guardian/facia-tool/pull/2132)**,
> draft, one line. Confirmed from the synthesized PROD template that the
> convention-path grant (`ParameterStoreReadFaciatool`) and the legacy one
> (`ParameterStorePolicy`) are attached to the *same* instance role, so the new
> path is already readable and the change is a pure revert away from the old
> one. **It must not be deployed until step 1 has run in that stage.**

**Steps 4–6 are a second PR**, and are more than the plan assumed:

- The `ssm:GetParameter` statement lives in `sharedAccess()` since 4a, so it
  feeds **both** the instance role and `RunFaciaToolLocally`. The instance can
  lose it outright (`GuParameterStoreReadPolicy` covers it); the developer policy
  cannot, because that policy is not attached to the instance role. So steps 4
  and 5 are one edit: move the statement out of the shared set into
  `developerPolicy()` and repoint it at the convention path.
- `RunFaciaToolLocally`'s `path` property
  (`/developer-policy/guardian/facia-tool/cms-fronts/<stage>/…`) is an IAM path
  that happens to look similar. **It is unrelated — do not touch it**, it is
  `requires replacement`.
- Two developer-facing things read the legacy parameter and must move in the
  same PR, or developers break at step 6:
  [scripts/setup-ssh-tunnel.sh](../scripts/setup-ssh-tunnel.sh) and the Postgres
  troubleshooting section of [README.md](../README.md).

---

## Task 6 — move invisible configuration out of CloudFormation parameters

**Goal.** Make the stack's real configuration visible in the repo (or in SSM),
instead of surviving only because Riff-Raff carries previous parameter values
over between deploys.

**Why.** 22 template parameters; 14 have no default. For those, nothing in the
repo records the value — a reviewer cannot tell which VPC, which certificate or
which accounts the stack uses, and a fresh deploy into a new account would
prompt for all of them. This was correct during the migration (it is what kept
the values stable) but it is not a design.

The no-default parameters are: `FrontendAccountID`, `MobileAPIAccountID`,
`MobileAPITeamcityAccountID`, `OphanAccountID`, `ContentAPIAccountID`,
`SupportAccountID`, `StaticBucketName`, `CloudFrontCertificateArn`,
`CapiPreviewRole`, `DBSecurityGroupIdNewVPC`, `VpcId`, `PublicSubnets`,
`PrivateSubnets`, and `AMIFaciatool` (which is fine — see 6e).

**Do this in waves, one PR each.** Changing a parameter's type or removing it
alters how Riff-Raff supplies the value, so each wave needs its own change set
and its own deploy.

### Which parameters vary by stage

Measured, not assumed — the two live stacks' parameter values compared pairwise
(values never printed, compared by base64 so whitespace can't confuse the
comparison):

| Same in CODE and PROD | Differs per stage |
| --- | --- |
| all six `*AccountID`, `FrontendRoleToAssume`, `CapiPreviewRole`, `UserDataTablePrefix`, `SwitchboardBucket`, `VpcId`, `PublicSubnets`, `PrivateSubnets`, `AMIFaciatool` | `CloudFrontCertificateArn`, `DBSecurityGroupIdNewVPC` |

> **Correction.** An earlier version of this table listed `CapiPreviewRole` as
> differing per stage. It does not — both stages point at the *same* PROD CAPI
> preview role, which is deliberate (see 6c). The first comparison used `join`
> over tab-separated `--output text`, which mis-aligned fields; redo it with
> `--output json | jq` if you need to repeat it.

**Being stage-invariant today does not mean a shared parameter is correct** —
see 6c, where `CapiPreviewRole` must stay stage-scoped precisely so CODE can be
changed without touching PROD.

(`CapiEndpointSsmKeyNewVPC` is also the same in both stages — both point at
`/newvpc/endpoint/capi/PROD`, i.e. CODE uses the PROD CAPI endpoint. Same
convention as `CapiPreviewRole`, and for the same reason.)

### Naming conventions already present in the account

Worth knowing before inventing a path — these exist in cmsFronts today:

| Prefix | Example | Use |
| --- | --- | --- |
| `/organisation/accounts/<name>` | `/organisation/accounts/deployTools` | AWS account IDs — but prefer `@guardian/aws-account-setup`, see 6b |
| `/account/services/<thing>` | `/account/services/logging.stream.name` | account-wide service facts |
| `/account/vpc/primary/…` | `/account/vpc/primary/subnets/private` | networking (already used by 6a) |
| `/<STAGE>/<stack>/<app>/…` | `/PROD/cms-fronts/facia-tool/db/password` | the GuCDK per-app convention (task 5) |


> **Constraint discovered during 6a, applies to every wave.** Riff-Raff's
> `combineParameters`
> ([UpdateCloudFormationTask.scala](https://github.com/guardian/riff-raff/blob/main/magenta-lib/src/main/scala/magenta/tasks/UpdateCloudFormationTask.scala))
> starts from every parameter present on the current stack and still in the
> template, and marks it `UseExistingValue`:
>
> ```scala
> val existingParametersMap: Map[String, ParameterValue] =
>   existingParameters.collect {
>     case ExistingParameter(key, _, _) if allRequiredParamNames.contains(key) =>
>       key -> UseExistingValue
>   }.toMap
> ```
>
> **A template default does not override this.** So converting `VpcId` from
> `AWS::EC2::VPC::Id` to `AWS::SSM::Parameter::Value<…>` makes Riff-Raff reuse the
> literal `vpc-04bc5e48cb7784592`, which CloudFormation then tries to look up as an
> SSM *parameter name*. The deploy fails at change-set creation — safe, but it does
> not go through.
>
> Each wave therefore needs **one manual `update-stack` per stage**, supplying the
> changed parameters explicitly as SSM paths. After that the stored value *is* the
> path and Riff-Raff's `UseExistingValue` is correct from then on — which is why
> `CapiEndpointSsmKeyNewVPC` and `DistributionBucketName` already work this way.
> Needs write credentials. The alternative is to give the parameters new logical
> IDs, at the cost of the GuCDK convention names.

### 6a — network

`VpcId`, `PublicSubnets`, `PrivateSubnets` → GuCDK's SSM-backed VPC lookups
(`GuVpc.fromIdParameter` / the subnet equivalents), which read the account's
standard `/account/vpc/...` parameters.

**Verify before changing anything**: read the current live parameter values and
the account's SSM VPC parameters and confirm they are the same VPC and the same
subnets. If they differ, stop — this stack is not on the account's primary VPC
and the wave doesn't apply. After the change, diff the *resolved* subnet IDs in
the synthesized template against the live stack's.

> **Done — [#2117](https://github.com/guardian/facia-tool/pull/2117).** They match:
> both stages already run in `vpc-04bc5e48cb7784592` on the same six subnets as
> `/account/vpc/primary/...` (same sets, different order, three AZs either way).
> Resolved ALB subnets, ASG `VPCZoneIdentifier`, target group VPC and security
> group VPCs are all unchanged. Note the subnets must be built with
> `GuVpc.subnetsFromParameter(this, { type })` **without** the `app` prop —
> `GuEc2App`'s own defaults would produce `facia-toolPrivateSubnets` and change the
> logical IDs. Incidentally retires the `W9007` false positive. **Read the
> Riff-Raff constraint above before deploying.**

### 6b and 6f — cross-account IDs, via `@guardian/aws-account-setup`

The six `*AccountID` parameters are consumed only by `FrontsUpdateSNSPolicy`
(subscribe permissions) and `StorageConsumerRole`'s trust policy.
`FrontendRoleToAssume` (6f) is a role ARN whose **account ID is committed as a
default** in [cdk/lib/facia-tool.ts](../cdk/lib/facia-tool.ts). Both are the
same problem and should be one PR.

> **Better than SSM: delete the parameters entirely.** The IDs are already
> published as a typed constant in
> [guardian/aws-account-setup](https://github.com/guardian/aws-account-setup/blob/main/packages/shared/src/aws-accounts.ts),
> which [service-catalogue](https://github.com/guardian/service-catalogue/tree/main/packages/cdk)
> consumes. `import { GuardianAwsAccounts } from '@guardian/aws-account-setup'`
> gives `GuardianAwsAccounts.Frontend` and friends, so the value becomes a
> **named, reviewable** thing in code without the ID ever entering this repo.
>
> This is strictly better than the SSM plan: no parameters to create, no write
> credentials, and — because the parameters are *removed* rather than retyped —
> **the Riff-Raff `UseExistingValue` constraint does not apply at all**, so no
> manual `update-stack` is needed. Riff-Raff only supplies parameters the
> template declares (proven by task 1).

**All seven are covered.** Verified by matching the live `facia-CODE` and
`facia-PROD` parameter values against the library, printing only the names:

| Parameter | `GuardianAwsAccounts` key |
| --- | --- |
| `FrontendAccountID` | `Frontend` |
| `MobileAPIAccountID` | `Mobile` |
| `MobileAPITeamcityAccountID` | **`DeployTools`** |
| `OphanAccountID` | `Ophan` |
| `ContentAPIAccountID` | `CAPI` |
| `SupportAccountID` | **`Membership`** |
| `FrontendRoleToAssume` | `Frontend` |

Two of those names are not what the parameter names suggest, which is itself an
argument for the change: `MobileAPITeamcityAccountID` is the **DeployTools**
account (TeamCity was the CI system before Riff-Raff), and `SupportAccountID` is
**Membership**. Keep the parameter *names* if you like, but name the values
correctly.

`FrontendRoleToAssume`'s live value is **identical to the committed default in
both stages**, so nothing has been overridden on the stack and it is safe to
make it a constant: `` `arn:aws:iam::${GuardianAwsAccounts.Frontend}:role/CmsFrontsRole-FaciaToolRole-1U44IWRZDIWAX` ``.
The role *name* is not sensitive; only the account ID is, and that now comes
from the library.

**Three things this needs, none of them obvious.**

1. **CI must authenticate to an internal repo.** `aws-account-setup` is
   `internal`, not public, and is consumed as a git dependency:
   `"@guardian/aws-account-setup": "github:guardian/aws-account-setup#shared@2.2.0"`
   (a git tag; `dist/` is committed at release tags, so no build step is needed
   on install — verified by installing it). Add, before `npm ci`:

   ```yaml
   - uses: guardian/actions-read-private-repos@v1.0.1
     with:
       private-ssh-keys: ${{ secrets.AWS_ACCOUNT_SETUP_DEPLOY_KEY }}
   ```

   **Not a blocker after all** — `AWS_ACCOUNT_SETUP_DEPLOY_KEY` exists at the
   **organisation** level, so no per-repo setup was needed.
2. **The snapshot tests must mock the library, or the IDs get committed anyway**
   — straight into `cdk/lib/__snapshots__/`, defeating the point. The package
   ships a `__mocks__` directory of `000000000000`-style placeholders for exactly
   this, so one line in
   [cdk/jest.setup.js](../cdk/jest.setup.js) is enough:
   `jest.mock('@guardian/aws-account-setup')`. Expect the snapshot diff to show
   placeholders where the `Ref`s used to be.
3. **Check the current snapshots first.** If any real ID is already committed
   there, note that it stays in git history — flag it rather than attempting a
   history rewrite.

**Verify.** The resolved policy documents must be unchanged: the same account IDs,
inline instead of behind a `Ref`. Use the resolve-and-compare technique from the
top of this document, and confirm the change set shows only `Modify` on the IAM
resources and the parameters removed.

> **Done — [#2134](https://github.com/guardian/facia-tool/pull/2134)**, draft,
> covering 6b and 6f together. Seven parameters removed; resolved
> `FrontsUpdateSNSPolicy`, `StorageConsumerRole`, `AssumeFrontendRolePolicy` and
> instance user data are identical to both live stacks.
>
> **Two things made the comparison lie before it told the truth**, worth knowing
> if you repeat it: pseudo-parameters (`AWS::Partition` and friends) have to be
> resolved too, and `Fn::Join` fragments **re-split** when a `Ref` becomes a
> literal. Both show up as spurious differences until each side is flattened to a
> plain string. `StorageConsumerRole` and the user data both reported `DIFFERS`
> for these reasons alone.
>
> The deploy key was **not** a blocker — it is an org-level secret, and CI passed
> first time including the `upload` job.
>
> The real account ID previously committed in
> `cdk/lib/__snapshots__/facia-tool.test.ts.snap` is now gone from the working
> tree, but **remains in git history**. No rewrite attempted.

### 6c — `CapiPreviewRole` and `DBSecurityGroupIdNewVPC`

**Neither is being changed. 6c is closed.** Both turned out to be the wrong
shape for a parameter wave, for different reasons.

#### `CapiPreviewRole` — decided: leave exactly as it is

**It is a deliberate operator knob, not accidental configuration.**
[docs/SwitchingToCodeCAPI.md](../docs/SwitchingToCodeCAPI.md) documents pointing
Fronts CODE at CODE CAPI, and step 3 is: *"In AWS, update the `facia-tool` CODE
CloudFormation stack … changing the `CapiPreviewRole` to match the CODE value of
`content.api.draft.role`"*. So this parameter has no default **on purpose** —
someone is expected to change it by hand on the CODE stack, and Riff-Raff's
`UseExistingValue` is what makes the override stick across deploys. That also
explains why both stages currently hold the same PROD role: by convention Fronts
CODE runs against PROD CAPI.

> **Decision: no change.** The procedure is known, documented and understood as
> it stands. Moving the value to SSM would have meant two stage-scoped
> parameters, a rewritten runbook, and an extra indirection in a manual
> procedure that someone may be following under time pressure during an
> incident. The upside — the value becomes named and reviewable — does not pay
> for that. **This parameter is a deliberate exception to task 6's goal**, which
> is the useful thing to record: it has no default because it is meant to be
> changed, not because it was forgotten.

If this is ever revisited, the constraints are:

- **It must stay stage-scoped** despite the two values being identical today.
  One shared account-scoped parameter would mean switching CODE to CODE CAPI
  also switched PROD.
- **Hardcoding it in `bin/cdk.ts` is not an option**: it is a cross-account ARN
  containing an account ID (ground rule 6), and it would turn a documented
  operational switch into a code change plus a deploy.
- [docs/SwitchingToCodeCAPI.md](../docs/SwitchingToCodeCAPI.md) would have to be
  updated in the same PR.

**Separately — the value exists twice and nothing keeps the copies in sync.**
The IAM grant (`AssumeCapiPreviewRolePolicy`) uses the CloudFormation parameter,
but the app assumes `config.contentApi.previewRole`
([app/services/Capi.scala](../app/services/Capi.scala), via
`content.api.draft.role` in the S3 secrets file). The documented switch requires
editing *both*, and if they disagree the symptom is a runtime `AccessDenied`
rather than a failed deploy. That is a real sharp edge in the current procedure
and worth raising on its own; it is not a reason to do the SSM change, because
SSM would not remove the duplication either.

#### `DBSecurityGroupIdNewVPC` — deferred to task 9

It is
`DBSecurityGroupNewVPC` in
[facia-editions.yml](https://github.com/guardian/editorial-tools-platform/blob/main/cloudformation/cmsFronts-account/facia-tool/facia-editions.yml),
which today exports nothing for it (its `Outputs` are the editions roles, topic
and KMS alias). The obvious fix was to publish it from there as an
`AWS::SSM::Parameter`, mirroring `CapiEndpointServiceSecurityGroupParameterNewVPC`
in that repo's `shared/private-capi-endpoint.yml`.

> **Tried and rejected —
> [editorial-tools-platform#1130](https://github.com/guardian/editorial-tools-platform/pull/1130),
> closed unmerged.** The parameter would only exist to carry a value between two
> stacks that should not be separate in the first place. Task 9 brings
> `facia-editions.yml` into this CDK project, after which the security group is
> an ordinary construct reference and neither the SSM parameter nor the
> CloudFormation parameter is needed. Adding the parameter first would mean
> creating a cross-stack contract and then immediately deleting it — and SSM
> parameters are easy to create and awkward to retire once something might read
> them.
>
> So `DBSecurityGroupIdNewVPC` **stays as it is** until task 9. Verified while
> investigating, and still true: `DBSecurityGroupNewVPC` in `facia-db-CODE` /
> `facia-db-PROD` matches the `DBSecurityGroupIdNewVPC` parameter on
> `facia-CODE` / `facia-PROD` in both stages, and the deployed templates for both
> `facia-db-*` stacks are identical to `facia-editions.yml` on `main` (bar a
> trailing newline) — so there is no drift for task 9 to untangle.

### 6d — `StaticBucketName` — nothing to do

Superseded by task 8: [#2121](https://github.com/guardian/facia-tool/pull/2121)
deleted `StaticCloudfront`, which was the only consumer, and the parameter with
it. Nothing left to do.

### 6e — `AMIFaciatool` — nothing to do

It is already the standard name. `GuAmiParameter` builds its id as
`"AMI" + AppIdentity.toAlphanumericTitleCase({ app })`, which for `facia-tool`
is `AMI` + `Faciatool` = **`AMIFaciatool`** — confirmed in
`cdk.out/FaciaTool-euwest-1-PROD.template.json` and matching
`amiParametersToTags` in [riff-raff.yaml](../riff-raff.yaml). The parameter isn't
declared in `templateParameters()` at all; `GuEc2App` creates it. The name only
*looks* non-standard because GuCDK title-cases without preserving the hyphen.

### 6f — the hardcoded account ID

`FrontendRoleToAssume` had a **default containing an AWS account ID**, committed
in [cdk/lib/facia-tool.ts](../cdk/lib/facia-tool.ts). It arrived with the legacy
template so it was out of scope for the migration. **Folded into 6b** — same
mechanism, same PR: the parameter is removed and the ARN is built from
`GuardianAwsAccounts.Frontend`. The live value was identical to the committed
default in both stages, so nothing had been overridden on the stack. The ID
remains in git history.

### 6g — `CloudFrontCertificateArn` → create the certificate in CDK

**This is no longer a parameter wave; it is its own piece of work.** The
reviewer's question — why is the CloudFront certificate an external dependency
when the ALB's is not? — has no good answer. The only real obstacle is region.

**What's there now.** Both CloudFront certificates are in the **cmsFronts account
itself** (us-east-1), so ownership is not the issue; they are simply unmanaged.
PROD's was issued **2018-01-26**, is `AMAZON_ISSUED`, DNS-validated, renewal
`ELIGIBLE`, and covers **two** names: `fronts.gutools.co.uk` *and*
`fronts-static.gutools.co.uk`. The second SAN only exists for `StaticCloudfront`,
which task 8 has now deleted — so a replacement only needs the one name.

**The one real constraint.** CloudFront viewer certificates must live in
us-east-1; this stack is eu-west-1. `GuCertificate` creates the certificate in
the stack's own region, which is why `certificateProps` works for the ALB and
cannot work here.

**Validation is not a blocker.** The 2018 us-east-1 certificate and the 2026
eu-west-1 `GuCertificate` for `fronts.gutools.co.uk` carry the *identical*
validation CNAME (`_cc09…­.fronts.gutools.co.uk` →
`_4162….acm-validations.aws.`). ACM reuses one validation token per
(domain, account) across regions, and that record is already in NS1 — which is
why the Phase 2 `GuCertificate` issued with no manual DNS step, and why a new
us-east-1 certificate for the same name would too.

**Options, in preference order.**

1. **A second stack in us-east-1 in the same CDK app**, holding just the
   certificate, with the ARN handed to the eu-west-1 stack through an eu-west-1
   SSM parameter set once by hand. **Chosen** — see below.
2. **The same, but consumed via `crossRegionReferences: true`.** Canonical CDK
   and fully automatic, but it pulls in a Lambda-backed cross-region parameter
   reader custom resource in both stacks. Rejected: not worth the complexity for
   a value that changes roughly never.
3. **Status quo as a plain SSM parameter** (the original 6c treatment). Makes the
   value discoverable but leaves the certificate unmanaged.

Note the ARN itself **cannot** go in `bin/cdk.ts` under ground rule 6 — it embeds
the account ID — so "just hardcode it" is not an option.

**Shape of option 1**, which is exactly what
[presence-indicator](https://github.com/guardian/presence-indicator/blob/main/cdk/lib/presence-indicator.ts)
does:

- A second, tiny stack class in [cdk/lib/facia-tool.ts](../cdk/lib/facia-tool.ts)
  (`FaciaToolCertificate`) whose only resource is a `GuCertificate` for
  `props.domainName`. Give it its own `app` (presence-indicator uses
  `presence-indicator-cloudfront`) so the certificate is tagged distinctly.
- Instantiated per stage in [cdk/bin/cdk.ts](../cdk/bin/cdk.ts) with
  `env: { region: 'us-east-1' }`, reusing the existing `domainName` prop.
- **Deployed by Riff-Raff as a separate project.** A `cloud-formation`
  deployment can only target the regions of the config file it lives in, and
  [riff-raff.yaml](../riff-raff.yaml) is `regions: [eu-west-1]`. So
  presence-indicator adds a second config file
  ([certificates-riff-raff.yaml](https://github.com/guardian/presence-indicator/blob/main/certificates-riff-raff.yaml))
  containing nothing but a `cloud-formation` deployment and `regions:
  [us-east-1]`, and a second `guardian/actions-riff-raff` step in CI uploading it
  under its own `projectName` (`editorial-tools:presence certificates`), with its
  own `contentDirectories` entry for the two us-east-1 templates.

  ```yaml
  # certificates-riff-raff.yaml
  stacks: [cms-fronts]
  deployments:
    facia-tool-certificates:
      type: cloud-formation
      parameters:
        templateStagePaths:
          CODE: FaciaToolCertificate-useast-1-CODE.template.json
          PROD: FaciaToolCertificate-useast-1-PROD.template.json
  regions: [us-east-1]
  ```

  Being a separate *project* is the point: it is deployed independently of the
  service, so the certificate can be issued and confirmed long before anything
  repoints at it, and routine facia-tool deploys never touch us-east-1. Note
  presence-indicator leaves `cloudFormationStackName` and
  `prependStackToCloudFormationStackName` at their defaults here, unlike the main
  deployment — this is a new stack, so there is no existing name to preserve.

  In [.github/workflows/improvedci.yml](../.github/workflows/improvedci.yml)
  that means a second `guardian/actions-riff-raff@v4` step alongside the existing
  one. The current step identifies the project with the `app:` input rather than
  `projectName:`; the new step needs its own, and a new Riff-Raff project means
  someone with Riff-Raff admin has to grant it deploy permissions before the
  first run.
- The existing `CloudFrontCertificateArn` template parameter stays, but becomes
  `GuStringParameter(this, 'CloudFrontCertificateArn', { fromSSM: true, default:
  '<ssm path>' })` — same logical ID, now `AWS::SSM::Parameter::Value<String>`.
  presence-indicator's path is `/INFRA/<domainName>/cloudFrontCertificateArn`;
  the convention path is used here instead, so the parameter is
  `/<stage>/cms-fronts/facia-tool/cloudfront/certificate-arn` — matching the
  commands in the `FaciaToolCertificate` doc comment.
- Someone with write credentials sets that eu-west-1 SSM parameter to the new
  ARN once, per stage. **This is the only manual link** — the two stacks are
  otherwise both CI-built and Riff-Raff-deployed.

**Known cost of option 1.** The ARN is copied into SSM by a human: nothing stops
the parameter drifting from the certificate, and nothing redeploys the eu-west-1
stack when the certificate changes. Given ACM renews in place and the ARN is
stable for the life of the certificate, that is an acceptable trade.

**The type change hits the 6a constraint.** `CloudFrontCertificateArn` is
currently a plain `String` holding a literal ARN, so Riff-Raff will send
`UseExistingValue` and CloudFormation will try to resolve that ARN as an SSM
parameter *name*. A one-off manual `update-stack` per stage is needed first, as
in 6a.

**Task 8 had to land first**, and has: otherwise the new certificate would have
needed the `fronts-static.*` SAN too, for a distribution that was about to be
deleted.

**Verify.** Swapping a distribution's viewer certificate is a `Modify`, not a
replacement, but it must not happen before the new certificate reports `ISSUED`.
Because the us-east-1 stack is a separate Riff-Raff project, this ordering is
natural: deploy it, confirm `ISSUED`, set the SSM parameter, *then* ship the
facia-tool change. Leave the 2018 certificate in place (`GuCertificate` applies
`RemovalPolicy.RETAIN` anyway); delete it only after a long soak.

> **Part one done — [#2133](https://github.com/guardian/facia-tool/pull/2133)**,
> draft. Creates the certificate; nothing consumes it yet. Four corrections to
> the shape sketched above, found while building it:
>
> - **The certificate stack is its own file**,
>   [cdk/lib/facia-tool-certificate.ts](../cdk/lib/facia-tool-certificate.ts),
>   rather than sharing `facia-tool.ts` as presence-indicator does — that file is
>   already ~900 lines.
> - **A new Riff-Raff project has to be authorised in
>   [riffraff-platform](https://github.com/guardian/riffraff-platform)**, which
>   holds a per-repo allow-list of project names
>   (`guardian@164318/facia-tool@40353770: ['cms-fronts::facia-tool']`). Until
>   `cms-fronts::facia-tool-certificates` is added there the CI upload is
>   rejected — [riffraff-platform#827](https://github.com/guardian/riffraff-platform/pull/827),
>   which must merge and take effect **first**. The plan said "someone with
>   Riff-Raff admin has to grant deploy permissions"; it is a PR, not a request.
> - **`cloudFormationStackByTags` defaults to `true`**, which is *lookup* by
>   Stack/App/Stage tags, not a naming scheme: Riff-Raff finds a stack carrying
>   those tags and updates it, and only if none matches does it create one, named
>   from the tag values joined with `-` in Stack/Stage/App order
>   (`getNewStackName` in
>   [UpdateCloudFormationTask.scala](https://github.com/guardian/riff-raff/blob/main/magenta-lib/src/main/scala/magenta/tasks/UpdateCloudFormationTask.scala)).
>   `cloudFormationStackName` is read **only** on the by-name branch, so setting
>   both is dead config. The note above about presence-indicator leaving the name
>   parameters at their defaults was therefore misleading. The default is kept
>   here, so the stacks are `cms-fronts-<stage>-facia-tool-certificates` — unlike
>   `facia-<stage>`, which only has that shape because it predates the convention.
> - **The validation records were confirmed live in DNS**, not just inferred from
>   the two certificates sharing a CNAME: both `_cc09….fronts.gutools.co.uk` and
>   `_34ef….fronts.code.dev-gutools.co.uk` resolve to `…acm-validations.aws.`. So
>   neither deploy will hang waiting for validation.
>
> `bin/cdk.ts` repeats the Riff-Raff-derived stack name in
> `cloudFormationStackName`. Riff-Raff, not CDK, decides the real name at deploy
> time, so that prop is only there to keep `cdk diff` pointed at the right stack.
> The SSM hand-off commands are in the doc comment on `FaciaToolCertificate`.
>
> **Part two is not started**: create the SSM parameters, then convert
> `CloudFrontCertificateArn` to `fromSSM` and repoint the distribution.

**Verify (all waves).** For each, the only acceptable `cdk diff` is one where
every *resolved* value is identical and only the mechanism changed. Deploy CODE,
confirm the stack updates cleanly and the app still works, soak, then PROD.

**Risk.** Medium. A parameter that resolves to the wrong value can silently
mis-configure the stack (wrong subnets, wrong trust policy) without failing the
deploy. Resolve-and-compare, don't eyeball.

---

## Task 7 — convert the CloudFront distributions to the L2 construct

**Goal.** Replace the two `CfnDistribution` L1 constructs with `Distribution`,
using cache policies instead of the deprecated `ForwardedValues`.

**Why.** `ForwardedValues` is deprecated and cannot be expressed by the L2
construct, which is why the migration kept the L1. It also obscures what the
distribution does: `{ headers: ['*'], cookies: { forward: 'all' }, queryString:
true }` is the legacy spelling of **cache nothing** — `FaciaCloudfront` is a
pass-through, not a cache. The L2 makes that explicit.

**The mapping.**

| Legacy (L1) | L2 equivalent |
| --- | --- |
| `forwardedValues: { headers: ['*'], cookies: all, queryString: true }` | `cachePolicy: CachePolicy.CACHING_DISABLED` + `originRequestPolicy: OriginRequestPolicy.ALL_VIEWER` |
| `forwardedValues: { queryString: false }` (static) | `cachePolicy: CachePolicy.CACHING_OPTIMIZED` — **confirm** this matches the current TTLs before adopting it |
| `viewerProtocolPolicy: 'redirect-to-https'` | `ViewerProtocolPolicy.REDIRECT_TO_HTTPS` |
| `customOriginConfig: { originProtocolPolicy: 'https-only' }` | `HttpOrigin(dns, { protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY })` |

**Two things that will cause an outage if you get them wrong.**

1. **The logical IDs must not change.** `Distribution` will generate new ones.
   Call `this.overrideLogicalId(distribution, { logicalId: 'FaciaCloudfront', … })`
   (and `StaticCloudfront`). If the logical ID changes, CloudFormation creates a
   *new* distribution with a *new* domain name and deletes the old one — the
   `GuCname` records would point at a dead distribution.
2. **The `Host` header must still reach the origin.** The ALB certificate and
   pan-domain auth both depend on the origin receiving
   `Host: fronts[.code.dev-]gutools.co.uk`. `ALL_VIEWER` forwards it;
   `ALL_VIEWER_EXCEPT_HOST_HEADER` does not. Use `ALL_VIEWER`, and prove it after
   deploying by checking the app still authenticates rather than just returning
   200 on `/_healthcheck`.

**Steps.**

1. Convert `StaticCloudfront` first if you want a lower-risk rehearsal — but note
   task 8 also touches it, so decide the order deliberately.
2. Convert `FaciaCloudfront`.
3. Keep origin IDs and `TargetOriginId` stable, keep `defaultRootObject`,
   `priceClass`, `httpVersion`, `ipv6Enabled` and the viewer certificate as they
   are.
4. While here: `defaultRootObject: 'v2'` on a dynamic app distribution looks
   wrong. Don't change it in this PR — check whether anything depends on it and
   raise it separately.

> **Partly done — [#2118](https://github.com/guardian/facia-tool/pull/2118).**
> `FaciaCloudfront` converted; 51 resources before and after, none added or
> removed, only that one changed, and the `GuCname` still resolves to it.
>
> **`StaticCloudfront` deliberately left as an L1.** Two reasons: the managed
> `CACHING_OPTIMIZED` policy does *not* match the current TTLs (live is `MinTTL 0`,
> the managed policy is `MinTTL 1`), so adopting it would be a behaviour change;
> and the closest L2 origin, `S3BucketOrigin.withBucketDefaults()`, uses
> `bucketRegionalDomainName` where the live origin is the global
> `….s3.amazonaws.com`. Both are changes task 8 would make anyway — except task 8
> turned out to be something else entirely. See below.
>
> **`OriginSSLProtocols` needed pinning.** The L1 omitted it and fell back to the
> CloudFormation default; the live distributions report `["SSLv3", "TLSv1"]`, while
> `HttpOrigin` defaults to `TLS_V1_2`. Pinned to the live values to keep the PR a
> representation change. **Tightening to TLSv1.2 is a worthwhile follow-up** and is
> now a one-line change.
>
> **`defaultRootObject: 'v2'` is load-bearing, not a mistake.** `conf/routes` has
> both `GET /` (`ViewsController.priorities()`) and `GET /v2` (`V2App.index`); the
> default root object is what makes `/` serve the v2 app rather than the legacy
> priorities view. Leave it.

**Verify.** Change set must show `Modify` / `Replacement: False` on both
distributions and **no `Remove`**. Fetch the live distribution config before and
after (`aws cloudfront get-distribution-config`) and diff the resolved JSON; the
only differences should be `ForwardedValues` being replaced by the policy IDs.
After deploying CODE, test login and a core flow end-to-end, not just the health
check. Distribution updates take several minutes to propagate.

**Risk.** High. This is the task most capable of taking the service down.
**Rollback.** Revert and redeploy; propagation is minutes, not instant.

---

## Task 8 — ~~put the static assets bucket behind Origin Access Control~~ delete the static distribution

**The premise of this task was wrong.** It assumed `StaticCloudfront` works and
that its bucket is world-readable. Neither is true.

**What was found.**

- `cms-fronts-static-assets` is **in the cmsFronts account** (so ownership is not
  a blocker), in `eu-west-1`.
- It has **full public access block enabled** — all four flags `true` — and **no
  bucket policy at all**.
- The origin is `s3OriginConfig` with an empty `originAccessIdentity`, i.e.
  anonymous fetches. With public access blocked and no policy, those cannot
  succeed.
- Confirmed end to end: both distributions return **HTTP 403**.

  ```
  https://fronts-static.gutools.co.uk/           HTTP 403
  https://fronts-static.code.dev-gutools.co.uk/  HTTP 403
  ```

- Nothing depends on it. Assets are served by the application itself —
  `conf/routes` has `GET /assets/fronts-client-v2/*file` and `GET /assets/*file`.
  The only reference to `fronts-static` left in the repo is a legacy analytics
  heuristic in `public/src/js/utils/analytics.js` that merely *detects* whether a
  script came from that host.
- The bucket's objects under `<STAGE>/static-facia-tool/` were last written
  between 2016 and 2023.

**So the work is removal, not OAC.** Adding OAC to a distribution nobody uses
would be pure cost.

**Suggested shape**, for whoever picks this up:

1. Confirm the 403s are long-standing rather than recent. CloudFront access
   logging is disabled on both distributions, so this probably means asking
   around rather than querying anything.
2. Delete `StaticCloudfront`, `StaticCloudFrontDnsRecord`, the
   `staticDomainName` prop and the `StaticBucketName` parameter.
3. Decide separately what happens to the bucket and its contents. **Do not**
   delete it in the same change — it is stateful and outside this stack's
   lifecycle.
4. Note for task 6g: the us-east-1 certificate carries `fronts-static.*` as a
   second SAN purely for this distribution. Once it's gone, a CDK-managed
   replacement certificate only needs the one name.

**This needs a human decision and is not safe to do unilaterally.** Deleting a
distribution and a DNS record is irreversible enough to want a second opinion,
even when the evidence says it is dead.

> **Done — [#2121](https://github.com/guardian/facia-tool/pull/2121)**, merged
> after that second opinion was obtained. Step 3 (the bucket and its contents) is
> still outstanding and deliberately separate.

**Risk.** Low to do, but only after someone confirms the service really is
unused.

---

## Task 9 — bring `facia-editions.yml` into this CDK project

**Goal.** Move the last hand-written CloudFormation that belongs to facia-tool —
[`cloudformation/cmsFronts-account/facia-tool/facia-editions.yml`](https://github.com/guardian/editorial-tools-platform/blob/main/cloudformation/cmsFronts-account/facia-tool/facia-editions.yml)
in editorial-tools-platform — into `cdk/`, so the database and the editions
resources are defined alongside the service that uses them.

**Why.** It is facia-tool's database, in facia-tool's account, consumed only by
facia-tool, but it lives in another repo, is deployed by hand, and hands values
to this stack through untracked CloudFormation parameters. 6c started as "publish
the security group id to SSM from there"
([editorial-tools-platform#1130](https://github.com/guardian/editorial-tools-platform/pull/1130),
closed unmerged) before it became clear that the parameter would exist only to
paper over a split that shouldn't exist. Doing this makes
`DBSecurityGroupIdNewVPC` disappear rather than change mechanism.

**This is the largest task in the plan and the only one that touches a
production database.** It is listed last deliberately.

### What is in there

340 lines, one `Stage` parameter, deployed as `facia-db-CODE` / `facia-db-PROD`:

- **Database** — `DBSecurityGroupNewVPC`, `DBSubnetGroupNewVPC`,
  `PostgresInstanceNewVPC` (Postgres 14.17, `DeletionProtection: true`, all three
  `DeletionPolicy: Retain`).
- **Buckets** — `PreviewEditionsBucket`, `PublishedEditionsBucket`. The IAM in
  this stack already grants `s3:PutObject` on the same two buckets that
  `EditionsBucketsPolicy` names here.
- **Editions fan-out** — `PublishedEditionUpdateTopic`, its queue, SQS policy,
  KMS key and alias, subscription, `PublishedEditionUpdateRole` and policy,
  `EditionsBuilderRole` and policy, `S3ListenerEventsRule`.
- **Four `Outputs`** (`EditionsBuilderRole`, `PublishedEditionUpdateRole`,
  `PublishedEditionUpdateTopic`, `KmsKeySqsQueueFromSnsAlias`) — none has an
  `Export`, so nothing imports them via CloudFormation. **Other accounts may well
  reference the ARNs directly**; check before assuming they are decorative.

### The structural decision, which needs making first

1. **Two stacks, both defined in this CDK app.** `facia-db-<stage>` keeps its
   identity and its resources; it just gets authored in TypeScript. Passing the
   security group construct from one stack to the other makes CDK generate the
   `Export`/`Fn::ImportValue` pair automatically, so no SSM parameter and no
   CloudFormation parameter are needed. **Much the lower-risk option** — no
   resource moves between stacks, so nothing can be replaced or deleted. The cost
   is a CloudFormation export, which cannot be changed while it is imported.
2. **One stack.** Genuinely eliminates the coupling, but every resource has to be
   moved between stacks via CloudFormation resource import (`DeletionPolicy:
   Retain` on the originals, delete the old stack without deleting the resources,
   import into the new one). That is a multi-step, hard-to-rehearse operation
   against a production RDS instance and two buckets.

**Start from option 1.** Option 2 is only worth it if the export coupling later
proves to be a real obstacle.

### Known obstacles

- **`DBMasterPassword` is `NoEcho` with no default.** It cannot move into the
  repo and must not be printed. It has to stay a `CfnParameter` with
  `noEcho: true`, carried by Riff-Raff's `UseExistingValue` — the same mechanism
  the rest of task 6 is trying to get away from, and an acceptable exception.
  Confirm the live value is also in Parameter Store (task 5's parameter) before
  touching anything.
- **It is not deployed by CI.** `facia-editions.yml` has no entry in
  editorial-tools-platform's [`ci.yml`](https://github.com/guardian/editorial-tools-platform/blob/main/.github/workflows/ci.yml),
  so it is deployed by hand today. Moving it here means it starts being deployed
  by Riff-Raff on every merge — a behaviour change in its own right, and the
  reason to get the logical IDs exactly right.
- **Every logical ID must be preserved**, including the awkward `NewVPC`
  suffixes and the typo'd `EdtionsArchiverLambdaArn` parameter. Same discipline as
  the original migration: `overrideLogicalId` everywhere, and the synthesized
  template compared against `aws cloudformation get-template` before deploying.
- **Deletion protection cuts both ways.** `DeletionProtection: true` and
  `DeletionPolicy: Retain` mean a mistake is unlikely to destroy the database —
  but they also mean a botched change set may be impossible to roll back cleanly.

### Verified starting state

Checked while investigating 6c, and worth re-checking before starting:

- The deployed templates for `facia-db-CODE` and `facia-db-PROD` are **identical
  to the file on `main`** bar a trailing newline — no drift to reconcile.
- `DBSecurityGroupNewVPC` matches the `DBSecurityGroupIdNewVPC` parameter on
  `facia-CODE` / `facia-PROD` in both stages.

**Steps.** Roughly: agree the structure; port the template to TypeScript with
every logical ID overridden; prove the synthesized template is byte-equivalent in
meaning to the live one; add the Riff-Raff deployment; deploy CODE and compare
resources; soak; PROD. Only then wire the security group through as a construct
reference and delete `DBSecurityGroupIdNewVPC`. Finally, delete the template from
editorial-tools-platform — **last**, and in a separate PR, so the rollback is
always "redeploy the YAML".

**Risk.** High, and concentrated in the database. **Rollback.** Keep the YAML in
editorial-tools-platform until the very end.

---

## Deliberately not in this plan

Recorded so they aren't rediscovered as new:

- **Instance egress is 443-only** (GuCDK default) versus the legacy allow-all.
  Nothing has broken; remember it when adding an outbound dependency.
- **cfn-lint `W9007`** ("duplicate Subnets") on the ALB is a false positive — the
  three `Fn::Select` indices are distinct.
- **`maximumInstances: 6` in PROD with no scaling policy** — the ASG never
  scales, so the maximum is decorative. Either add target tracking or set max to
  min; needs a product/capacity decision first.
- **`instanceMetricGranularity: '5Minute'`** delays the new alarms by up to five
  minutes. `1Minute` is cheap.
- **No CloudFront access logging or WAF** on either distribution.
- **`editorial-tools-jammy-java11`** is an ageing AMI recipe (Ubuntu 22.04,
  Java 11). A bump needs app testing and must not ride along with anything here.
- **`StorageConsumerRole` trusts two accounts that have not used it in 90 days.**
  Naming the accounts properly in 6b made the trust policy legible for the first
  time. The role grants read/write on `facia-tool-store/<stage>/*`, so a stale
  trust is real standing access, not a tidiness issue.

  **Measured**, rather than assumed — every `AssumeRole` event for both roles in
  CloudTrail's 90-day window (2026-07-18 → 2026-10-16), 387,829 events,
  attributed to the *calling* account:

  | Account | CODE | PROD |
  | --- | --- | --- |
  | Frontend | 16,275 | 44,706 |
  | Mobile | 10,093 | 289,600 |
  | Ophan | 1,126 | 21,701 |
  | CAPI | **0** | 4,328 |
  | **DeployTools** | **0** | **0** |
  | **Membership** | **0** | **0** |

  So `DeployTools` (which arrived as `MobileAPITeamcityAccountID`, *"used for
  CI"* — TeamCity predates Riff-Raff) and `Membership` (formerly
  `SupportAccountID`) are the removal candidates. Nothing outside the trust
  policy appears at all.

  **`CAPI` is the cautionary case: it is idle in CODE but busy in PROD.** A
  CODE-only sample would have made it look as dead as the other two. Don't
  generalise from one stage.

  **Still get agreement before removing access.** 90 days is CloudTrail's event
  history limit, so this cannot distinguish "unused" from "used annually" — if
  there is an org trail in S3, Athena over a longer window would settle it. Ask
  the owning teams too.

  How to reproduce: look up by `ResourceName` using the **full role ARN**.
  The role *name* silently returns zero events, which looks exactly like "nobody
  uses this".

  ```shell
  aws cloudtrail lookup-events --profile cmsFronts --region eu-west-1 \
    --lookup-attributes AttributeKey=ResourceName,AttributeValue="$ROLE_ARN"
  ```
