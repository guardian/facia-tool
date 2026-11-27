import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import type { App } from 'aws-cdk-lib';
import { ArnFormat, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { CfnLoggingConfiguration, CfnWebACL } from 'aws-cdk-lib/aws-wafv2';

const managedRule = (
	name: string,
	priority: number,
	overrideAction: CfnWebACL.OverrideActionProperty,
	excludedRules: string[] = [],
): CfnWebACL.RuleProperty => ({
	name: `AWS-${name}`,
	priority,
	overrideAction,
	statement: {
		managedRuleGroupStatement: {
			name,
			vendorName: 'AWS',
			excludedRules: excludedRules.map((excludedName) => ({
				name: excludedName,
			})),
		},
	},
	visibilityConfig: {
		cloudWatchMetricsEnabled: true,
		metricName: `AWS-${name}`,
		sampledRequestsEnabled: false,
	},
});

const labelHeaderRule = (
	name: string,
	priority: number,
	header: string,
	labelKey: string,
	scope: 'LABEL' | 'NAMESPACE' = 'NAMESPACE',
): CfnWebACL.RuleProperty => ({
	name,
	priority,
	action: {
		count: {
			customRequestHandling: {
				insertHeaders: [{ name: header, value: 'true' }],
			},
		},
	},
	statement: {
		labelMatchStatement: { key: labelKey, scope },
	},
	visibilityConfig: {
		cloudWatchMetricsEnabled: false,
		metricName: name,
		sampledRequestsEnabled: false,
	},
});

const commonRuleSetHeader: CfnWebACL.RuleProperty = {
	name: 'AWS-AWSManagedRulesCommonRuleSet-Header',
	priority: 11,
	action: {
		count: {
			customRequestHandling: {
				insertHeaders: [{ name: 'common-rule-set', value: 'true' }],
			},
		},
	},
	statement: {
		andStatement: {
			statements: [
				{
					labelMatchStatement: {
						key: 'awswaf:managed:aws:core-rule-set:',
						scope: 'NAMESPACE',
					},
				},
				...[
					'SizeRestrictions_Body',
					'SizeRestrictions_QueryString',
					'CrossSiteScripting_Body',
				].map((label) => ({
					notStatement: {
						statement: {
							labelMatchStatement: {
								key: `awswaf:managed:aws:core-rule-set:${label}`,
								scope: 'LABEL' as const,
							},
						},
					},
				})),
			],
		},
	},
	visibilityConfig: {
		cloudWatchMetricsEnabled: false,
		metricName: 'AWS-AWSManagedRulesCommonRuleSet-Header',
		sampledRequestsEnabled: false,
	},
};

export class FaciaToolCloudFrontWaf extends GuStack {
	readonly webAclArn: string;

	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, {
			description: 'Facia Tool CloudFront WAF',
			...props,
		});

		const webAcl = new CfnWebACL(this, 'FaciaWAF', {
			name: `Facia-${this.stage}-WAF`,
			scope: 'CLOUDFRONT',
			defaultAction: { allow: {} },
			visibilityConfig: {
				cloudWatchMetricsEnabled: true,
				metricName: `Facia-${this.stage}-WAF`,
				sampledRequestsEnabled: false,
			},
			dataProtectionConfig: {
				dataProtections: [
					{
						action: 'SUBSTITUTION',
						field: {
							fieldType: 'SINGLE_HEADER',
							fieldKeys: ['authorization', 'cookie'],
						},
					},
					{
						action: 'SUBSTITUTION',
						field: { fieldType: 'QUERY_STRING' },
					},
				],
			},
			rules: [
				managedRule('AWSManagedRulesAdminProtectionRuleSet', 1, {
					count: {},
				}),
				managedRule('AWSManagedRulesAmazonIpReputationList', 2, {
					count: {},
				}),
				managedRule('AWSManagedRulesAnonymousIpList', 3, { count: {} }),
				managedRule(
					'AWSManagedRulesCommonRuleSet',
					4,
					{ count: {} },
					[
						'SizeRestrictions_BODY',
						'SizeRestrictions_QUERYSTRING',
						'CrossSiteScripting_BODY',
					],
				),
				managedRule('AWSManagedRulesKnownBadInputsRuleSet', 5, {
					count: {},
				}),
				managedRule('AWSManagedRulesLinuxRuleSet', 6, { count: {} }),
				managedRule('AWSManagedRulesUnixRuleSet', 7, { count: {} }),
				labelHeaderRule(
					'AWS-AWSManagedRulesAdminProtectionRuleSet-Header',
					8,
					'admin-protection-rule-set',
					'awswaf:managed:aws:admin-protection:',
				),
				labelHeaderRule(
					'AWS-AWSManagedRulesAmazonIpReputationList-Header',
					9,
					'amazon-ip-reputation-list',
					'awswaf:managed:aws:amazon-ip-list:',
				),
				labelHeaderRule(
					'AWS-AWSManagedRulesAnonymousIpList-Header',
					10,
					'anonymous-ip-list',
					'awswaf:managed:aws:anonymous-ip-list:',
				),
				commonRuleSetHeader,
				labelHeaderRule(
					'AWS-AWSManagedRulesKnownBadInputsRuleSet-Header',
					12,
					'known-bad-inputs-rule-set',
					'awswaf:managed:aws:known-bad-inputs:',
				),
				labelHeaderRule(
					'AWS-AWSManagedRulesLinuxRuleSet-Header',
					13,
					'linux-rule-set',
					'awswaf:managed:aws:linux-os:',
				),
				labelHeaderRule(
					'AWS-AWSManagedRulesUnixRuleSet-Header',
					14,
					'unix-rule-set',
					'awswaf:managed:aws:posix-os:',
				),
			],
		});

		const logGroup = new LogGroup(this, 'WafLogGroup', {
			logGroupName: `aws-waf-logs-facia-tool-cloudfront-${this.stage.toLowerCase()}`,
			retention: RetentionDays.ONE_MONTH,
			removalPolicy: RemovalPolicy.RETAIN,
		});
		new CfnLoggingConfiguration(this, 'WafLogging', {
			resourceArn: webAcl.attrArn,
			logDestinationConfigs: [
				this.formatArn({
					service: 'logs',
					resource: 'log-group',
					resourceName: logGroup.logGroupName,
					arnFormat: ArnFormat.COLON_RESOURCE_NAME,
				}),
			],
			loggingFilter: {
				DefaultBehavior: 'DROP',
				Filters: [
					{
						Behavior: 'KEEP',
						Requirement: 'MEETS_ANY',
						Conditions: ['COUNT', 'BLOCK', 'EXCLUDED_AS_COUNT'].map(
							(Action) => ({ ActionCondition: { Action } }),
						),
					},
				],
			},
		});

		this.webAclArn = webAcl.attrArn;
		new CfnOutput(this, 'WebAclArn', {
			description: 'ARN of the CloudFront WebACL for association with Facia',
			value: webAcl.attrArn,
		});
	}
}
