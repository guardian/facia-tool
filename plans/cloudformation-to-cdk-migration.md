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
- [ ] **Phase 3** — repoint CloudFront origin ELB → ALB (revertible). Code done:
  a single `addPropertyOverride` on the included `FaciaCloudfront` resource sets
  `DistributionConfig.Origins.0.DomainName` to the new ALB. `cdk diff` against
  both live stacks shows **only** that one property change. Awaiting CODE then
  PROD deploy + soak.
- [ ] **Phase 4** — delete legacy compute (ELB/ASG/LC/SGs/role); template keeps
  the non-compute resources (mixed stack end-state `CDK(cfn.yaml) -> cfn.json`).
- [ ] **Phase 5** — follow-ups: CloudFront into GuCDK, alarms, stateful resources.

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

## Node / tooling

Root pins node 16.20.2 via **both** `.nvmrc` and `.tool-versions` (mise). Prefix
every CDK command with `mise exec node@24 -- <cmd>`. Create `cdk/.nvmrc` (node 24)
only AFTER scaffolding (scaffolder precondition trap).

## AWS

Read-only profile `cmsFronts` available in the dev container — run `cdk diff`
locally: `npm run diff -- --profile cmsFronts <stack-id>`.
