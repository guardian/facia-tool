import { getPaths } from '../paths';

const testURLPath = `society/2018/oct/16/labour-seeks-to-force-publication-of-universal-credit-impact-analysis`;

describe('getPaths', () => {
	it('creates correct ophan URI from URL', () => {
		expect(getPaths(testURLPath).ophan).toEqual(
			'https://dashboard.ophan.co.uk/info?path=/society/2018/oct/16/labour-seeks-to-force-publication-of-universal-credit-impact-analysis',
		);
	});
	it('creates correct live view URI from urlPath', () => {
		expect(getPaths(testURLPath).live).toEqual(
			'https://www.theguardian.com/society/2018/oct/16/labour-seeks-to-force-publication-of-universal-credit-impact-analysis',
		);
	});
	it('creates correct preview URI form urlPath', () => {
		expect(getPaths(testURLPath).preview).toEqual(
			'https://preview.gutools.co.uk/society/2018/oct/16/labour-seeks-to-force-publication-of-universal-credit-impact-analysis',
		);
	});
});
