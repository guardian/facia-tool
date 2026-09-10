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
import { Fn, Tags } from 'aws-cdk-lib';
import type { ISubnet } from 'aws-cdk-lib/aws-ec2';
import {
	InstanceType,
	Port,
	SecurityGroup,
	UserData,
} from 'aws-cdk-lib/aws-ec2';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
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
		const userDataTable = `${parameter('UserDataTablePrefix')}-${this.stage}`;

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
				userDataTable,
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
				userDataTableArn: cfnInclude.getResource('FrontsUserDataDynamoTable')
					.ref,
				frontsUpdateTopicArn: cfnInclude.getResource('FrontsUpdateSNSTopic')
					.ref,
				feastPublicationTopicArn: cfnInclude.getResource(
					'FeastPublicationTopic',
				).ref,
				capiPreviewRole: parameter('CapiPreviewRole'),
				switchboardBucket: parameter('SwitchboardBucket'),
			}),
			vpc,
			privateSubnets: subnets('PrivateSubnets'),
			publicSubnets: subnets('PublicSubnets'),
		});

		// Tells Riff-Raff which of the two ASGs is the new one while the migration is in progress.
		Tags.of(ec2App.autoScalingGroup).add('gu:riffraff:new-asg', 'true');

		// Traffic cutover: serve CloudFront from the new ALB instead of the legacy ELB.
		// Reverting this override is the rollback.
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
		userDataTableArn,
		frontsUpdateTopicArn,
		feastPublicationTopicArn,
		capiPreviewRole,
		switchboardBucket,
	}: {
		frontendRoleToAssume: string;
		frontPressedTable: string;
		lowerCaseStage: string;
		userDataTableArn: string;
		frontsUpdateTopicArn: string;
		feastPublicationTopicArn: string;
		capiPreviewRole: string;
		switchboardBucket: string;
	}): GuPolicy[] {
		const bucketArn = (bucketName: string, key?: string) =>
			this.formatArn({
				service: 's3',
				region: '',
				account: '',
				resource: bucketName,
				resourceName: key,
			});

		const dynamoTableArn = (tableName: string) =>
			this.formatArn({
				service: 'dynamodb',
				resource: 'table',
				resourceName: tableName,
			});

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
				resources: [dynamoTableArn(userDataTableArn)],
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
