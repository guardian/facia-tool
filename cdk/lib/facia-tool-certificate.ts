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
 *
 * That hand-off is the one manual step. Once this stack is deployed and the certificate
 * reports `ISSUED`, run the following per stage with write credentials. `put-parameter`
 * refuses to overwrite by default, so a second run is a safe no-op rather than a clobber.
 *
 * ```sh
 * STAGE=CODE  # then repeat with PROD
 *
 * ARN=$(aws cloudformation describe-stack-resources \
 *   --profile cmsFronts --region us-east-1 \
 *   --stack-name "facia-certificates-$STAGE" \
 *   --query "StackResources[?ResourceType=='AWS::CertificateManager::Certificate'].PhysicalResourceId" \
 *   --output text)
 *
 * aws acm describe-certificate --profile cmsFronts --region us-east-1 \
 *   --certificate-arn "$ARN" --query Certificate.Status --output text  # expect ISSUED
 *
 * aws ssm put-parameter --profile cmsFronts --region eu-west-1 \
 *   --name "/$STAGE/cms-fronts/facia-tool/cloudfront/certificate-arn" \
 *   --type String --value "$ARN" \
 *   --description "CloudFront viewer certificate for facia-tool ($STAGE), issued in us-east-1"
 * ```
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
