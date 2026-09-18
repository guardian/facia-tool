# facia-tool: CloudFormation → GuCDK migration plan

Living plan following the `cloudformation-to-gucdk-migration` skill. Update as
reality diverges.

## Fixed identifiers (reuse exactly)

- App: `facia-tool`
- Stack: `cms-fronts`
- Region: `eu-west-1`
- Stages: `CODE`, `PROD`
- Live CFN stack names: `facia-CODE`, `facia-PROD` (Riff-Raff base name `facia`,
  stage appended at deploy time; `prependStackToCloudFormationStackName: false`)
- Service domains (CloudFront aliases):
  - PROD: `fronts.gutools.co.uk` (+ static `fronts-static.gutools.co.uk`)
  - CODE: `fronts.code.dev-gutools.co.uk` (+ static `fronts-static.code.dev-gutools.co.uk`)

## Front door (decided now, matters at Phase 3)

Service is fronted by a **CloudFront distribution** (`FaciaCloudfront`) whose
origin is the **classic ELB** `FaciaLoadBalancerNewVPC` (via `DNSName`).
DNS records (`DnsRecord`, `StaticCloudFrontDnsRecord`) are
`Guardian::DNS::RecordSet` CNAMEs → the CloudFront domain names.

=> **Phase 3 cutover = repoint the CloudFront origin from the old ELB to the new
ALB.** Leave CloudFront + its DNS as-is. Migrating CloudFront into GuCDK is a
Phase 5 follow-up, never part of the cutover.

## Compute inventory (the legacy resources to migrate)

- LB: `FaciaLoadBalancerNewVPC` — classic ELB, 80/443 → instance 9000, HTTPS
  cert `CertificateArn`, health check `HTTP:9000/_healthcheck`.
- ASG: `FaciaAutoscalingGroupNewVPC` — HealthCheckType ELB, grace 200,
  PROD min/max/desired 3/6/3 (t4g.medium), CODE 1/2/1 (t4g.small).
  **Already tagged `gu:riffraff:new-asg = 1`** (leftover — remove in Phase 2).
- LaunchConfig: `FaciaLaunchConfigNewVPC` — AMI param, cfn-init downloads
  `facia-tool_1.0_all.deb` from `facia-dist`, secrets from `facia-private`,
  `MetadataOptions HttpTokens: required`. App port 9000.
- SGs: `AppServerSecurityGroupNewVPC` (ingress 9000 from LB SG),
  `LoadBalancerSecurityGroupNewVPC` (80/443 from world). Plus DB
  ingress/egress 5432 to `DBSecurityGroupIdNewVPC`, and app SG uses
  `CapiEndpointSsmKeyNewVPC` (CAPI endpoint SG).
- IAM: `DistributionRole` + `DistributionInstanceProfile` and many inline/managed
  policies (getparameters+kms, root sqs/s3/dynamo/ses/describe/s3-put,
  publishTopic, StorageBucket, PanDomainPolicy, PermissionsPolicy,
  CrossAccountPolicy, LogServerPolicy (Kinesis ELK), SwitchesPolicy,
  CloudwatchPolicy, DynamoPressStatus, AssumeCapiPreviewRolePolicy,
  RunFaciaToolLocally [CODE-only, `Condition: IsCode`]).

## Non-compute resources (stay in wrapped template — mixed stack)

CloudFront `FaciaCloudfront` + `StaticCloudfront`, `DnsRecord` +
`StaticCloudFrontDnsRecord`, `FrontsUserDataDynamoTable` (DynamoDB),
`FrontsUpdateSNSTopic` + `FeastPublicationTopic` + `FrontsUpdateSNSPolicy`,
`StorageConsumerRole` (cross-account), `StorageBucket` policy, Outputs
(SNS exports). Realistic end-state stays `CDK(cfn.yaml) -> cfn.json`.

## Cross-repo ownership (audit result)

- The **full-template CFN deploy lives in the platform repo**
  `guardian/editorial-tools-platform` (`.github/workflows/ci.yml`,
  `projectName: Editorial Tools::Fronts::Cloudformation`, app `facia-tool`,
  stack `cms-fronts`, template `cloudformation/cmsFronts-account/facia-tool/facia.yml`).
