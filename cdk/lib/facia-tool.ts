import { join } from 'path';
import { GuEc2App } from '@guardian/cdk';
import { AccessScope } from '@guardian/cdk/lib/constants';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import {
	GuDistributionBucketParameter,
	GuStack,
} from '@guardian/cdk/lib/constructs/core';
import { GuSecurityGroup, GuVpc } from '@guardian/cdk/lib/constructs/ec2';
import { GuAllowPolicy, GuPolicy } from '@guardian/cdk/lib/constructs/iam';
import type { App } from 'aws-cdk-lib';
import { CfnOutput, Fn, Tags } from 'aws-cdk-lib';
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
import { CfnInclude } from 'aws-cdk-lib/cloudformation-include';

const app = 'facia-tool';
const applicationPort = 9000;

export interface FaciaToolProps extends GuStackProps {
	/** Must match the `Host` header CloudFront forwards to the origin. */
	domainName: string;
	instanceType: string;
	minimumInstances: number;
	maximumInstances: number;
}

export class FaciaTool extends GuStack {
	constructor(scope: App, id: string, props: FaciaToolProps) {
		super(scope, id, props);

		const yamlTemplateFilePath = join(
			__dirname,
			'../..',
			'cloudformation/facia-tool.cfn.yaml',
		);
		const cfnInclude = new CfnInclude(this, 'YamlTemplate', {
			templateFile: yamlTemplateFilePath,
		});

		const parameter = (name: string) =>
			cfnInclude.getParameter(name).valueAsString;
		const subnets = (name: string): ISubnet[] => {
			const subnetIds = cfnInclude.getParameter(name).valueAsList;
			return GuVpc.subnets(
				this,
				[0, 1, 2].map((index) => Fn.select(index, subnetIds)),
			);
		};

		const vpc = GuVpc.fromId(this, 'Vpc', { vpcId: parameter('VpcId') });

		const frontendRoleToAssume = parameter('FrontendRoleToAssume');
		const frontPressedTable = Fn.findInMap(
			'CrossResources',
			this.stage,
			'FrontPressedTable',
		);
		const lowerCaseStage = Fn.findInMap(
			'StageMap',
			this.stage,
			'LowerCaseStage',
		);

		const { frontsUpdateTopic, feastPublicationTopic, userDataTable } =
			this.sharedResources(parameter);

		const ec2App = new GuEc2App(this, {
			app,
			access: { scope: AccessScope.PUBLIC },
			applicationPort,
			instanceType: new InstanceType(props.instanceType),
			monitoringConfiguration: { noMonitoring: true },
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

		// Serve CloudFront from the ALB; the included template only carries a placeholder origin.
		cfnInclude
			.getResource('FaciaCloudfront')
			.addPropertyOverride(
				'DistributionConfig.Origins.0.DomainName',
				ec2App.loadBalancer.loadBalancerDnsName,
			);

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
			// Built with the same intrinsic as the YAML template: a different expression for the
			// same name still reads as "requires replacement" on a DynamoDB table.
			tableName: Fn.join('-', [
				parameter('UserDataTablePrefix'),
				parameter('Stage'),
			]),
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
				exportName: Fn.sub('${AWS::StackName}-FrontsUpdateSNSTopicARN'),
			},
		);
		frontsUpdateTopicOutput.overrideLogicalId('FrontsUpdateSNSTopicARN');

		const feastPublicationTopicOutput = new CfnOutput(
			this,
			'FeastPublicationSNSTopicOutput',
			{
				description: 'ARN of the SNS topic',
				value: feastPublicationTopic.topicArn,
				exportName: Fn.sub('${AWS::StackName}-FeastPublicationSNSTopicARN'),
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
			// As with the table name, a resolved-but-different Path reads as "requires replacement".
			path: Fn.sub(
				'/developer-policy/guardian/facia-tool/cms-fronts/${Stage}/run-fronts-tool-locally/',
			),
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
