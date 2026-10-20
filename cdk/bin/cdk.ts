import 'source-map-support/register';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { FaciaTool } from '../lib/facia-tool';
import { FaciaToolCertificate } from '../lib/facia-tool-certificate';

const app = new GuRoot();

// us-east-1, because CloudFront viewer certificates must be. Deployed separately from the
// service — see certificates-riff-raff.yaml.
new FaciaToolCertificate(app, 'FaciaToolCertificate-useast-1-CODE', {
	stack: 'cms-fronts',
	stage: 'CODE',
	env: { region: 'us-east-1' },
	// Riff-Raff names the stack from its Stack/Stage/App tags; match it so `cdk diff` works.
	cloudFormationStackName: 'cms-fronts-CODE-facia-tool-certificates',
	domainName: 'fronts.code.dev-gutools.co.uk',
});
new FaciaToolCertificate(app, 'FaciaToolCertificate-useast-1-PROD', {
	stack: 'cms-fronts',
	stage: 'PROD',
	env: { region: 'us-east-1' },
	cloudFormationStackName: 'cms-fronts-PROD-facia-tool-certificates',
	domainName: 'fronts.gutools.co.uk',
});

new FaciaTool(app, 'FaciaTool-euwest-1-CODE', {
	stack: 'cms-fronts',
	stage: 'CODE',
	env: { region: 'eu-west-1' },
	cloudFormationStackName: 'facia-CODE',
	domainName: 'fronts.code.dev-gutools.co.uk',
	authDomain: 'code.dev-gutools.co.uk',
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
	authDomain: 'gutools.co.uk',
	frontPressedTable: 'front-pressed-lambda-PROD-DynamoDBTable-M03VC0RYBQ1W',
	instanceType: 't4g.medium',
	minimumInstances: 3,
	maximumInstances: 6,
});
