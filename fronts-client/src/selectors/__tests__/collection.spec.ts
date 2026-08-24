import {
	selectCardsInCollections,
	createSelectIsArticleInCollection,
	createSelectActiveAbTestHeadlineErrorsForCollection,
} from '../collection';
import { stateWithCollection } from '../../fixtures/shared';
import { Test } from '../../types/Collection';
import { FUTURE, makeTest, makeVariantMeta } from '../../fixtures/abTests';

const makeActiveTest = (
	headlineA: string | undefined,
	headlineB: string | undefined,
): Test =>
	makeTest({
		expiryDate: FUTURE,
		variantMeta: makeVariantMeta(headlineA, headlineB),
	});

const DRAFT_CARD_A = '4bc11359-bb3e-45e7-a0a9-86c0ee52653d';
const DRAFT_CARD_B = '12e1d70d-bad5-4c8d-b53c-cf38d01bc11d';

const stateWithTests = (
	tests: Record<string, Test | undefined>,
): typeof stateWithCollection => {
	const state = JSON.parse(JSON.stringify(stateWithCollection));
	Object.entries(tests).forEach(([cardId, test]) => {
		state.cards[cardId].tests = test ? [test] : undefined;
	});
	return state;
};

describe('Collection selectors', () => {
	describe('selectCardsInCollections', () => {
		it("should select all of the cards in a given collection's itemSet", () => {
			expect(
				selectCardsInCollections(stateWithCollection, {
					collectionIds: ['exampleCollection'],
					itemSet: 'live',
				}).map((card) => card.id),
			).toEqual(['article/live/0', 'article/draft/1', 'a/long/path/2']);
			expect(
				selectCardsInCollections(stateWithCollection, {
					collectionIds: ['exampleCollectionTwo'],
					itemSet: 'live',
				}).map((card) => card.id),
			).toEqual(['article/live/0']);
			expect(
				selectCardsInCollections(stateWithCollection, {
					collectionIds: ['exampleCollectionTwo'],
					itemSet: 'draft',
				}).map((card) => card.id),
			).toEqual(['article/draft/1', 'a/long/path/2']);
		});
		it('should return an empty array if no collections are found', () => {
			expect(
				selectCardsInCollections(stateWithCollection, {
					collectionIds: ['invalidCollectionId'],
					itemSet: 'draft',
				}),
			).toEqual([]);
		});
	});
	describe('createSelectIsArticleInCollection', () => {
		const selectIsArticleInCollection = createSelectIsArticleInCollection();
		it('should return true if the article is within a given collection', () => {
			expect(
				selectIsArticleInCollection(stateWithCollection, {
					collectionId: 'exampleCollection',
					collectionSet: 'live',
					cardId: '95e2bfc0-8999-4e6e-a359-19960967c1e0',
				}),
			).toEqual(true);
		});
		it("should return false if it's not", () => {
			expect(
				selectIsArticleInCollection(stateWithCollection, {
					collectionId: 'exampleCollection',
					collectionSet: 'live',
					cardId: 'not-a-thing',
				}),
			).toEqual(false);
		});
	});
	describe('createSelectActiveAbTestHeadlineErrorsForCollection', () => {
		const selectErrors = createSelectActiveAbTestHeadlineErrorsForCollection();

		it('returns no errors when no draft card has an invalid active test', () => {
			expect(
				selectErrors(stateWithCollection, {
					collectionId: 'exampleCollectionTwo',
				}),
			).toEqual([]);
		});

		it('flags a draft card whose active test has duplicate headlines', () => {
			const state = stateWithTests({
				[DRAFT_CARD_A]: makeActiveTest('Same', 'Same'),
			});
			expect(
				selectErrors(state, { collectionId: 'exampleCollectionTwo' }),
			).toEqual([
				expect.objectContaining({
					cardId: DRAFT_CARD_A,
					error: 'duplicate',
				}),
			]);
		});

		it('flags a draft card whose active test has incomplete headlines', () => {
			const state = stateWithTests({
				[DRAFT_CARD_B]: makeActiveTest('Headline A', undefined),
			});
			expect(
				selectErrors(state, { collectionId: 'exampleCollectionTwo' }),
			).toEqual([
				expect.objectContaining({
					cardId: DRAFT_CARD_B,
					error: 'incomplete',
				}),
			]);
		});

		it('does not flag a draft card with a valid active test', () => {
			const state = stateWithTests({
				[DRAFT_CARD_A]: makeActiveTest('Headline A', 'Headline B'),
			});
			expect(
				selectErrors(state, { collectionId: 'exampleCollectionTwo' }),
			).toEqual([]);
		});
	});
});
