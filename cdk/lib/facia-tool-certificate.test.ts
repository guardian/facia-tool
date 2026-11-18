import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { FaciaToolCertificate } from './facia-tool-certificate';

describe('The FaciaToolCertificate stack', () => {
	it('matches the CODE snapshot', () => {
		const app = new App();
		const stack = new FaciaToolCertificate(
			app,
			'FaciaToolCertificate-useast-1-CODE',
			{
				stack: 'cms-fronts',
				stage: 'CODE',
				env: { region: 'us-east-1' },
				domainName: 'fronts.code.dev-gutools.co.uk',
			},
		);
		expect(Template.fromStack(stack).toJSON()).toMatchSnapshot();
	});

	it('matches the PROD snapshot', () => {
		const app = new App();
		const stack = new FaciaToolCertificate(
			app,
			'FaciaToolCertificate-useast-1-PROD',
			{
				stack: 'cms-fronts',
				stage: 'PROD',
				env: { region: 'us-east-1' },
				domainName: 'fronts.gutools.co.uk',
			},
		);
		expect(Template.fromStack(stack).toJSON()).toMatchSnapshot();
	});
});
