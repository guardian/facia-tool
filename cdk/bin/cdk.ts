import 'source-map-support/register';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { FaciaTool } from '../lib/facia-tool';

const app = new GuRoot();
new FaciaTool(app, 'FaciaTool-euwest-1-CODE', {
	stack: 'cms-fronts',
	stage: 'CODE',
	env: { region: 'eu-west-1' },
	cloudFormationStackName: 'facia-CODE',
	domainName: 'fronts.code.dev-gutools.co.uk',
	staticDomainName: 'fronts-static.code.dev-gutools.co.uk',
	frontPressedTable: 'front-pressed-lambda-CODE-DynamoDBTable-1CY26GZDUP0OU',
	instanceType: 't4g.small',
	minimumInstances: 1,
	maximumInstances: 2,
});
new FaciaTool(app, 'FaciaTool-euwest-1-PROD', {
	stack: 'cms-fronts',
	stage: 'PROD',
	env: { region: 'eu-west-1' },
	cloudFormationStackName: 'facia-PROD',
	domainName: 'fronts.gutools.co.uk',
	staticDomainName: 'fronts-static.gutools.co.uk',
	frontPressedTable: 'front-pressed-lambda-PROD-DynamoDBTable-M03VC0RYBQ1W',
	instanceType: 't4g.medium',
	minimumInstances: 3,
	maximumInstances: 6,
});
