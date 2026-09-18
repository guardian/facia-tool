import { GuEc2App } from '@guardian/cdk';
import { AccessScope } from '@guardian/cdk/lib/constants';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import {
	GuDistributionBucketParameter,
	GuStack,
} from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import { GuSecurityGroup, GuVpc } from '@guardian/cdk/lib/constructs/ec2';
import { GuAllowPolicy, GuPolicy } from '@guardian/cdk/lib/constructs/iam';
import type { App, CfnParameterProps } from 'aws-cdk-lib';
import { Aws, CfnOutput, CfnParameter, Duration, Fn, Tags } from 'aws-cdk-lib';
import { CfnDistribution } from 'aws-cdk-lib/aws-cloudfront';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import type { ISubnet } from 'aws-cdk-lib/aws-ec2';
import {
	InstanceType,
	Port,
	SecurityGroup,
	UserData,
} from 'aws-cdk-lib/aws-ec2';
import {
	AccountPrincipal,
	CompositePrincipal,
	Effect,
	ManagedPolicy,
	Policy,
	PolicyStatement,
	Role,
} from 'aws-cdk-lib/aws-iam';
import { CfnTopicPolicy, Topic } from 'aws-cdk-lib/aws-sns';

const app = 'facia-tool';
const applicationPort = 9000;

export interface FaciaToolProps extends GuStackProps {
	/** Must match the `Host` header CloudFront forwards to the origin. */
	domainName: string;
	/** CloudFront alias for the static assets distribution. */
	staticDomainName: string;
	/** The front-pressed lambda's DynamoDB table, owned by another stack. */
	frontPressedTable: string;
	instanceType: string;
	minimumInstances: number;
	maximumInstances: number;
}

export class FaciaTool extends GuStack {
	constructor(scope: App, id: string, props: FaciaToolProps) {
		super(scope, id, { description: 'Facia Tool Service', ...props });

		const parameters = this.templateParameters();
		const parameter = (name: string) => parameters(name).valueAsString;
		const subnets = (name: string): ISubnet[] => {
			const subnetIds = parameters(name).valueAsList;
			return GuVpc.subnets(
				this,
				[0, 1, 2].map((index) => Fn.select(index, subnetIds)),
			);
		};

		const vpc = GuVpc.fromId(this, 'Vpc', { vpcId: parameter('VpcId') });

		const frontendRoleToAssume = parameter('FrontendRoleToAssume');
		const { frontPressedTable } = props;
		const lowerCaseStage = this.stage.toLowerCase();

		const { frontsUpdateTopic, feastPublicationTopic, userDataTable } =
			this.sharedResources(parameter);

		const ec2App = new GuEc2App(this, {
			app,
			access: { scope: AccessScope.PUBLIC },
			applicationPort,
			instanceType: new InstanceType(props.instanceType),
			monitoringConfiguration: {
				snsTopicName: 'pagerduty-notification-topic',
				// PROD serves ~290k requests a day with a handful of 5xx, so 1% is a long way
				// above the noise floor.
				http5xxAlarm: {
					tolerated5xxPercentage: 1,
					numberOfMinutesAboveThresholdBeforeAlarm: 5,
				},
				unhealthyInstancesAlarm: true,
			},
			applicationLogging: { enabled: true },
			instanceMetricGranularity: '5Minute',
			imageRecipe: 'editorial-tools-jammy-java11',
			userData: this.buildUserData({
				frontendRoleToAssume,
				frontPressedTable,
				userDataTable: userDataTable.tableName,
			}),
			certificateProps: { domainName: props.domainName },
			scaling: {
				minimumInstances: props.minimumInstances,
				maximumInstances: props.maximumInstances,
			},
			healthcheck: { path: '/_healthcheck' },
			additionalPolicies: this.applicationPolicies({
				frontendRoleToAssume,
				frontPressedTable,
				lowerCaseStage,
				userDataTableName: userDataTable.tableName,
				frontsUpdateTopicArn: frontsUpdateTopic.topicArn,
				feastPublicationTopicArn: feastPublicationTopic.topicArn,
				capiPreviewRole: parameter('CapiPreviewRole'),
				switchboardBucket: parameter('SwitchboardBucket'),
			}),
			vpc,
			privateSubnets: subnets('PrivateSubnets'),
			publicSubnets: subnets('PublicSubnets'),
		});

		this.cloudFront({
			parameter,
			domainName: props.domainName,
			staticDomainName: props.staticDomainName,
			originDomainName: ec2App.loadBalancer.loadBalancerDnsName,
		});

		const databaseSecurityGroup = SecurityGroup.fromSecurityGroupId(
			this,
			'DatabaseSecurityGroup',
			parameter('DBSecurityGroupIdNewVPC'),
			{ mutable: true },
		);

		// A dedicated group, so the Postgres rule is never replayed onto the shared CAPI endpoint group.
		const databaseAccessSecurityGroup = new GuSecurityGroup(
			this,
			'DatabaseAccessSecurityGroup',
			{
				app,
				vpc,
				description:
					'Allows facia-tool instances to reach the fronts Postgres database',
				allowAllOutbound: false,
			},
		);
		databaseAccessSecurityGroup.connections.allowTo(
			databaseSecurityGroup,
			Port.tcp(5432),
			'Postgres',
		);

		const capiEndpointSecurityGroup = SecurityGroup.fromSecurityGroupId(
			this,
			'CapiEndpointSecurityGroup',
			parameter('CapiEndpointSsmKeyNewVPC'),
			{ mutable: false },
		);

		ec2App.autoScalingGroup.instanceLaunchTemplate.connections.addSecurityGroup(
			databaseAccessSecurityGroup,
			capiEndpointSecurityGroup,
		);

		if (this.stage === 'CODE') {
			this.developerPolicy({
				lowerCaseStage,
				frontPressedTable,
				userDataTableName: userDataTable.tableName,
				frontsUpdateTopicArn: frontsUpdateTopic.topicArn,
				feastPublicationTopicArn: feastPublicationTopic.topicArn,
				capiPreviewRole: parameter('CapiPreviewRole'),
				switchboardBucket: parameter('SwitchboardBucket'),
			});
		}
	}

