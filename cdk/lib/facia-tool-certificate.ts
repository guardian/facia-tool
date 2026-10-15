import { GuCertificate } from '@guardian/cdk/lib/constructs/acm';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import type { App } from 'aws-cdk-lib';

export interface FaciaToolCertificateProps extends GuStackProps {
	/** The CloudFront alias, which is also the `Host` header forwarded to the origin. */
	domainName: string;
}

/**
 * The CloudFront viewer certificate, which AWS requires to be in us-east-1 — so it cannot
 * live in the eu-west-1 service stack. Deployed as its own Riff-Raff project; the issued ARN
 * reaches `FaciaTool` through the SSM parameter named by its `CloudFrontCertificateArn`.
 */
export class FaciaToolCertificate extends GuStack {
	constructor(scope: App, id: string, props: FaciaToolCertificateProps) {
		super(scope, id, {
			description: 'Facia Tool CloudFront certificate',
			...props,
		});

		new GuCertificate(this, {
			app: 'facia-tool-certificates',
			domainName: props.domainName,
		});
	}
}
