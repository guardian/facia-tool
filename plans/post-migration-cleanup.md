# facia-tool: post-migration cleanup plan

Handoff plan for the follow-up work identified by the post-migration review of
the completed CloudFormation → GuCDK migration (see
[cloudformation-to-cdk-migration.md](cloudformation-to-cdk-migration.md) for the
migration itself).

Task numbers are deliberately non-contiguous (1, 2, 4, 5, 6, 7, 8) — they match
the numbering of the original review so the two documents can be read together.
Item 3 was considered and dropped.

## Status

Tasks 1, 2, 4a, 4b, 6a and 7 are merged. Task 8 and task 5 are open.

| Task | PR | State |
| --- | --- | --- |
| 1 — dead `Stage` parameter | [#2113](https://github.com/guardian/facia-tool/pull/2113) | Merged |
| 2 — `kms:Decrypt` | [#2114](https://github.com/guardian/facia-tool/pull/2114) | Merged |
| 4a — policy refactor | [#2115](https://github.com/guardian/facia-tool/pull/2115) | Merged |
| 4b — policy narrowing | [#2116](https://github.com/guardian/facia-tool/pull/2116) | Merged |
| 5 — SSM path (step 2) | [#2132](https://github.com/guardian/facia-tool/pull/2132) | Draft. **Blocked on step 1** — needs the parameters creating |
| 5 — SSM path (steps 4–6) | — | Not started; must follow #2132 being deployed to both stages |
| 6a — network parameters | [#2117](https://github.com/guardian/facia-tool/pull/2117) | Merged (needed a manual `update-stack` first — see below) |
| 6b–6d — other parameters | — | **Blocked**: need SSM parameters creating, and the 6a caveat applies |
| 7 — CloudFront L2 | [#2118](https://github.com/guardian/facia-tool/pull/2118) | Merged. `FaciaCloudfront` only; see revised task 7 |
| 8 — static bucket OAC | [#2121](https://github.com/guardian/facia-tool/pull/2121) | Open — deletes the distribution; see revised task 8 |

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
```

> **In practice.** 4a was stacked directly on 2 rather than run in parallel, so
> the `kms:Decrypt` statement could be shared rather than duplicated — sharing a
> statement the two policies spell differently isn't possible. 7 was done before 5
> and 6b–6d only because those are blocked on write credentials, not for any
> ordering reason.

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

**Step 1 — not done.** Needs write credentials. The commands to run are below;
they never print or persist the value. `put-parameter` defaults to no-overwrite,
so a second run is a safe no-op rather than a clobber.

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
`PrivateSubnets`, and `AMIFaciatool` (which is fine — Riff-Raff resolves it from
`amiParametersToTags`).

**Do this in waves, one PR each.** Changing a parameter's type or removing it
alters how Riff-Raff supplies the value, so each wave needs its own change set
and its own deploy.

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

### 6b — cross-account IDs

The six `*AccountID` parameters are consumed only by `FrontsUpdateSNSPolicy`
(subscribe permissions) and `StorageConsumerRole`'s trust policy.

Convert them to `AWS::SSM::Parameter::Value<String>` with defaults pointing at
SSM paths, creating those parameters first *(write creds — ask the user)*. **Do
not** move the values into `bin/cdk.ts` — they are account IDs and must not be
committed.

Note the type change: a parameter changing from `String` to
`AWS::SSM::Parameter::Value<String>` keeps its logical ID but changes how the
value arrives. Confirm with a change set that the resolved policy documents are
unchanged.

### 6c — environment infrastructure

`CloudFrontCertificateArn`, `DBSecurityGroupIdNewVPC`, `CapiPreviewRole` → SSM,
same approach as 6b. `StaticBucketName` is a plain bucket name and carries
nothing sensitive, so a per-stage prop in `bin/cdk.ts` is fine and preferable —
it makes the value reviewable.

### 6d — the hardcoded account ID

`FrontendRoleToAssume` has a **default containing an AWS account ID**, committed
in [cdk/lib/facia-tool.ts](../cdk/lib/facia-tool.ts). It arrived with the legacy
template so it was out of scope for the migration, but it should not stay. Move
it to SSM and delete the literal. Note it will remain in git history — flag that
to the user rather than attempting a history rewrite.

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

**This needs a human decision and is not safe to do unilaterally**, so it has
been left alone. Deleting a distribution and a DNS record is irreversible enough
to want a second opinion, even when the evidence says it is dead.

**Risk.** Low to do, but only after someone confirms the service really is
unused.

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