	/**
	 * Parameters inherited from the YAML template this stack replaced. Riff-Raff carries the
	 * previous value over for the ones without a default, so they keep the values they already have.
	 */
	private templateParameters(): (name: string) => CfnParameter {
		const definitions: Array<
			Omit<CfnParameterProps, 'type'> & { name: string; type: string }
		> = [
			// Nothing references this any more, but Riff-Raff supplies a Stage parameter when the
			// template declares one, so it stays.
			{
				name: 'Stage',
				type: 'String',
				description: 'Environment name',
				allowedValues: ['CODE', 'PROD'],
				default: 'PROD',
			},
			{
				name: 'FrontendRoleToAssume',
				type: 'String',
				description: 'Frontend Role to assume for cross account policies',
				default:
					'arn:aws:iam::642631414762:role/CmsFrontsRole-FaciaToolRole-1U44IWRZDIWAX',
			},
			{
				name: 'SwitchboardBucket',
				type: 'String',
				description: 'Bucket where switchboard writes switches status',
				default: 'arn:aws:s3:::facia-switches/*',
			},
			{
				name: 'FrontendAccountID',
				type: 'String',
				description: 'AWS account ID of frontend',
			},
			{
				name: 'MobileAPIAccountID',
				type: 'String',
				description: 'AWS account ID of MAPI',
			},
			{
				name: 'MobileAPITeamcityAccountID',
				type: 'String',
				description: 'AWS account ID of MAPI - used for CI',
			},
			{
				name: 'OphanAccountID',
				type: 'String',
				description: 'AWS account ID of Ophan',
			},
			{
				name: 'ContentAPIAccountID',
				type: 'String',
				description: 'AWS account ID of CAPI',
			},
			{
				name: 'SupportAccountID',
				type: 'String',
				description: 'AWS account ID of Support',
			},
			{
				name: 'StaticBucketName',
				type: 'String',
				description: 'Bucket containing static files',
			},
			{
				name: 'CloudFrontCertificateArn',
				type: 'String',
				description:
					'x509 certificate ARN for CloudFront - must be in us-east-1',
			},
			{
				name: 'CapiPreviewRole',
				type: 'String',
				description: 'ARN of the CAPI preview role',
			},
			{
				name: 'UserDataTablePrefix',
				type: 'String',
				default: 'fronts-user-data-table',
			},
			{ name: 'DBSecurityGroupIdNewVPC', type: 'String' },
			{
				name: 'CapiEndpointSsmKeyNewVPC',
				type: 'AWS::SSM::Parameter::Value<String>',
				description: 'SSM key containing security group of the CAPI endpoint',
				default: '/newvpc/endpoint/capi/PROD',
			},
			{
				name: 'VpcId',
				type: 'AWS::EC2::VPC::Id',
				description: 'The new VPC we look to migrate to',
			},
			{
				name: 'PublicSubnets',
				type: 'List<AWS::EC2::Subnet::Id>',
				description: 'The public subnets of the new VPC for the loadbalancer',
			},
			{
				name: 'PrivateSubnets',
				type: 'List<AWS::EC2::Subnet::Id>',
				description:
					'The private subnets of the new VPC for the autoscaling group',
			},
		];

		const parameters = new Map<string, CfnParameter>(
			definitions.map(({ name, ...props }) => {
				const parameter = new CfnParameter(this, name, props);
				parameter.overrideLogicalId(name);
				return [name, parameter];
			}),
		);

		return (name) => {
			const parameter = parameters.get(name);
			if (!parameter) {
				throw new Error(`No such template parameter: ${name}`);
			}
			return parameter;
		};
	}

