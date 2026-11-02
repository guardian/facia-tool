import fetchMock from 'fetch-mock';
import {
	getMiniNavResolutionError,
	getMiniNavSubnavId,
	resolveMiniNavUrl,
} from '../miniNav';

const id = '6d4a8d7a-1048-4a55-87f3-ee6399e36d34';
const subnavUrl = `${window.location.origin}/v2/subnavs/${id}`;
const endpoint = `/custom-subnav/${id}/resolve`;

afterEach(() => fetchMock.restore());

describe('getMiniNavResolutionError', () => {
	it('explains why a draft-only subnav cannot be linked', () => {
		expect(getMiniNavResolutionError({ status: 409 })).toBe(
			'Custom subnav is not published, and so cannot be linked',
		);
	});

	it('explains missing subnavs', () => {
		expect(getMiniNavResolutionError({ status: 404 })).toBe(
			'This subnav does not exist',
		);
	});

	it('surfaces URL validation errors', () => {
		expect(getMiniNavResolutionError(new Error('Invalid URL'))).toBe(
			'Invalid URL',
		);
	});

	it('surfaces lookup failures', () => {
		expect(
			getMiniNavResolutionError({
				status: 500,
				statusText: 'Internal Server Error',
			}),
		).toContain('Could not resolve the custom subnav:');
	});
});

describe('getMiniNavSubnavId', () => {
	it.each([
		subnavUrl,
		`${subnavUrl}/`,
		`${subnavUrl}?example=value#header`,
		`  ${subnavUrl}  `,
	])('extracts the ID from %s', (value) => {
		expect(getMiniNavSubnavId(value)).toBe(id);
	});

	it.each([
		'',
		'not a URL',
		`/v2/subnavs/${id}`,
		`https://another-fronts.example.com/v2/subnavs/${id}`,
		`${window.location.origin}/v2/subnavs`,
		`${window.location.origin}/v2/subnavs/`,
		`${subnavUrl}/extra`,
		`${window.location.origin}/v2/editorial`,
		`javascript:alert(1)`,
		subnavUrl.replace('://', '://user:password@'),
	])('rejects invalid or foreign URLs: %s', (value) => {
		expect(() => getMiniNavSubnavId(value)).toThrow();
	});
});

describe('resolveMiniNavUrl', () => {
	it('fetches the published subnav title from the local resolver', async () => {
		const resolved = { id, title: 'Published navigation' };
		fetchMock.getOnce(endpoint, resolved);

		await expect(resolveMiniNavUrl(subnavUrl)).resolves.toEqual(resolved);
		expect(fetchMock.done()).toBe(true);
	});

	it('does not make a request for an invalid URL', async () => {
		await expect(resolveMiniNavUrl('invalid')).rejects.toThrow(
			'Enter a valid custom subnav URL',
		);
		expect(fetchMock.calls()).toHaveLength(0);
	});

	it.each([404, 500])('propagates resolver failures (%s)', async (status) => {
		fetchMock.getOnce(endpoint, { status });

		await expect(resolveMiniNavUrl(subnavUrl)).rejects.toMatchObject({
			status,
		});
	});
});
