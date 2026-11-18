import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { FaciaEditions } from './facia-editions';

describe('The FaciaEditions stack', () => {
	it('matches the CODE snapshot', () => {
		const app = new App();
		const stack = new FaciaEditions(app, 'FaciaEditions-euwest-1-CODE', {
			stack: 'cms-fronts',
			stage: 'CODE',
			env: { region: 'eu-west-1' },
			databaseInstanceClass: 'db.t4g.small',
			multiAz: false,
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});

	it('matches the PROD snapshot', () => {
		const app = new App();
		const stack = new FaciaEditions(app, 'FaciaEditions-euwest-1-PROD', {
			stack: 'cms-fronts',
			stage: 'PROD',
			env: { region: 'eu-west-1' },
			databaseInstanceClass: 'db.t4g.medium',
			multiAz: true,
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});

	it('keeps the logical IDs of the resources that must survive the move', () => {
		const app = new App();
		const stack = new FaciaEditions(app, 'FaciaEditions-euwest-1-PROD', {
			stack: 'cms-fronts',
			stage: 'PROD',
			env: { region: 'eu-west-1' },
			databaseInstanceClass: 'db.t4g.medium',
			multiAz: true,
		});
		const resources = Template.fromStack(stack).toJSON().Resources as Record<
			string,
			unknown
		>;

		expect(Object.keys(resources).sort()).toEqual([
			'DBSecurityGroupNewVPC',
			'DBSubnetGroupNewVPC',
			'EditionsBuilderPolicy',
			'EditionsBuilderRole',
			'KmsKeySqsQueueFromSns',
			'KmsKeySqsQueueFromSnsAlias',
			'PostgresInstanceNewVPC',
			'PreviewEditionsBucket',
			'PublishedEditionUpdatePolicy',
			'PublishedEditionUpdateQueue',
			'PublishedEditionUpdateRole',
			'PublishedEditionUpdateSNSSubscription',
			'PublishedEditionUpdateSQSPolicy',
			'PublishedEditionUpdateTopic',
			'PublishedEditionsBucket',
			'S3ListenerEventsRule',
		]);
	});
});