	/**
	 * The two distributions are defined as L1 constructs so they keep the legacy `ForwardedValues`
	 * cache settings, which the L2 `Distribution` construct cannot express. Moving them to cache
	 * policies would change caching behaviour, so it is deliberately not part of this migration.
	 */
	private cloudFront({
		parameter,
		domainName,
		staticDomainName,
		originDomainName,
	}: {
		parameter: (name: string) => string;
		domainName: string;
		staticDomainName: string;
		originDomainName: string;
	}): void {
		const viewerCertificate = {
			acmCertificateArn: parameter('CloudFrontCertificateArn'),
			minimumProtocolVersion: 'TLSv1.2_2021',
			sslSupportMethod: 'sni-only',
		};

		const distribution = new CfnDistribution(this, 'FaciaCloudfront', {
			distributionConfig: {
				httpVersion: 'http2',
				ipv6Enabled: true,
				aliases: [domainName],
				origins: [
					{
						customOriginConfig: {
							httpsPort: 443,
							originProtocolPolicy: 'https-only',
						},
						domainName: originDomainName,
						id: app,
					},
				],
				defaultRootObject: 'v2',
				defaultCacheBehavior: {
					allowedMethods: [
						'DELETE',
						'GET',
						'HEAD',
						'OPTIONS',
						'PATCH',
						'POST',
						'PUT',
					],
					compress: true,
					forwardedValues: {
						headers: ['*'],
						queryString: true,
						cookies: { forward: 'all' },
					},
					targetOriginId: app,
					viewerProtocolPolicy: 'redirect-to-https',
				},
				priceClass: 'PriceClass_All',
				enabled: true,
				viewerCertificate,
			},
		});
		distribution.overrideLogicalId('FaciaCloudfront');

		const staticDistribution = new CfnDistribution(this, 'StaticCloudfront', {
			distributionConfig: {
				httpVersion: 'http2',
				ipv6Enabled: true,
				aliases: [staticDomainName],
				origins: [
					{
						s3OriginConfig: { originAccessIdentity: '' },
						domainName: `${parameter('StaticBucketName')}.s3.amazonaws.com`,
						id: `static-${app}`,
						originPath: `/${this.stage}/static-${app}`,
					},
				],
				defaultRootObject: 'index.html',
				defaultCacheBehavior: {
					compress: true,
					forwardedValues: { queryString: false },
					targetOriginId: `static-${app}`,
					viewerProtocolPolicy: 'redirect-to-https',
				},
				priceClass: 'PriceClass_All',
				enabled: true,
				viewerCertificate,
			},
		});
		staticDistribution.overrideLogicalId('StaticCloudfront');

		new GuCname(this, 'DnsRecord', {
			app,
			domainName,
			resourceRecord: `${distribution.attrDomainName}.`,
			ttl: Duration.seconds(900),
		});

		new GuCname(this, 'StaticCloudFrontDnsRecord', {
			app,
			domainName: staticDomainName,
			resourceRecord: `${staticDistribution.attrDomainName}.`,
			ttl: Duration.seconds(900),
		});
	}