- The **service repo** `guardian/facia-tool` runs the legacy
  `ami-cloudformation-parameter` (`facia-tool-ami-update`) + `autoscaling`
  deploys, under Riff-Raff project `cms-fronts::facia-tool` (already
  permissioned — `access.ts` line 256). Phase 1 replaces the AMI-param deploy
  with a `cloud-formation` deploy here.
- `riffraff-platform` `access.ts` line 214 grants
  `'Editorial Tools::Fronts::Cloudformation'` to `guardian/editorial-tools-platform`
  — remove once the service repo is the sole deployer.

### Merge order (three coordinated PRs)

1. **platform repo** — stop deploying facia (remove the riff-raff step + delete
   orphaned `facia.yml`).
2. **service repo** — Phase 1 GuCDK wrap takes over deployment (deploy CODE then PROD).
3. **riffraff-platform** — remove the now-unused `'Editorial Tools::Fronts::Cloudformation'`
   permission from the platform-repo entry.

## Phases

- [x] **Phase 1** — wrap template with GuCDK via
  `CfnInclude` (verified **tags-only** `cdk diff` vs live `facia-CODE`). Done:
  template at `cloudformation/facia-tool.cfn.yaml`; `cdk/` scaffolded; per-stage
  `cloudFormationStackName` = `facia-CODE`/`facia-PROD`; `cdk/.nvmrc` node 24;
  service-repo CI builds+synths CDK and uploads templates; `riff-raff.yaml` now a
  `cloud-formation` deploy (`cfn-facia-tool`) with `autoscaling` depending on it;
  platform-repo facia deployer + orphaned template removed; `access.ts` permission
  removed.
