import type { Card, Test } from 'types/Collection';

import { mayEndAbTest } from '../../../actions/Cards';
import { baseTo, baseFrom } from './fixtures/groups.fixture';

const FUTURE = Date.now() + 100_000;
const PAST = Date.now() - 100_000;

const UK_COLLECTION = 'collection-uk';
const US_COLLECTION = 'collection-us';

const makeTest = (overrides: Partial<Test> = {}): Test => ({
	testUuid: 'test-1',
	variantMeta: [],
	createdByName: 'Jane Doe',
	createdByEmail: 'jane.doe@guardian.co.uk',
	expiryDate: FUTURE,
	frontsThisTestCanRunOn: ['uk'],
	hasManuallyEndedOnThisTrail: false,
	...overrides,
});

const makeCard = (...tests: Test[]): Card => ({
	id: 'internal-code/page/15334368',
	frontPublicationDate: 1741879217277,
	meta: {},
	uuid: 'card-1',
	tests: tests.length ? tests : undefined,
});

// The test was created on the `uk` front, which hosts UK_COLLECTION.
const state: any = {
	fronts: {
		frontsConfig: {
			data: {
				fronts: {
					uk: { id: 'uk', collections: [UK_COLLECTION] },
					us: { id: 'us', collections: [US_COLLECTION] },
				},
				collections: {},
			},
		},
	},
	config: {
		firstName: 'John',
		lastName: 'Smith',
		email: 'john.smith@guardian.co.uk',
	},
};

const toUkFront = { ...baseTo, collectionId: UK_COLLECTION };
const toUsFront = { ...baseTo, collectionId: US_COLLECTION };

describe('mayEndAbTest', () => {
	it('ends a running test when a card is moved to a different front', () => {
		const result = mayEndAbTest({
			from: baseFrom,
			to: toUsFront,
			card: makeCard(makeTest()),
			persistTo: 'collection',
			state,
		});

		expect(result?.payload.id).toBe('card-1');
		expect(result?.payload.test?.hasManuallyEndedOnThisTrail).toBe(true);
		expect(result?.payload.test?.manuallyEndedOnThisTrailByName).toBe(
			'John Smith',
		);
		expect(result?.payload.test?.manuallyEndedOnThisTrailByEmail).toBe(
			'john.smith@guardian.co.uk',
		);
	});

	it('keeps the test running when a card is moved around its own front', () => {
		const result = mayEndAbTest({
			from: baseFrom,
			to: toUkFront,
			card: makeCard(makeTest()),
			persistTo: 'collection',
			state,
		});

		expect(result).toBeUndefined();
	});

	it('does not end a test when a card is moved to the clipboard', () => {
		const result = mayEndAbTest({
			from: baseFrom,
			to: { ...baseTo, type: 'clipboard', collectionId: undefined },
			card: makeCard(makeTest()),
			persistTo: 'clipboard',
			state,
		});

		expect(result).toBeUndefined();
	});

	it('returns no actions when the card has no tests', () => {
		const result = mayEndAbTest({
			from: baseFrom,
			to: toUsFront,
			card: makeCard(),
			persistTo: 'collection',
			state,
		});

		expect(result).toBeUndefined();
	});

	it('ignores tests that have already been ended on this trail', () => {
		const result = mayEndAbTest({
			from: baseFrom,
			to: toUsFront,
			card: makeCard(makeTest({ hasManuallyEndedOnThisTrail: true })),
			persistTo: 'collection',
			state,
		});

		expect(result).toBeUndefined();
	});

	it('ignores expired tests', () => {
		const result = mayEndAbTest({
			from: baseFrom,
			to: toUsFront,
			card: makeCard(makeTest({ expiryDate: PAST })),
			persistTo: 'collection',
			state,
		});

		expect(result).toBeUndefined();
	});

	it('leaves the test untouched when we cannot tell which fronts it is allowed to run on', () => {
		const result = mayEndAbTest({
			from: baseFrom,
			to: toUsFront,
			card: makeCard(makeTest({ frontsThisTestCanRunOn: undefined })),
			persistTo: 'collection',
			state,
		});

		expect(result).toBeUndefined();
	});

	it('ends a draft test (no expiry date yet) when moved to a different front', () => {
		const result = mayEndAbTest({
			from: baseFrom,
			to: toUsFront,
			card: makeCard(makeTest({ expiryDate: undefined })),
			persistTo: 'collection',
			state,
		});

		expect(result?.payload.test?.hasManuallyEndedOnThisTrail).toBe(true);
	});
});
