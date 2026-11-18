import { GuardianAwsAccounts } from '@guardian/aws-account-setup';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuVpc, SubnetType } from '@guardian/cdk/lib/constructs/ec2';
import type { App } from 'aws-cdk-lib';
import { Aws, CfnDeletionPolicy, CfnOutput, Tags } from 'aws-cdk-lib';
import { CfnSecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { CfnRule } from 'aws-cdk-lib/aws-events';
import {
	AccountPrincipal,
	CompositePrincipal,
	Effect,
	Policy,
	PolicyStatement,
	Role,
} from 'aws-cdk-lib/aws-iam';
import { CfnAlias, CfnKey } from 'aws-cdk-lib/aws-kms';
import { CfnDBInstance, CfnDBSubnetGroup } from 'aws-cdk-lib/aws-rds';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import { CfnSubscription, CfnTopic } from 'aws-cdk-lib/aws-sns';
import { CfnQueue, CfnQueuePolicy } from 'aws-cdk-lib/aws-sqs';

const app = 'facia-tool';

/** Both stages allocate the same storage; only the instance class and MultiAZ differ. */
const allocatedStorage = '100';

const allow = (actions: string[], resources: string[]) =>
	new PolicyStatement({ effect: Effect.ALLOW, actions, resources });

export interface FaciaEditionsProps extends GuStackProps {
	databaseInstanceClass: string;
	multiAz: boolean;
}

export class FaciaEditions extends GuStack {
	/** `Fn::ImportValue` for the database's security group, for the service stack to reach it. */
	readonly databaseSecurityGroupId: string;

	constructor(scope: App, id: string, props: FaciaEditionsProps) {
		super(scope, id, {
			description: 'Facia Tool Editions Resources',
			app,
			...props,
		});

		const lowerCaseStage = this.stage.toLowerCase();

		const vpc = GuVpc.fromIdParameter(this, 'Vpc');
		const privateSubnets = GuVpc.subnetsFromParameter(this, {
			type: SubnetType.PRIVATE,
		});

		const databaseSecurityGroup = this.database({
			vpcId: vpc.vpcId,
			subnetIds: privateSubnets.map(({ subnetId }) => subnetId),
			instanceClass: props.databaseInstanceClass,
			multiAz: props.multiAz,
		});

		// Named rather than left to CDK, because an export name cannot change while it is imported.
		this.databaseSecurityGroupId = this.exportValue(
			databaseSecurityGroup.attrGroupId,
			{ name: `facia-db-${this.stage}-DatabaseSecurityGroupId` },
		);

		const { previewBucket, publishedBucket } = this.buckets(lowerCaseStage);

		this.editionsBuilder({ previewBucket, publishedBucket });
		this.publishedEditionUpdates();
		this.editionsListenerRule(lowerCaseStage);
	}

	private database({
		vpcId,
		subnetIds,
		instanceClass,
		multiAz,
	}: {
		vpcId: string;
		subnetIds: string[];
		instanceClass: string;
		multiAz: boolean;
	}): CfnSecurityGroup {
		const retain = (
			resource: CfnSecurityGroup | CfnDBSubnetGroup | CfnDBInstance,
		) => {
			resource.cfnOptions.deletionPolicy = CfnDeletionPolicy.RETAIN;
			resource.cfnOptions.updateReplacePolicy = CfnDeletionPolicy.RETAIN;
		};

		const securityGroup = new CfnSecurityGroup(this, 'DBSecurityGroupNewVPC', {
			groupDescription: 'Security group for the database',
			vpcId,
		});
		securityGroup.overrideLogicalId('DBSecurityGroupNewVPC');
		retain(securityGroup);

		const subnetGroup = new CfnDBSubnetGroup(this, 'DBSubnetGroupNewVPC', {
			dbSubnetGroupDescription: 'Private subnet group for faciatool database',
			subnetIds,
		});
		subnetGroup.overrideLogicalId('DBSubnetGroupNewVPC');
		retain(subnetGroup);

		const instance = new CfnDBInstance(this, 'PostgresInstanceNewVPC', {
			allocatedStorage,
			dbInstanceClass: instanceClass,
			multiAz,
			autoMinorVersionUpgrade: true,
			dbInstanceIdentifier: `facia-${this.stage}-db-2025`,
			dbSubnetGroupName: subnetGroup.ref,
			engine: 'postgres',
			engineVersion: '14.17',
			vpcSecurityGroups: [securityGroup.attrGroupId],
			storageEncrypted: true,
			storageType: 'gp2',
			port: '5432',
			deletionProtection: true,
		});
		instance.overrideLogicalId('PostgresInstanceNewVPC');
		retain(instance);
		// App, Stack and Stage come from GuStack; this one does not.
		Tags.of(instance).add('devx-backup-enabled', 'true');

		return securityGroup;
	}

	private buckets(lowerCaseStage: string): {
		previewBucket: CfnBucket;
		publishedBucket: CfnBucket;
	} {
		const blockPublicAccess = {
			blockPublicAcls: true,
			blockPublicPolicy: true,
			ignorePublicAcls: true,
			restrictPublicBuckets: true,
		};

		const previewBucket = new CfnBucket(this, 'PreviewEditionsBucket', {
			bucketName: `preview-editions-${lowerCaseStage}`,
			publicAccessBlockConfiguration: blockPublicAccess,
			lifecycleConfiguration: {
				rules: [
					{
						id: 'RemoveOldPreviewArtifacts',
						status: 'Enabled',
						expirationInDays: 30,
					},
				],
			},
		});
		previewBucket.overrideLogicalId('PreviewEditionsBucket');

		const publishedBucket = new CfnBucket(this, 'PublishedEditionsBucket', {
			bucketName: `published-editions-${lowerCaseStage}`,
			publicAccessBlockConfiguration: blockPublicAccess,
			notificationConfiguration: {
				lambdaConfigurations: [
					{
						event: 's3:ObjectCreated:*',
						// Owned by the mobile account, which also runs the editions builder.
						function: `arn:aws:lambda:${this.region}:${GuardianAwsAccounts.Mobile}:function:editions-proof-archiver-s3-event-listener-${this.stage}`,
					},
				],
			},
		});
		publishedBucket.overrideLogicalId('PublishedEditionsBucket');

		return { previewBucket, publishedBucket };
	}

	/** Read access to the editions buckets for the builder, wherever it is running. */
	private editionsBuilder({
		previewBucket,
		publishedBucket,
	}: {
		previewBucket: CfnBucket;
		publishedBucket: CfnBucket;
	}): void {
		const role = new Role(this, 'EditionsBuilderRole', {
			assumedBy: new CompositePrincipal(
				// The builder is mid-migration from the frontend account to the mobile one.
				new AccountPrincipal(GuardianAwsAccounts.Frontend),
				new AccountPrincipal(GuardianAwsAccounts.Mobile),
			),
		});
		this.overrideLogicalId(role, {
			logicalId: 'EditionsBuilderRole',
			reason: 'Assumed cross-account, so the ARN must not change',
		});

		const policy = new Policy(this, 'EditionsBuilderPolicy', {
			policyName: 'EditionsBuilderPolicy',
			roles: [role],
			statements: [
				allow(
					['s3:ListBucket'],
					[publishedBucket.attrArn, previewBucket.attrArn],
				),
				allow(
					['s3:GetObject'],
					[`${publishedBucket.attrArn}/*`, `${previewBucket.attrArn}/*`],
				),
				// Legacy bucket access, kept from the YAML template.
				allow(['s3:ListBucket'], [this.bucketArn('facia-tool-store')]),
				allow(['s3:GetObject'], [this.bucketArn('facia-tool-store', '*')]),
			],
		});
		this.overrideLogicalId(policy, {
			logicalId: 'EditionsBuilderPolicy',
			reason: 'Policy previously defined in the YAML template',
		});

		const output = new CfnOutput(this, 'EditionsBuilderRoleOutput', {
			description: 'Editions builder role',
			value: role.roleArn,
		});
		output.overrideLogicalId('EditionsBuilderRole');
	}

	/**
	 * An SNS topic other accounts publish edition-published events to, fanned out to a queue the
	 * tool itself reads. The queue is encrypted, so publishers need the key as well as the topic.
	 */
	private publishedEditionUpdates(): void {
		const key = new CfnKey(this, 'KmsKeySqsQueueFromSns', {
			description:
				'Encrypts messages published to an SQS queue from an SNS topic for Edition published event',
			keyPolicy: {
				Version: '2012-10-17',
				Id: 'SNS-to-SQS-Key',
				Statement: [
					{
						Effect: 'Allow',
						Principal: { AWS: `arn:aws:iam::${Aws.ACCOUNT_ID}:root` },
						Action: ['kms:*'],
						Resource: '*',
					},
					...['sqs.amazonaws.com', 'sns.amazonaws.com'].map((service) => ({
						Effect: 'Allow',
						Principal: { Service: service },
						Action: ['kms:GenerateDataKey*', 'kms:Decrypt'],
						Resource: '*',
					})),
				],
			},
		});
		key.overrideLogicalId('KmsKeySqsQueueFromSns');

		const alias = new CfnAlias(this, 'KmsKeySqsQueueFromSnsAlias', {
			aliasName: `alias/facia-tool-editions/sns-to-sqs-${this.stage}`,
			targetKeyId: key.ref,
		});
		alias.overrideLogicalId('KmsKeySqsQueueFromSnsAlias');

		const topic = new CfnTopic(this, 'PublishedEditionUpdateTopic', {
			kmsMasterKeyId: key.ref,
		});
		topic.overrideLogicalId('PublishedEditionUpdateTopic');

		const queue = new CfnQueue(this, 'PublishedEditionUpdateQueue', {
			queueName: `publish-events-${this.stage}`,
			receiveMessageWaitTimeSeconds: 20,
			kmsMasterKeyId: key.ref,
		});
		queue.overrideLogicalId('PublishedEditionUpdateQueue');

		// Any principal may send, but only via the topic above.
		const queuePolicy = new CfnQueuePolicy(
			this,
			'PublishedEditionUpdateSQSPolicy',
			{
				queues: [queue.ref],
				policyDocument: {
					Id: 'sqs-sendmessage',
					Statement: [
						{
							Sid: 'allow-sqs-sendmessage',
							Effect: 'Allow',
							Principal: { AWS: '*' },
							Action: ['SQS:SendMessage'],
							Resource: queue.attrArn,
							Condition: { ArnEquals: { 'aws:SourceArn': topic.ref } },
						},
					],
				},
			},
		);
		queuePolicy.overrideLogicalId('PublishedEditionUpdateSQSPolicy');

		const subscription = new CfnSubscription(
			this,
			'PublishedEditionUpdateSNSSubscription',
			{
				topicArn: topic.ref,
				endpoint: queue.attrArn,
				protocol: 'sqs',
			},
		);
		subscription.overrideLogicalId('PublishedEditionUpdateSNSSubscription');

		const role = new Role(this, 'PublishedEditionUpdateRole', {
			assumedBy: new CompositePrincipal(
				new AccountPrincipal(GuardianAwsAccounts.Frontend),
				new AccountPrincipal(GuardianAwsAccounts.Mobile),
				// Publishes recipe progress notifications.
				new AccountPrincipal(GuardianAwsAccounts.CAPI),
			),
		});
		this.overrideLogicalId(role, {
			logicalId: 'PublishedEditionUpdateRole',
			reason: 'Assumed cross-account, so the ARN must not change',
		});

		const policy = new Policy(this, 'PublishedEditionUpdatePolicy', {
			policyName: 'PublishedEditionUpdatePolicy',
			roles: [role],
			statements: [
				allow(['kms:GenerateDataKey*', 'kms:Decrypt'], [key.attrArn]),
				allow(['sns:Publish'], [topic.ref]),
			],
		});
		this.overrideLogicalId(policy, {
			logicalId: 'PublishedEditionUpdatePolicy',
			reason: 'Policy previously defined in the YAML template',
		});

		const roleOutput = new CfnOutput(this, 'PublishedEditionUpdateRoleOutput', {
			description: 'Published edition update role',
			value: role.roleArn,
		});
		roleOutput.overrideLogicalId('PublishedEditionUpdateRole');

		const topicOutput = new CfnOutput(
			this,
			'PublishedEditionUpdateTopicOutput',
			{
				description: 'Topic to send published edition updates to',
				value: topic.ref,
			},
		);
		topicOutput.overrideLogicalId('PublishedEditionUpdateTopic');

		const aliasOutput = new CfnOutput(
			this,
			'KmsKeySqsQueueFromSnsAliasOutput',
			{
				description: 'KMS key alais used to encrypt publish events',
				value: alias.ref,
			},
		);
		aliasOutput.overrideLogicalId('KmsKeySqsQueueFromSnsAlias');
	}

	/** Forwards writes to the published bucket to the mobile account's default event bus. */
	private editionsListenerRule(lowerCaseStage: string): void {
		const rule = new CfnRule(this, 'S3ListenerEventsRule', {
			description:
				'Rule to trigger the editions listener lambda when a change is made to the editions published bucket',
			eventPattern: {
				source: ['aws.s3'],
				'detail-type': ['AWS API Call via CloudTrail'],
				detail: {
					eventSource: ['s3.amazonaws.com'],
					eventName: ['PutObject'],
					requestParameters: {
						bucketName: [`published-editions-${lowerCaseStage}`],
					},
				},
			},
			name: `editions-listener-event-${this.stage}`,
			state: 'ENABLED',
			targets: [
				{
					arn: `arn:aws:events:${this.region}:${GuardianAwsAccounts.Mobile}:event-bus/default`,
					id: `editions-mobile-event-bus-${this.stage}`,
				},
			],
		});
		rule.overrideLogicalId('S3ListenerEventsRule');
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
}
