import { qs } from '../qs';

describe('qs', () => {
	it('creates correct query strings', () => {
		expect(
			qs({
				happy: 'yes',
				rich: 'no',
				gone: undefined,
				missing: undefined,
				'this&is()inte£&sting': '456',
			}),
		).toBe('?happy=yes&rich=no&this%26is()inte%C2%A3%26sting=456');
	});
});
