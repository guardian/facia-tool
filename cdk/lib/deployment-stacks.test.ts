import { app } from '../bin/cdk';

describe('Deployable CODE stacks', () => {
	it('does not require cross-region Lambda assets', () => {
		const assembly = app.synth();
		for (const stackName of [
			'FaciaToolCloudFrontWaf-useast-1-CODE',
			'FaciaTool-euwest-1-CODE',
		]) {
			const template = assembly.getStackArtifact(stackName).template as {
				Parameters?: Record<string, unknown>;
				Resources?: Record<string, { Type: string }>;
			};
			expect(Object.keys(template.Parameters ?? {})).not.toEqual(
				expect.arrayContaining([
					expect.stringMatching(/^AssetParameters/),
				]),
			);
			expect(
				Object.values(template.Resources ?? {}).map((resource) => resource.Type),
			).not.toEqual(
				expect.arrayContaining([
					expect.stringMatching(/^Custom::CrossRegionExport/),
				]),
			);
		}
	});
});
