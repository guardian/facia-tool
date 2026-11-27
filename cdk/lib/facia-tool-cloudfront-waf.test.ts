import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { FaciaToolCloudFrontWaf } from './facia-tool-cloudfront-waf';

describe('The FaciaToolCloudFrontWaf stack', () => {
	it('creates the CloudFront WAF and reports its ARN', () => {
		const app = new App();
		const stack = new FaciaToolCloudFrontWaf(
			app,
			'FaciaToolCloudFrontWaf-useast-1-CODE',
			{
				stack: 'cms-fronts',
				stage: 'CODE',
				env: { region: 'us-east-1' },
			},
		);
		const template = Template.fromStack(stack);
		const ruleNames = [
			'AWS-AWSManagedRulesAdminProtectionRuleSet',
			'AWS-AWSManagedRulesAmazonIpReputationList',
			'AWS-AWSManagedRulesAnonymousIpList',
			'AWS-AWSManagedRulesCommonRuleSet',
			'AWS-AWSManagedRulesKnownBadInputsRuleSet',
			'AWS-AWSManagedRulesLinuxRuleSet',
			'AWS-AWSManagedRulesUnixRuleSet',
			'AWS-AWSManagedRulesAdminProtectionRuleSet-Header',
			'AWS-AWSManagedRulesAmazonIpReputationList-Header',
			'AWS-AWSManagedRulesAnonymousIpList-Header',
			'AWS-AWSManagedRulesCommonRuleSet-Header',
			'AWS-AWSManagedRulesKnownBadInputsRuleSet-Header',
			'AWS-AWSManagedRulesLinuxRuleSet-Header',
			'AWS-AWSManagedRulesUnixRuleSet-Header',
		];

		template.hasResourceProperties('AWS::WAFv2::WebACL', {
			Name: 'Facia-CODE-WAF',
			Scope: 'CLOUDFRONT',
			DefaultAction: { Allow: {} },
			Rules: Match.arrayWith(
				ruleNames.map((name, index) =>
					Match.objectLike({
						Name: name,
						Priority: index + 1,
						...(index < 7
							? { OverrideAction: { Count: {} } }
							: { Action: { Count: Match.anyValue() } }),
					}),
				),
			),
		});
		template.hasResourceProperties('AWS::WAFv2::WebACL', {
			Rules: Match.arrayWith([
				Match.objectLike({
					Name: 'AWS-AWSManagedRulesCommonRuleSet',
					OverrideAction: { Count: {} },
					Statement: {
						ManagedRuleGroupStatement: {
							ExcludedRules: [
								{ Name: 'SizeRestrictions_BODY' },
								{ Name: 'SizeRestrictions_QUERYSTRING' },
								{ Name: 'CrossSiteScripting_BODY' },
							],
						},
					},
				}),
			]),
		});
		template.hasOutput('WebAclArn', {});
	});

	it('logs count and block matches with sensitive fields protected', () => {
		const app = new App();
		const stack = new FaciaToolCloudFrontWaf(app, 'Waf', {
			stack: 'cms-fronts',
			stage: 'CODE',
			env: { region: 'us-east-1' },
		});
		const template = Template.fromStack(stack);
		const webAclId = template.getResourceId('AWS::WAFv2::WebACL');
		const logGroupId = template.getResourceId('AWS::Logs::LogGroup');

		template.hasResourceProperties('AWS::WAFv2::WebACL', {
			DataProtectionConfig: {
				DataProtections: [
					{
						Action: 'SUBSTITUTION',
						Field: {
							FieldType: 'SINGLE_HEADER',
							FieldKeys: ['authorization', 'cookie'],
						},
					},
					{
						Action: 'SUBSTITUTION',
						Field: { FieldType: 'QUERY_STRING' },
					},
				],
			},
		});
		template.hasResource('AWS::Logs::LogGroup', {
			Properties: {
				LogGroupName: 'aws-waf-logs-facia-tool-cloudfront-code',
				RetentionInDays: 30,
			},
			DeletionPolicy: 'Retain',
		});
		template.hasResourceProperties('AWS::WAFv2::LoggingConfiguration', {
			ResourceArn: { 'Fn::GetAtt': [webAclId, 'Arn'] },
			LogDestinationConfigs: [
				{
					'Fn::Join': [
						'',
						[
							'arn:',
							{ Ref: 'AWS::Partition' },
							':logs:us-east-1:',
							{ Ref: 'AWS::AccountId' },
							':log-group:',
							{ Ref: logGroupId },
						],
					],
				},
			],
			LoggingFilter: {
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
	});
});
