import pandaFetchImp from '../pandaFetch';
import fetchMock from 'fetch-mock';

afterEach(fetchMock.restore);

const getPandaFetchWithSessionMock = (
	fn: (...args: any[]) => any,
): typeof pandaFetchImp => {
	jest.resetModules();
	jest.mock('panda-session', () => ({
		reEstablishSession: fn,
	}));
	return require('../pandaFetch').default;
};

const setReauthedResponse = (res: string | number | object, route: string) => {
	fetchMock.once(route, 419);
	fetchMock.once(route, res, { overwriteRoutes: false });
};

describe('pandaFetch', () => {
	it('attempts to reauth when auth has timed out', async () => {
		const pandaFetch = getPandaFetchWithSessionMock(() => Promise.resolve());
		setReauthedResponse({ ok: true }, '/test');
		const json = await pandaFetch('/test').then((res) => res.json());
		expect(json.ok).toBe(true);
	});

	it('rejects with errors from panda-session', async () => {
		const e = new Error('hai');
		const pandaFetch = getPandaFetchWithSessionMock(() => {
			throw e;
		});
		setReauthedResponse({ ok: true }, '/test');
		const thrown = await pandaFetch('/test').catch((er) => er);
		expect(thrown).toBe(`Auth Issue (${e.toString()})`);
	});

	it('rejects with non 2XX responses', async () => {
		const pandaFetch = getPandaFetchWithSessionMock(() => Promise.resolve());
		setReauthedResponse(500, '/test');
		const res = await pandaFetch('/test').catch((r) => r);
		expect(res.status).toBe(500);
	});
});
