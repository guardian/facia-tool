import {
	FUTURE,
	makeCard,
	makeTest,
	makeVariantMeta,
	PAST,
} from '../fixtures/abTests';
import {
	hasActiveAbTestOnCard,
	findActiveOrDraftTest,
	getCurrentAbTestHeadlineError,
} from './abTests';

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

	describe('getActiveAbTestHeadlineError', () => {
		it('returns null when the card has no active test', () => {
			expect(getCurrentAbTestHeadlineError(makeCard())).toBeNull();
		});

		it('returns "duplicate" when both variant headlines are the same', () => {
			const card = makeCard([
				makeTest({
					expiryDate: FUTURE,
					variantMeta: makeVariantMeta('Same headline', 'Same headline'),
				}),
			]);
			expect(getCurrentAbTestHeadlineError(card)).toBe('duplicate');
		});

		it('returns "duplicate" when both variant headlines are the same but cased differently', () => {
			const card = makeCard([
				makeTest({
					expiryDate: FUTURE,
					variantMeta: makeVariantMeta('SAME headline', 'Same headline'),
				}),
			]);
			expect(getCurrentAbTestHeadlineError(card)).toBe('duplicate');
		});

		it('returns "incomplete" when variant A headline is missing', () => {
			const card = makeCard([
				makeTest({
					expiryDate: FUTURE,
					variantMeta: makeVariantMeta(undefined, 'Headline B'),
				}),
			]);
			expect(getCurrentAbTestHeadlineError(card)).toBe('incomplete');
		});

		it('returns "incomplete" when variant B headline is empty', () => {
			const card = makeCard([
				makeTest({
					expiryDate: FUTURE,
					variantMeta: makeVariantMeta('Headline A', ''),
				}),
			]);
			expect(getCurrentAbTestHeadlineError(card)).toBe('incomplete');
		});

		it('returns "incomplete" when a variant headline is whitespace-only', () => {
			const card = makeCard([
				makeTest({
					expiryDate: FUTURE,
					variantMeta: makeVariantMeta('Headline A', '   '),
				}),
			]);
			expect(getCurrentAbTestHeadlineError(card)).toBe('incomplete');
		});

		it('returns "duplicate" when variant headlines differ only by surrounding whitespace', () => {
			const card = makeCard([
				makeTest({
					expiryDate: FUTURE,
					variantMeta: makeVariantMeta('Same ', ' Same'),
				}),
			]);
			expect(getCurrentAbTestHeadlineError(card)).toBe('duplicate');
		});

		it('returns "incomplete" when both variant headlines are missing', () => {
			const card = makeCard([
				makeTest({
					expiryDate: FUTURE,
					variantMeta: makeVariantMeta(undefined, undefined),
				}),
			]);
			expect(getCurrentAbTestHeadlineError(card)).toBe('incomplete');
		});

		it('returns null when variant headlines are distinct and populated', () => {
			const card = makeCard([
				makeTest({
					expiryDate: FUTURE,
					variantMeta: makeVariantMeta('Headline A', 'Headline B'),
				}),
			]);
			expect(getCurrentAbTestHeadlineError(card)).toBeNull();
		});
	});
});