- [x] **Phase 2** — `GuEc2App` (ALB) in parallel with legacy ELB (dual-stack).
  PR [#2061](https://github.com/guardian/facia-tool/pull/2061).
  Done: `GuEc2App` in [cdk/lib/facia-tool.ts](cdk/lib/facia-tool.ts) with per-stage
  `domainName`/`instanceType`/`minimumInstances`/`maximumInstances` supplied from
  [cdk/bin/cdk.ts](cdk/bin/cdk.ts); network + KMS/DB/CAPI params reused from the
  wrapped template via `getParameter`; leftover `gu:riffraff:new-asg` removed from
  the legacy ASG and added to the new one; `riff-raff.yaml` switched to
  `amiParametersToTags` (`AMI` + `AMIFaciatool`) with
  `asgMigrationInProgress: true`. CODE + PROD `cdk diff` verified purely additive
  apart from the intended legacy-ASG tag removal.
- [x] **Phase 3** — repoint CloudFront origin ELB → ALB (revertible).
  PR [#2064](https://github.com/guardian/facia-tool/pull/2064), merged and
  deployed to both stages. A single `addPropertyOverride` on the included
  `FaciaCloudfront` resource sets `DistributionConfig.Origins.0.DomainName` to
  the new ALB; `cdk diff` against both live stacks showed **only** that change.
- [x] **Phase 4** — delete legacy compute. PR
  [#2081](https://github.com/guardian/facia-tool/pull/2081), merged and deployed
  to both stages (see "Phase 4 changes" and "Post-deploy verification" below).
- [ ] **Phase 5** — follow-ups: CloudFront into GuCDK, alarms, stateful resources.

## Phase 4 changes

Removed from [cloudformation/facia-tool.cfn.yaml](cloudformation/facia-tool.cfn.yaml):

- Compute: `FaciaLoadBalancerNewVPC` (classic ELB), `FaciaAutoscalingGroupNewVPC`,
  `FaciaLaunchConfigNewVPC`.
- Security: `AppServerSecurityGroupNewVPC`, `LoadBalancerSecurityGroupNewVPC`,
  `AppToNewDBEgressNewVPC`, `NewDBToAppIngressNewVPC` (GuCDK's
  `DatabaseAccessSecurityGroup` already carries the 5432 rule).
- IAM: `DistributionRole`, `DistributionInstanceProfile` and the policies that
  existed only to attach to that role — `PanDomainPolicy`, `PermissionsPolicy`,
  `CrossAccountPolicy`, `LogServerPolicy`, `SwitchesPolicy`, `CloudwatchPolicy`,
  `DynamoPressStatus`, `AssumeCapiPreviewRolePolicy`. All are reproduced on the
  `GuEc2App` instance role.
- Parameters that only the deleted resources used: `AMI`, `CertificateArn`,
  `AvailabilityZones`, `ELKKinesisStreamArn`, `ELKKinesisStreamName`, and the
  already-dead `DBSecurityGroupId` (old VPC).
- `StageMap` sizing keys (`MinSize`/`MaxSize`/`DesiredCapacity`/`InstanceType`) —
  those values now live solely in [cdk/bin/cdk.ts](cdk/bin/cdk.ts).
- Output `FaciaLoadBalancerDNS` (not exported, so nothing can import it).

Kept deliberately:

- `StorageBucket` policy, re-pointed at **only** `StorageConsumerRole` (it was
  attached to both it and `DistributionRole`).
- `RunFaciaToolLocally` — a CODE-only developer managed policy, not compute.
- All non-compute resources (CloudFront ×2, DNS records, DynamoDB, SNS,
  `StorageConsumerRole`), so the end-state stays `CDK(cfn.yaml) -> cfn.json`.

Other changes:

- The `FaciaCloudfront` origin `DomainName` can no longer `Fn::GetAtt` the
  deleted ELB, so the YAML now holds the placeholder `overridden-by-cdk.invalid`
  and the CDK `addPropertyOverride` (unchanged since Phase 3) supplies the real
  ALB DNS name at synth. Verified absent from the synthesized templates.
  Migrating the distribution into GuCDK properly is Phase 5.
- Dropped `Tags.of(ec2App.autoScalingGroup).add('gu:riffraff:new-asg', …)`.
- `riff-raff.yaml`: removed `asgMigrationInProgress` and the legacy `AMI` entry
  from `amiParametersToTags`, leaving only `AMIFaciatool`.

Verified locally: lint, both snapshots and synth green; the synthesized PROD
template has one ASG, no `gu:riffraff:new-asg` tag, no legacy logical IDs, and no
`AMI` parameter. `git diff --stat` is deletions-only apart from comments.

### Pre-deploy verification (done)

1. **Legacy ELBs serve no real traffic.** Over the 24h after the Phase 3 deploy
   (stacks last updated 15 Sep), both classic ELBs returned **zero 2XX**:
   - CODE `facia-COD-FaciaLoa-1452723LAHNWK`: 126×3XX, 262×4XX.
   - PROD `facia-PRO-FaciaLoa-1HML78SI0GSNH`: 238×3XX, 862×4XX.

   The residual is unauthenticated noise hitting the public ELB DNS/IPs directly
   (pan-domain auth redirects + not-founds), i.e. scanners — not users, and it
   disappears with the ELB. No CloudFront distribution in the account still lists
   a legacy-ELB origin.
2. **New ALBs carry everything.** Last 24h: PROD `facia--LoadB-z9QHdT4FQLLm`
   289,288 requests (256,581×2XX, 2×5XX); CODE `facia--LoadB-Uhr93xNahT6k`
   15,142 requests (11,301×2XX) — matching the legacy PROD ELB's previous
   ~250–330k/day.
3. **`cdk diff --profile cmsFronts` against both live stacks is identical and
   removals-only**: the 17 legacy resources destroyed, 6 parameters and the
   `StageMap` sizing keys dropped, `StorageBucket.Roles` losing
   `DistributionRole`, the ASG losing `gu:riffraff:new-asg`, and the
   `FaciaLoadBalancerDNS` output removed. **No CloudFront change appears**,
   confirming the YAML placeholder is a synth-time no-op.

### Post-deploy verification (done)

Deployed CODE then PROD; both stacks `UPDATE_COMPLETE`. Confirmed against the
live account with the read-only `cmsFronts` profile:

- `cdk diff` for **both** `FaciaTool-euwest-1-CODE` and `FaciaTool-euwest-1-PROD`
  reports "There were no differences" — repo and live stacks are in sync.
- **No classic ELBs remain** in the account.
- Two ALBs, both `active`; target groups all healthy (CODE 1 target, PROD 3).
- Two ASGs (CODE 1/2/1, PROD 3/6/3) — one per stage, i.e. the legacy pair is
  gone — and **no `gu:riffraff:new-asg` tag** on either.
- End-to-end through CloudFront: `/_healthcheck` → 200 and `/` → 303 (pan-domain
  auth redirect) on both `fronts.gutools.co.uk` and
  `fronts.code.dev-gutools.co.uk`.

Phase 4 is complete. The migration's compute is now fully GuCDK-owned; the
`CfnInclude` persists only for the non-compute resources listed above.

## Phase 2 decisions

- `imageRecipe` kept verbatim as the legacy `editorial-tools-jammy-java11`.
- Certificate: a new per-stage `GuCertificate` for the CloudFront alias domain
  (`fronts.gutools.co.uk` / `fronts.code.dev-gutools.co.uk`) — that is the `Host`
  header CloudFront forwards to the origin. Validation records are created
  automatically; no manual DNS step.
- `GuUserData` not used: the app reads config from `/etc/gu/`, and the private
  config lives in `facia-private` (not the distribution bucket). Raw
  `UserData.forLinux()` replicates the legacy `cfn-init` order — user + config
  first, `.deb` install last (installing it starts the service).
- IAM: one policy per concern. Deliberately **not** ported (already granted by
  `GuInstanceRole`): ec2/autoscaling `Describe*`, Kinesis log shipping, artifact
  bucket `s3:GetObject`, SSM/SSH. `rds:DescribeDBInstances` **is** ported. The
  legacy SSM path (`/facia-tool/cms-fronts/<stage>/*`) differs from GuCDK's
  (`/<stage>/cms-fronts/facia-tool/*`) so both are present.
- Postgres access uses a **dedicated** `DatabaseAccessSecurityGroup` rather than
  the ASG's own connections, so the 5432 rule can't be replayed onto the shared
  CAPI endpoint group. Instance SG count is 3 (well under the limit of 5).
- Benign diff artefacts: ALB SG egress on 9000 to the DB-access and CAPI endpoint
  groups (connections-model side effect; the LB never uses them), and a cfn-lint
  `W9007` "duplicate Subnets" false positive (the three `Fn::Select` indices are
  distinct).

## Phase 2 deploy notes

- This is a **new-ASG ("dangerous") deploy**. Riff-Raff rotates both ASGs because
  of `asgMigrationInProgress`.
- Synthesized template is ~58KiB, above CloudFormation's 51,200-byte inline
  limit; Riff-Raff uploads templates that size to S3 automatically.
- Smoke-test via the new ALB DNS name (stack output `LoadBalancerFaciatoolDnsName`)
  sending the real `Host` header, e.g.
  `curl -sk -H 'Host: fronts.code.dev-gutools.co.uk' https://<alb-dns>/_healthcheck`.
- The new instance SG allows egress on 443 only (GuCDK default) versus the legacy
  allow-all. Confirm no outbound dependency on another port during the soak.

## Phase 3 decisions

- The distribution stays in the wrapped template; CDK only overrides the origin
  domain via `cfnInclude.getResource('FaciaCloudfront').addPropertyOverride(...)`.
  Nothing else about CloudFront (aliases, cache behaviour, viewer certificate) or
  its DNS records changes, so the blast radius is one property.
- **Rollback = revert that override and redeploy** (the legacy ELB and ASG are
  still running untouched throughout Phase 3).
- Origin id `facia-tool` and `TargetOriginId` are unchanged, so the cache
  behaviour keeps pointing at the same origin entry.
- CloudFront forwards all headers (`ForwardedValues.Headers: ["*"]`), so it
  reaches the origin with `Host: fronts[.code.dev]-gutools.co.uk` and
  `OriginProtocolPolicy: https-only`. The Phase 2 `GuCertificate` covers exactly
  that name — verified with a real SNI/hostname-validated request.

### Pre-cutover verification (done)

- Phase 2 is deployed to both stages; new ALB target groups healthy (CODE 1
  instance, PROD 3).
- Smoke tests against the new ALBs with the real `Host` header:
  `/_healthcheck` → 200, `/` → 303 (pan-domain auth redirect), in both stages,
  with full TLS verification via `curl --resolve`.

### Cutover steps

1. Deploy CODE, confirm `fronts.code.dev-gutools.co.uk` works end-to-end
   (auth + core flows), and check the CODE ALB metrics show the traffic.
2. Deploy PROD, repeat.
3. Soak. CloudFront origin changes propagate in minutes; rollback is a revert.
4. Only once the old ELBs show **0 requests** does Phase 4 delete them.

## Phase 5 — follow-ups

Three independent, separately deployable pieces of work, ordered by risk.

- [ ] **5a — stateful/shared resources into CDK.** Branch
  `gucdk-migration-phase-5a-stateful`. Code done and verified (see below);
  awaiting CODE then PROD deploy.
- [ ] **5b — CloudFront + DNS into CDK.** Branch
  `gucdk-migration-phase-5b-cloudfront`, **depends on 5a** (same files). Code done
  and verified (see below); awaiting CODE then PROD deploy. This is the change
  that reaches the `CDK -> cfn.json` end-state.
- [ ] **5c — alarms.** `monitoringConfiguration` is still `{ noMonitoring: true }`,
  matching the legacy stack. Needs a team decision on which SNS topic alarms
  notify (candidates in the account: `pagerduty-notification-topic`,
  `CMSFrontsLambda_pagerduty`, `devx-reliability`, `Cloudwatch-Alerts`) and
  whether CODE should notify at all.

Also noted, no action for now:

- **Instance egress.** The GuCDK instance SG allows egress on 443 only, versus
  the legacy allow-all. Nothing has broken across the soak — just remember it
  when adding an outbound dependency on another port.
- **cfn-lint `W9007`** ("duplicate Subnets") on the ALB is a false positive —
  the three `Fn::Select` indices are distinct.

### 5a — stateful/shared resources into CDK

Moved out of [cloudformation/facia-tool.cfn.yaml](cloudformation/facia-tool.cfn.yaml)
and into [cdk/lib/facia-tool.ts](cdk/lib/facia-tool.ts), **every one keeping its
original logical ID** via `GuStack.overrideLogicalId` (`CfnTopicPolicy` and
`CfnOutput` are L1s with no `defaultChild`, so they call
`overrideLogicalId` directly):

- `FrontsUpdateSNSTopic`, `FeastPublicationTopic`, `FrontsUpdateSNSPolicy`
- `StorageConsumerRole` + its `StorageBucket` policy
- `FrontsUserDataDynamoTable`
- `RunFaciaToolLocally` — the CODE-only developer policy. Migrated because it
  references the topics and the table, whose ARNs are not reconstructable once
  those resources leave the template. The CFN `Condition: IsCode` becomes a
  `this.stage === 'CODE'` guard in CDK, so the `IsCode` condition is gone.
- The three `Outputs`, including both `Export`s.

**The `FrontsUpdateSNSTopicARN` export is imported by
`cms-fronts-<stage>-eventbridge-to-fanout`** (confirmed with
`aws cloudformation list-imports`), so its name and value must not change —
CloudFormation refuses to alter an export that is in use.
`facia-<stage>-FeastPublicationSNSTopicARN` is exported but unused.

#### Three near-misses the diff caught

`cdk diff` initially reported **`requires replacement`** on two resources. In
each case the *resolved* value was unchanged but the *expression* differed, and
CDK's template-only diff (the profile can't `CreateChangeSet`) can't tell. Rather
than reason about whether CloudFormation would really replace them, the CDK now
emits the identical intrinsic:

| Resource | Wrong | Right |
| --- | --- | --- |
| `FrontsUserDataDynamoTable.TableName` | `` `${prefix}-${this.stage}` `` | `Fn.join('-', [prefix, stageParam])` |
| `RunFaciaToolLocally.Path` | template literal with `this.stage` | `Fn.sub('…${Stage}…')` |
| both `Export.Name`s | `` `${Aws.STACK_NAME}-…` `` (→ `Fn::Join`) | `Fn.sub('${AWS::StackName}-…')` |

Lesson for 5b: **for any property where replacement is destructive, match the
live template's intrinsic exactly rather than producing an equivalent one.**

#### Verification

- `cdk diff` against both live stacks: **no replacements and no real deletions.**
  Remaining changes are `Fn::Sub`→`Fn::Join`/partition-token rewrites of IAM
  documents (in-place updates), the DynamoDB table gaining
  `DeletionPolicy`/`UpdateReplacePolicy: Retain` (a CDK default, and an
  improvement), the launch template's `USER_DATA_TABLE` now resolving via
  `Ref: FrontsUserDataDynamoTable`, and the `IsCode` condition being dropped.
- PROD additionally shows `[-] RunFaciaToolLocally destroy`. This is the known
  condition-gated false positive — `cdk diff` does not evaluate `Conditions`, and
  `describe-stack-resources` confirms the policy **has never existed in PROD**.
- A script resolved the intrinsics in the live and synthesized templates and
  compared the effective statements: `RunFaciaToolLocally` (16),
  `StorageBucket` (2), `StorageConsumerRole` (6) and `FrontsUpdateSNSPolicy` (3)
  all **match exactly**, as do the table name and both export names, in both
  stages.
- lint, snapshots and synth green.

### 5b — CloudFront + DNS into CDK

The last of the YAML. [cloudformation/facia-tool.cfn.yaml](cloudformation/facia-tool.cfn.yaml)
and the `CfnInclude` are **deleted**, so the end-state is now `CDK -> cfn.json`
after all — the stack turned out not to be irreducibly mixed.

- `FaciaCloudfront` and `StaticCloudfront` become **L1 `CfnDistribution`s**, not
  the L2 `Distribution`. The legacy config uses `ForwardedValues`, which the L2
  construct cannot express at all — it requires cache policies. Converting would
  change caching behaviour, which must not ride along in a migration PR.
- The `overridden-by-cdk.invalid` placeholder and the Phase 3
  `addPropertyOverride` are gone: the origin now takes
  `ec2App.loadBalancer.loadBalancerDnsName` directly.
- Both DNS records become `GuCname`. `GuDnsRecordSet` uses the construct id as
  the logical ID, so `DnsRecord` and `StaticCloudFrontDnsRecord` are preserved by
  naming alone.
- All 18 template parameters are recreated as `CfnParameter`s with the same
  logical IDs, types and defaults, so Riff-Raff carries over the previous values
  of the ones with no default (the account IDs, VPC, subnets, certificate…).
  `Stage` is kept purely so the DynamoDB table name keeps its exact expression.
- `Mappings` are gone: `CloudFrontAliases`/`StaticCloudFrontAliases` become the
  `domainName`/`staticDomainName` props, `LowerCaseStage` becomes
  `this.stage.toLowerCase()`, and `CrossResources.FrontPressedTable` becomes a
  `frontPressedTable` prop — all supplied per-stage from
  [cdk/bin/cdk.ts](cdk/bin/cdk.ts), per the skill's "stack describes shape,
  entrypoint supplies values" rule.
- `description: 'Facia Tool Service'` is set on the stack so the template
  `Description` does not churn.

#### Verification

- `cdk diff` against both live stacks: **no replacements, no resource
  deletions.** Every change is `Fn::FindInMap`/`Ref` collapsing to the literal it
  already resolved to, plus the now-unused `Mappings`, `Conditions` and
  `AWSTemplateFormatVersion` being dropped.
- The resolver script was extended to compare **fully-resolved properties of
  every migrated resource**. In both stages, all of `FaciaCloudfront`,
  `StaticCloudfront`, `DnsRecord`, `StaticCloudFrontDnsRecord`,
  `FrontsUpdateSNSTopic`, `FeastPublicationTopic`, `FrontsUpdateSNSPolicy`,
  `StorageBucket`, `FrontsUserDataDynamoTable` and `RunFaciaToolLocally` resolve
  **identically**, as do all 22 parameters and both exports.
- The single reported difference is `StorageConsumerRole`'s
  `AssumeRolePolicyDocument` gaining an explicit `"Version": "2012-10-17"` (CDK
  always sets it). The statements themselves match, and the trust policy uses no
  policy variables, so the version has no behavioural effect.
- lint, snapshots and synth green. Nothing outside the plan files referenced
  `cloudformation/`; CI only uploads `cdk/cdk.out/*.template.json`.

## Node / tooling

Root pins node 16.20.2 via **both** `.nvmrc` and `.tool-versions` (mise). Prefix
every CDK command with `mise exec node@24 -- <cmd>`. Create `cdk/.nvmrc` (node 24)
only AFTER scaffolding (scaffolder precondition trap).

## AWS

Read-only profile `cmsFronts` available in the dev container — run `cdk diff`
locally: `npm run diff -- --profile cmsFronts <stack-id>`.
