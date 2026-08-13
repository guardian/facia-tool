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

- [x] **Phase 1 (implemented locally)** — wrap template with GuCDK via
  `CfnInclude` (verified **tags-only** `cdk diff` vs live `facia-CODE`). Done:
  template at `cloudformation/facia-tool.cfn.yaml`; `cdk/` scaffolded; per-stage
  `cloudFormationStackName` = `facia-CODE`/`facia-PROD`; `cdk/.nvmrc` node 24;
  service-repo CI builds+synths CDK and uploads templates; `riff-raff.yaml` now a
  `cloud-formation` deploy (`cfn-facia-tool`) with `autoscaling` depending on it;
  platform-repo facia deployer + orphaned template removed; `access.ts` permission
  removed. **Pending user action:** create branches/commits in each repo, push,
  open the 3 PRs in merge order, deploy CODE then PROD.
- [ ] **Phase 2** — `GuEc2App` (ALB) in parallel with legacy ELB (dual-stack);
  remove leftover `gu:riffraff:new-asg` from legacy ASG; `asgMigrationInProgress`.
- [ ] **Phase 3** — repoint CloudFront origin ELB → ALB (revertible).
- [ ] **Phase 4** — delete legacy compute (ELB/ASG/LC/SGs/role); template keeps
  the non-compute resources (mixed stack end-state `CDK(cfn.yaml) -> cfn.json`).
- [ ] **Phase 5** — follow-ups: CloudFront into GuCDK, alarms, stateful resources.

## Node / tooling

Root pins node 16.20.2 via **both** `.nvmrc` and `.tool-versions` (mise). Prefix
every CDK command with `mise exec node@24 -- <cmd>`. Create `cdk/.nvmrc` (node 24)
only AFTER scaffolding (scaffolder precondition trap).

## AWS

Read-only profile `cmsFronts` available in the dev container — run `cdk diff`
locally: `npm run diff -- --profile cmsFronts <stack-id>`.
