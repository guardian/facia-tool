import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { FaciaTool } from './facia-tool';

describe('The FaciaTool stack', () => {
	it('matches the CODE snapshot', () => {
		const app = new App();
		const stack = new FaciaTool(app, 'FaciaTool-euwest-1-CODE', {
			stack: 'cms-fronts',
			stage: 'CODE',
			env: { region: 'eu-west-1' },
			domainName: 'fronts.code.dev-gutools.co.uk',
			instanceType: 't4g.small',
			minimumInstances: 1,
			maximumInstances: 2,
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});

	it('matches the PROD snapshot', () => {
		const app = new App();
		const stack = new FaciaTool(app, 'FaciaTool-euwest-1-PROD', {
			stack: 'cms-fronts',
			stage: 'PROD',
			env: { region: 'eu-west-1' },
			domainName: 'fronts.gutools.co.uk',
			instanceType: 't4g.medium',
			minimumInstances: 3,
			maximumInstances: 6,
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
