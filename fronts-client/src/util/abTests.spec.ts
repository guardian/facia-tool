import { Card, Test } from '../types/Collection';
import { hasActiveAbTestOnCard, findActiveOrDraftTest } from './abTests';

const makeCard = (tests?: Test[]): Card =>
	({ uuid: 'card-1', id: 'id-1', meta: {}, tests }) as Card;

const makeTest = (test: Partial<Test> = {}): Test => ({
	testUuid: 'test-1',
	variantMeta: [],
	createdByName: 'Jane Doe',
	createdByEmail: 'jane.doe@guardian.co.uk',
	hasManuallyEndedOnThisTrail: false,
	...test,
});

const FUTURE = Date.now() + 100_000;
const PAST = Date.now() - 100_000;

describe('abTests utils', () => {
	describe('hasActiveAbTestOnCard', () => {
		it('returns false when card is undefined', () => {
			expect(hasActiveAbTestOnCard(undefined)).toBe(false);
		});

		it('returns false when card has no tests', () => {
			expect(hasActiveAbTestOnCard(makeCard())).toBe(false);
		});

		it('returns true for a running test with a future expiry date', () => {
			const card = makeCard([makeTest({ expiryDate: FUTURE })]);
			expect(hasActiveAbTestOnCard(card)).toBe(true);
		});

		it('returns false when the test has expired', () => {
			const card = makeCard([makeTest({ expiryDate: PAST })]);
			expect(hasActiveAbTestOnCard(card)).toBe(false);
		});

		it('returns false when the test has no expiry date', () => {
			const card = makeCard([makeTest({ expiryDate: undefined })]);
			expect(hasActiveAbTestOnCard(card)).toBe(false);
		});

		it('returns false when the test was manually ended on this trail', () => {
			const card = makeCard([
				makeTest({ expiryDate: FUTURE, hasManuallyEndedOnThisTrail: true }),
			]);
			expect(hasActiveAbTestOnCard(card)).toBe(false);
		});
	});

	describe('findActiveOrDraftTest', () => {
		it('returns undefined when card has no tests', () => {
			expect(findActiveOrDraftTest(makeCard())).toBeUndefined();
		});

		it('finds a running test with a future expiry date', () => {
			const test = makeTest({ expiryDate: FUTURE });
			expect(findActiveOrDraftTest(makeCard([test]))).toBe(test);
		});

		it('finds a draft test with no expiry date', () => {
			const test = makeTest({ expiryDate: undefined });
			expect(findActiveOrDraftTest(makeCard([test]))).toBe(test);
		});

		it('ignores expired tests', () => {
			const card = makeCard([makeTest({ expiryDate: PAST })]);
			expect(findActiveOrDraftTest(card)).toBeUndefined();
		});

		it('ignores tests manually ended on this trail', () => {
			const card = makeCard([
				makeTest({ expiryDate: FUTURE, hasManuallyEndedOnThisTrail: true }),
			]);
			expect(findActiveOrDraftTest(card)).toBeUndefined();
		});
	});
});