	private bucketArn(bucketName: string, key?: string): string {
		return this.formatArn({
			service: 's3',
			region: '',
			account: '',
			resource: bucketName,
			resourceName: key,
		});
	}

	private dynamoTableArn(tableName: string): string {
		return this.formatArn({
			service: 'dynamodb',
			resource: 'table',
			resourceName: tableName,
		});
	}

	/** Resources that outlive the compute, so they keep the logical IDs they had in the YAML template. */
	private sharedResources(parameter: (name: string) => string): {
		frontsUpdateTopic: Topic;
		feastPublicationTopic: Topic;
		userDataTable: Table;
	} {
		const retained = (logicalId: string) => ({
			logicalId,
			reason: 'Stateful resource previously defined in the YAML template',
		});

		const frontsUpdateTopic = new Topic(this, 'FrontsUpdateSNSTopic', {
			displayName: 'SNS Topic for fronts updates (both draft & live)',
		});
		this.overrideLogicalId(frontsUpdateTopic, retained('FrontsUpdateSNSTopic'));

		const feastPublicationTopic = new Topic(this, 'FeastPublicationTopic');
		this.overrideLogicalId(
			feastPublicationTopic,
			retained('FeastPublicationTopic'),
		);

		const subscribers = {
			MobileAccount: 'MobileAPIAccountID',
			FrontendAccount: 'FrontendAccountID',
			OphanAccount: 'OphanAccountID',
		};
		const frontsUpdateTopicPolicy = new CfnTopicPolicy(
			this,
			'FrontsUpdateSNSPolicy',
			{
				topics: [frontsUpdateTopic.topicArn],
				policyDocument: {
					Statement: Object.entries(subscribers).map(
						([sid, accountIdParameter]) => ({
							Sid: sid,
							Effect: 'Allow',
							Principal: { AWS: parameter(accountIdParameter) },
							Action: 'sns:Subscribe',
							Resource: frontsUpdateTopic.topicArn,
						}),
					),
				},
			},
		);
		// An L1 construct, so it has no defaultChild for GuStack.overrideLogicalId to reach.
		frontsUpdateTopicPolicy.overrideLogicalId('FrontsUpdateSNSPolicy');

		const storageConsumerRole = new Role(this, 'StorageConsumerRole', {
			path: '/',
			assumedBy: new CompositePrincipal(
				...[
					'FrontendAccountID',
					'MobileAPIAccountID',
					'MobileAPITeamcityAccountID',
					'OphanAccountID',
					'ContentAPIAccountID',
					'SupportAccountID',
				].map((name) => new AccountPrincipal(parameter(name))),
			),
		});
		this.overrideLogicalId(storageConsumerRole, retained('StorageConsumerRole'));

		const storageBucketPolicy = new Policy(this, 'StorageConsumerBucketPolicy', {
			policyName: 'StorageBucket',
			roles: [storageConsumerRole],
			statements: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['s3:GetObject', 's3:PutObject', 's3:PutObjectAcl'],
					resources: [this.bucketArn('facia-tool-store', `${this.stage}/*`)],
				}),
				new PolicyStatement({
					effect: Effect.ALLOW,
					actions: ['s3:ListBucket'],
					resources: [this.bucketArn('facia-tool-store')],
				}),
			],
		});
		this.overrideLogicalId(storageBucketPolicy, retained('StorageBucket'));

		const userDataTable = new Table(this, 'UserDataTable', {
			tableName: `${parameter('UserDataTablePrefix')}-${this.stage}`,
			partitionKey: { name: 'email', type: AttributeType.STRING },
			readCapacity: 5,
			writeCapacity: 5,
		});
		Tags.of(userDataTable).add('devx-backup-enabled', 'true');
		this.overrideLogicalId(
			userDataTable,
			retained('FrontsUserDataDynamoTable'),
		);

		const storageConsumerRoleOutput = new CfnOutput(
			this,
			'StorageConsumerRoleOutput',
			{
				description:
					'Role to be assumed for cross account access to the bucket',
				value: storageConsumerRole.roleName,
			},
		);
		storageConsumerRoleOutput.overrideLogicalId('StorageConsumerRole');

		// cms-fronts-<stage>-eventbridge-to-fanout imports this export, so its name and value must not change.
		const frontsUpdateTopicOutput = new CfnOutput(
			this,
			'FrontsUpdateSNSTopicARNOutput',
			{
				description: 'ARN of the SNS topic',
				value: frontsUpdateTopic.topicArn,
				exportName: `${Aws.STACK_NAME}-FrontsUpdateSNSTopicARN`,
			},
		);
		frontsUpdateTopicOutput.overrideLogicalId('FrontsUpdateSNSTopicARN');

		const feastPublicationTopicOutput = new CfnOutput(
			this,
			'FeastPublicationSNSTopicOutput',
			{
				description: 'ARN of the SNS topic',
				value: feastPublicationTopic.topicArn,
				exportName: `${Aws.STACK_NAME}-FeastPublicationSNSTopicARN`,
			},
		);
		feastPublicationTopicOutput.overrideLogicalId('FeastPublicationSNSTopic');

		return { frontsUpdateTopic, feastPublicationTopic, userDataTable };
	}

	/** CODE-only: lets a developer run facia-tool on their own machine against CODE resources. */
	private developerPolicy({
		lowerCaseStage,
		frontPressedTable,
		userDataTableName,
		frontsUpdateTopicArn,
		feastPublicationTopicArn,
		capiPreviewRole,
		switchboardBucket,
	}: {
		lowerCaseStage: string;
		frontPressedTable: string;
		userDataTableName: string;
		frontsUpdateTopicArn: string;
		feastPublicationTopicArn: string;
		capiPreviewRole: string;
		switchboardBucket: string;
	}): void {
		const allow = (actions: string[], resources: string[], sid?: string) =>
			new PolicyStatement({
				sid,
				effect: Effect.ALLOW,
				actions,
				resources,
			});

		const policy = new ManagedPolicy(this, 'RunFaciaToolLocally', {
			description: 'Policy used for running fronts-tool locally',
			path: `/developer-policy/guardian/facia-tool/cms-fronts/${this.stage}/run-fronts-tool-locally/`,
			statements: [
				allow(
					['ssm:GetParameter'],
					[
						this.formatArn({
							service: 'ssm',
							resource: 'parameter',
							resourceName: `${app}/${this.stack}/${this.stage}/*`,
						}),
					],
				),
				allow(
					['kms:Decrypt'],
					[
						this.formatArn({
							service: 'kms',
							resource: 'key',
							resourceName: 'alias/aws/ssm',
						}),
					],
				),
				allow(
					['sqs:ReceiveMessage', 'sqs:DeleteMessage'],
					[
						this.formatArn({
							service: 'sqs',
							resource: `publish-events-${this.stage}`,
						}),
					],
				),
				allow(
					['s3:GetObject'],
					[
						this.bucketArn('facia-dist', `${this.stage}/*`),
						this.bucketArn(
							'facia-private',
							`${app}.application.secrets.local.conf`,
						),
						this.bucketArn('facia-private', `${app}.local.properties`),
					],
				),
				allow(
					[
						'dynamodb:GetItem',
						'dynamodb:Query',
						'dynamodb:PutItem',
						'dynamodb:UpdateItem',
						'dynamodb:Scan',
					],
					[this.dynamoTableArn(userDataTableName)],
				),
				allow(
					[
						'ec2:DescribeTags',
						'ec2:DescribeInstances',
						'autoscaling:DescribeAutoScalingGroups',
						'autoscaling:DescribeAutoScalingInstances',
						'rds:DescribeDBInstances',
					],
					['*'],
				),
				allow(
					['s3:PutObject'],
					[
						this.bucketArn(`published-editions-${lowerCaseStage}`, '*'),
						this.bucketArn(`preview-editions-${lowerCaseStage}`, '*'),
					],
				),
				allow(['sns:Publish'], [frontsUpdateTopicArn], 'AllowPublishToMyTopic'),
				allow(['sns:Publish'], [feastPublicationTopicArn]),
				allow(
					['s3:GetObject', 's3:PutObject', 's3:PutObjectAcl'],
					[this.bucketArn('facia-tool-store', `${this.stage}/*`)],
				),
				allow(['s3:ListBucket'], [this.bucketArn('facia-tool-store')]),
				allow(
					['s3:GetObject'],
					[
						this.bucketArn(
							'pan-domain-auth-settings',
							'local.dev-gutools.co.uk.settings',
						),
						this.bucketArn(
							'pan-domain-auth-settings',
							'local.dev-gutools.co.uk.settings.public',
						),
						this.bucketArn('pan-domain-auth-settings', '*.p12'),
					],
				),
				allow(
					['s3:GetObject'],
					[this.bucketArn('permissions-cache', `${this.stage}/*`)],
				),
				allow(['sts:AssumeRole'], [capiPreviewRole]),
				allow(['s3:GetObject'], [switchboardBucket]),
				allow(
					['dynamodb:GetItem', 'dynamodb:Query'],
					[this.dynamoTableArn(frontPressedTable)],
				),
			],
		});
		this.overrideLogicalId(policy, {
			logicalId: 'RunFaciaToolLocally',
			reason: 'Developer policy previously defined in the YAML template',
		});
	}

	private buildUserData({
		frontendRoleToAssume,
		frontPressedTable,
		userDataTable,
	}: {
		frontendRoleToAssume: string;
		frontPressedTable: string;
		userDataTable: string;
	}): UserData {
		const distributionBucket =
			GuDistributionBucketParameter.getInstance(this).valueAsString;
		const userData = UserData.forLinux({ shebang: '#!/bin/bash -ev' });

		// Installing the .deb starts the service, so the user and its config must be in place first.
		userData.addCommands(
			`groupadd --force --system ${app}`,
			`useradd --system --gid ${app} --home-dir /home/${app} --create-home --shell /usr/sbin/nologin ${app} || true`,
			`mkdir -p /etc/gu`,
			`aws s3 cp s3://facia-private/${app}.application.secrets.${this.stage}.conf /etc/gu/${app}.application.secrets.conf --region ${this.region}`,
			`chown ${app} /etc/gu/${app}.application.secrets.conf`,
			`chmod 400 /etc/gu/${app}.application.secrets.conf`,
			`cat > /etc/gu/${app}.properties <<'EOF'
STAGE=${this.stage}
STS_ROLE=${frontendRoleToAssume}
FRONT_PRESSED_TABLE=${frontPressedTable}
USER_DATA_TABLE=${userDataTable}
EOF`,
			`aws s3 cp s3://${distributionBucket}/${this.stack}/${this.stage}/${app}/${app}_1.0_all.deb /home/${app}/${app}.all.deb --region ${this.region}`,
			`dpkg -i /home/${app}/${app}.all.deb`,
		);

		return userData;
	}

	private applicationPolicies({
		frontendRoleToAssume,
		frontPressedTable,
		lowerCaseStage,
		userDataTableName,
		frontsUpdateTopicArn,
		feastPublicationTopicArn,
		capiPreviewRole,
		switchboardBucket,
	}: {
		frontendRoleToAssume: string;
		frontPressedTable: string;
		lowerCaseStage: string;
		userDataTableName: string;
		frontsUpdateTopicArn: string;
		feastPublicationTopicArn: string;
		capiPreviewRole: string;
		switchboardBucket: string;
	}): GuPolicy[] {
		const bucketArn = (bucketName: string, key?: string) =>
			this.bucketArn(bucketName, key);
		const dynamoTableArn = (tableName: string) =>
			this.dynamoTableArn(tableName);

		return [
			new GuPolicy(this, 'ParameterStorePolicy', {
				statements: [
					new PolicyStatement({
						effect: Effect.ALLOW,
						actions: ['ssm:GetParameter'],
						resources: [
							this.formatArn({
								service: 'ssm',
								resource: 'parameter',
								resourceName: `${app}/${this.stack}/${this.stage}/*`,
							}),
						],
					}),
					new PolicyStatement({
						effect: Effect.ALLOW,
						actions: ['kms:Decrypt'],
						resources: ['*'],
					}),
				],
			}),

			new GuAllowPolicy(this, 'PrivateConfigPolicy', {
				actions: ['s3:GetObject'],
				resources: [bucketArn('facia-private', '*')],
			}),

			new GuAllowPolicy(this, 'PublishEventsQueuePolicy', {
				actions: ['sqs:ReceiveMessage', 'sqs:DeleteMessage'],
				resources: [
					this.formatArn({
						service: 'sqs',
						resource: `publish-events-${this.stage}`,
					}),
				],
			}),

			new GuAllowPolicy(this, 'UserDataTablePolicy', {
				actions: [
					'dynamodb:GetItem',
					'dynamodb:Query',
					'dynamodb:PutItem',
					'dynamodb:UpdateItem',
					'dynamodb:Scan',
				],
				resources: [dynamoTableArn(userDataTableName)],
			}),

			new GuAllowPolicy(this, 'PressedFrontsStatusPolicy', {
				actions: ['dynamodb:GetItem', 'dynamodb:Query'],
				resources: [dynamoTableArn(frontPressedTable)],
			}),

			new GuAllowPolicy(this, 'SendEmailPolicy', {
				actions: ['ses:SendEmail'],
				resources: ['*'],
			}),

			// The one Describe permission GuDescribeEC2Policy does not already grant.
			new GuAllowPolicy(this, 'DescribeDatabasesPolicy', {
				actions: ['rds:DescribeDBInstances'],
				resources: ['*'],
			}),

			new GuAllowPolicy(this, 'EditionsBucketsPolicy', {
				actions: ['s3:PutObject'],
				resources: [
					bucketArn(`published-editions-${lowerCaseStage}`, '*'),
					bucketArn(`preview-editions-${lowerCaseStage}`, '*'),
				],
			}),

			new GuAllowPolicy(this, 'PublishTopicPolicy', {
				actions: ['sns:Publish'],
				resources: [frontsUpdateTopicArn, feastPublicationTopicArn],
			}),

			new GuPolicy(this, 'StorageBucketPolicy', {
				statements: [
					new PolicyStatement({
						effect: Effect.ALLOW,
						actions: ['s3:GetObject', 's3:PutObject', 's3:PutObjectAcl'],
						resources: [bucketArn('facia-tool-store', `${this.stage}/*`)],
					}),
					new PolicyStatement({
						effect: Effect.ALLOW,
						actions: ['s3:ListBucket'],
						resources: [bucketArn('facia-tool-store')],
					}),
				],
			}),

			new GuAllowPolicy(this, 'PanDomainPolicy', {
				actions: ['s3:GetObject'],
				resources: [bucketArn('pan-domain-auth-settings', '*')],
			}),

			new GuAllowPolicy(this, 'PermissionsPolicy', {
				actions: ['s3:GetObject'],
				resources: [bucketArn('permissions-cache', '*')],
			}),

			new GuAllowPolicy(this, 'SwitchesPolicy', {
				actions: ['s3:GetObject'],
				resources: [switchboardBucket],
			}),

			new GuAllowPolicy(this, 'CloudwatchPolicy', {
				actions: [
					'cloudwatch:GetMetricStatistics',
					'cloudwatch:ListMetrics',
					'cloudwatch:PutMetricData',
				],
				resources: ['*'],
			}),

			new GuAllowPolicy(this, 'AssumeFrontendRolePolicy', {
				actions: ['sts:AssumeRole'],
				resources: [frontendRoleToAssume],
			}),

			new GuAllowPolicy(this, 'AssumeCapiPreviewRolePolicy', {
				actions: ['sts:AssumeRole'],
				resources: [capiPreviewRole],
			}),
		];
	}
}
