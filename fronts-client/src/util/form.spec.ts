import type { State } from 'types/State';
import { Card } from 'types/Collection';
import { getCardTestFromFormValues, CardFormData } from './form';
import cardsReducer from 'reducers/cardsReducer';
import { updateCard } from 'actions/CardsCommon';
import { isActiveTest } from './abTests';
import { FUTURE, PAST, makeCard, makeTest } from '../fixtures/abTests';

jest.mock('selectors/frontsSelectors', () => ({
	selectFrontsWithCollection: () => [],
}));

const makeFormValues = (values: Partial<CardFormData> = {}): CardFormData =>
	({
		headlineA: 'Headline A',
		headlineB: 'Headline B',
		abTestEnabled: true,
		...values,
	}) as CardFormData;

const countActiveTests = (card: Card) =>
	(card.tests || []).filter(isActiveTest).length;

// Runs the form values through `getCardTestFromFormValues` and the reducer, so
// we assert on the tests actually persisted to the card, which mimics the real
// save flow
const saveTest = (card: Card, values: CardFormData): Card => {
	const state = { cards: { [card.id]: card } } as unknown as State;
	const test = getCardTestFromFormValues(state, card.id, values);
	return cardsReducer(
		state.cards,
		updateCard(card.id, card.meta, undefined, test),
	)[card.id];
};

describe('getCardTestFromFormValues', () => {
	it('creates no test when there is none and AB testing is off', () => {
		const saved = saveTest(
			makeCard(),
			makeFormValues({ abTestEnabled: false }),
		);
		expect(saved.tests).toBeUndefined();
	});

	it('creates a draft (not yet active) test when enabling AB testing on a fresh card', () => {
		const saved = saveTest(makeCard(), makeFormValues());
		expect(saved.tests).toHaveLength(1);
		// New tests start as drafts (no expiry date), so nothing is active yet.
		expect(saved.tests?.[0].expiryDate).toBeUndefined();
		expect(countActiveTests(saved)).toBe(0);
	});

	it('updates the existing active test in place rather than adding a second', () => {
		const existing = makeTest({ testUuid: 'existing', expiryDate: FUTURE });
		const saved = saveTest(makeCard([existing]), makeFormValues());
		// Same test (matched by uuid), so still exactly one active test.
		expect(saved.tests).toHaveLength(1);
		expect(saved.tests?.[0].testUuid).toBe('existing');
		expect(countActiveTests(saved)).toBe(1);
	});

	it('ends the active test when AB testing is switched off', () => {
		const existing = makeTest({ testUuid: 'existing', expiryDate: FUTURE });
		const saved = saveTest(
			makeCard([existing]),
			makeFormValues({ abTestEnabled: false }),
		);
		expect(saved.tests).toHaveLength(1);
		expect(saved.tests?.[0].hasManuallyEndedOnThisTrail).toBe(true);
		expect(countActiveTests(saved)).toBe(0);
	});

	it('keeps exactly one active test when a card already has active and ended tests', () => {
		const card = makeCard([
			makeTest({ testUuid: 'active', expiryDate: FUTURE }),
			makeTest({ testUuid: 'expired', expiryDate: PAST }),
			makeTest({
				testUuid: 'manually-ended',
				expiryDate: FUTURE,
				hasManuallyEndedOnThisTrail: true,
			}),
		]);
		const saved = saveTest(card, makeFormValues());
		// The active test is updated in place; the ended tests are untouched.
		expect(saved.tests).toHaveLength(3);
		expect(countActiveTests(saved)).toBe(1);
	});

	it('never has more than one active test across the test lifecycle', () => {
		// Start from a card with an active test (as loaded from the server).
		let card = makeCard([makeTest({ testUuid: 'live', expiryDate: FUTURE })]);
		card = saveTest(card, makeFormValues({ headlineB: 'New Variant B' })); // edit it
		expect(countActiveTests(card)).toBe(1);
		card = saveTest(card, makeFormValues({ abTestEnabled: false })); // end it
		expect(countActiveTests(card)).toBe(0);
		card = saveTest(card, makeFormValues()); // start a fresh one (a draft)
		expect(countActiveTests(card)).toBe(0);
	});
});
