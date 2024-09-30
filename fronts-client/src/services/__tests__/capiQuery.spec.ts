import capiQuery from '../capiQuery';

describe('CAPI', () => {
	beforeEach(() => {
		(global as any).fetch = jest.fn().mockImplementation(() =>
			Promise.resolve({
				json: () => ({
					response: {
						results: [],
					},
				}),
				status: 200,
				ok: true,
			}),
		);
	});

	describe('search', () => {
		it('makes a network request on a query', () => {
			const apiKey = 'my-api-key';
			const capiUrl = 'https://capiurl.guardian.com';
			const capi = capiQuery(capiUrl);
			capi.search({
				'api-key': apiKey,
			});
			expect((global as any).fetch).toBeCalled();
			expect((global as any).fetch.mock.calls[0][0].includes(apiKey)).toBe(
				true,
			);
			// bad heuristic to check it's going to the right endpoint
			expect((global as any).fetch.mock.calls[0][0].includes('search')).toBe(
				true,
			);
		});
		it('changes URL appropriately if the isResource option is passed', () => {
			const apiKey = 'my-api-key';
			const capiUrl = 'https://capiurl.guardian.com';
			const capi = capiQuery(capiUrl);
			const q = 'an/example/url';
			capi.search(
				{
					'api-key': apiKey,
					q,
				},
				{
					isResource: true,
				},
			);
			expect((global as any).fetch).toBeCalled();
			const fetchEndpoint = (global as any).fetch.mock.calls[0][0];
			expect(fetchEndpoint).toBe(
				'https://capiurl.guardian.com/an/example/url?api-key=my-api-key',
			);
		});
	});

	describe('scheduled', () => {
		it('makes a network request on a query', () => {
			const apiKey = 'my-api-key';
			const capiUrl = 'https://capiurl.guardian.com';
			const capi = capiQuery(capiUrl);
			capi.scheduled({
				'api-key': apiKey,
			});
			expect((global as any).fetch).toBeCalled();
			const fetchEndpoint = (global as any).fetch.mock.calls[0][0];
			expect(fetchEndpoint).toEqual(
				'https://capiurl.guardian.com/content/scheduled?api-key=my-api-key',
			);
		});
		it('changes URL appropriately if the isResource option is passed', () => {
			const apiKey = 'my-api-key';
			const capiUrl = 'https://capiurl.guardian.com';
			const capi = capiQuery(capiUrl);
			const q = 'an/example/url';
			capi.scheduled(
				{
					'api-key': apiKey,
					q,
				},
				{
					isResource: true,
				},
			);
			expect((global as any).fetch).toBeCalled();
			const fetchEndpoint = (global as any).fetch.mock.calls[0][0];
			expect(fetchEndpoint).toBe(
				'https://capiurl.guardian.com/an/example/url?api-key=my-api-key',
			);
		});
	});

	describe('tags', () => {
		it('makes a network request on a query', () => {
			const apiKey = 'my-api-key';
			const capiUrl = 'https://capiurl.guardian.com';
			const capi = capiQuery(capiUrl);
			capi.tags({
				'api-key': apiKey,
			});
			expect((global as any).fetch).toBeCalled();
			expect((global as any).fetch.mock.calls[0][0].includes(apiKey)).toBe(
				true,
			);
			// bad heuristic to check it's going to the right endpoint
			expect((global as any).fetch.mock.calls[0][0].includes('tags')).toBe(
				true,
			);
		});
	});
});
