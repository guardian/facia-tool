import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { FaciaEditions } from './facia-editions';
import { FaciaTool } from './facia-tool';

describe('The FaciaTool stack', () => {
	it('matches the CODE snapshot', () => {
		const app = new App();
		const editions = new FaciaEditions(app, 'FaciaEditions-euwest-1-CODE', {
			stack: 'cms-fronts',
			stage: 'CODE',
			env: { region: 'eu-west-1' },
			databaseInstanceClass: 'db.t4g.small',
			multiAz: false,
		});
		const stack = new FaciaTool(app, 'FaciaTool-euwest-1-CODE', {
			stack: 'cms-fronts',
			stage: 'CODE',
			env: { region: 'eu-west-1' },
			domainName: 'fronts.code.dev-gutools.co.uk',
			authDomain: 'code.dev-gutools.co.uk',
			frontPressedTable: 'front-pressed-lambda-CODE-DynamoDBTable-1CY26GZDUP0OU',
			cloudFrontWebAclArn:
				'arn:aws:wafv2:us-east-1:123456789012:global/webacl/Facia-CODE-WAF/example',
			databaseSecurityGroupId: editions.databaseSecurityGroupId,
			instanceType: 't4g.small',
			minimumInstances: 1,
			maximumInstances: 2,
		});
		const template = Template.fromStack(stack);
		template.hasResourceProperties('AWS::SSM::Parameter', {
			Name: '/infosec/waf/services/CODE/facia-tool-alb-arn',
			Type: 'String',
			Value: { Ref: 'LoadBalancerFaciatool65BDBE55' },
		});
		template.hasResourceProperties('AWS::SSM::Parameter', {
			Name: '/CODE/cms-fronts/faciaWebAclArn',
			Type: 'String',
			Value:
				'arn:aws:wafv2:us-east-1:123456789012:global/webacl/Facia-CODE-WAF/example',
		});
		expect(template.toJSON().Parameters).not.toHaveProperty(
			'CloudFrontWebAclArn',
		);
		template.resourceCountIs('AWS::CloudFront::Distribution', 1);
		template.hasResourceProperties('AWS::CloudFront::Distribution', {
			DistributionConfig: {
				WebACLId:
					'arn:aws:wafv2:us-east-1:123456789012:global/webacl/Facia-CODE-WAF/example',
			},
		});
		expect(template.toJSON()).toMatchSnapshot();
	});

	it('matches the PROD snapshot', () => {
		const app = new App();
		const editions = new FaciaEditions(app, 'FaciaEditions-euwest-1-PROD', {
			stack: 'cms-fronts',
			stage: 'PROD',
			env: { region: 'eu-west-1' },
			databaseInstanceClass: 'db.t4g.medium',
			multiAz: true,
		});
		const stack = new FaciaTool(app, 'FaciaTool-euwest-1-PROD', {
			stack: 'cms-fronts',
			stage: 'PROD',
			env: { region: 'eu-west-1' },
			domainName: 'fronts.gutools.co.uk',
			authDomain: 'gutools.co.uk',
			frontPressedTable: 'front-pressed-lambda-PROD-DynamoDBTable-M03VC0RYBQ1W',
			databaseSecurityGroupId: editions.databaseSecurityGroupId,
			instanceType: 't4g.medium',
			minimumInstances: 3,
			maximumInstances: 6,
		});
		const template = Template.fromStack(stack);
		template.hasResourceProperties('AWS::SSM::Parameter', {
			Name: '/infosec/waf/services/PROD/facia-tool-alb-arn',
			Type: 'String',
			Value: { Ref: 'LoadBalancerFaciatool65BDBE55' },
		});
		expect(
			template.findResources('AWS::SSM::Parameter', {
				Properties: { Name: '/PROD/cms-fronts/faciaWebAclArn' },
			}),
		).toEqual({});
		expect(template.toJSON().Parameters).not.toHaveProperty(
			'CloudFrontWebAclArn',
		);
		expect(template.toJSON().Parameters).not.toHaveProperty(
			'SsmParameterValuePRODcmsfrontsfaciaWebAclArnC96584B6F00A464EAD1953AFF4B05118Parameter',
		);
		template.resourceCountIs('AWS::CloudFront::Distribution', 1);
		template.hasResourceProperties('AWS::CloudFront::Distribution', {
			DistributionConfig: {
				WebACLId: Match.absent(),
			},
		});
		expect(template.toJSON()).toMatchSnapshot();
	});
});
