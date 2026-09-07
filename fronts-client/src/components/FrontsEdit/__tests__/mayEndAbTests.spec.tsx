import type { Test } from 'types/Collection';

import { mayEndAbTest } from '../../../actions/Cards';
import { baseTo, baseFrom } from './fixtures/groups.fixture';
import {
	FUTURE,
	PAST,
	makeCard,
	makeTest as makeBaseTest,
} from '../../../fixtures/abTests';

const UK_COLLECTION = 'collection-uk';
const US_COLLECTION = 'collection-us';

const makeTest = (overrides: Partial<Test> = {}): Test =>
	makeBaseTest({
		expiryDate: FUTURE,
		frontsThisTestCanRunOn: ['uk'],
		...overrides,
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

const toUkSublink = {
	...baseTo,
	type: 'card',
	id: 'parent-uk',
	collectionId: UK_COLLECTION,
};
const toUsSublink = {
	...baseTo,
	type: 'card',
	id: 'parent-us',
	collectionId: US_COLLECTION,
};

describe('mayEndAbTest', () => {
	it('ends a running test when a card is moved to a different front', () => {
		const result = mayEndAbTest({
			from: baseFrom,
			to: toUsFront,
			card: makeCard([makeTest()]),
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
			card: makeCard([makeTest()]),
			persistTo: 'collection',
			state,
		});

		expect(result).toBeUndefined();
	});

	it('keeps the test running when a card is moved into a sublink on its own front', () => {
		const result = mayEndAbTest({
			from: baseFrom,
			to: toUkSublink,
			card: makeCard([makeTest()]),
			persistTo: 'collection',
			state,
		});

		expect(result).toBeUndefined();
	});

	it('ends a running test when a card is moved into a sublink on a different front', () => {
		const result = mayEndAbTest({
			from: baseFrom,
			to: toUsSublink,
			card: makeCard([makeTest()]),
			persistTo: 'collection',
			state,
		});

		expect(result?.payload.id).toBe('card-1');
		expect(result?.payload.test?.hasManuallyEndedOnThisTrail).toBe(true);
	});

	it('does not end a test when a card is moved to the clipboard', () => {
		const result = mayEndAbTest({
			from: baseFrom,
			to: { ...baseTo, type: 'clipboard', collectionId: undefined },
			card: makeCard([makeTest()]),
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
			card: makeCard([makeTest({ hasManuallyEndedOnThisTrail: true })]),
			persistTo: 'collection',
			state,
		});

		expect(result).toBeUndefined();
	});

	it('ignores expired tests', () => {
		const result = mayEndAbTest({
			from: baseFrom,
			to: toUsFront,
			card: makeCard([makeTest({ expiryDate: PAST })]),
			persistTo: 'collection',
			state,
		});

		expect(result).toBeUndefined();
	});

	it('leaves the test untouched when we cannot tell which fronts it is allowed to run on', () => {
		const result = mayEndAbTest({
			from: baseFrom,
			to: toUsFront,
			card: makeCard([makeTest({ frontsThisTestCanRunOn: undefined })]),
			persistTo: 'collection',
			state,
		});

		expect(result).toBeUndefined();
	});

	it('ends a draft test (no expiry date yet) when moved to a different front', () => {
		const result = mayEndAbTest({
			from: baseFrom,
			to: toUsFront,
			card: makeCard([makeTest({ expiryDate: undefined })]),
			persistTo: 'collection',
			state,
		});

		expect(result?.payload.test?.hasManuallyEndedOnThisTrail).toBe(true);
	});
});
