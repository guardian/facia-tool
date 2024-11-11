import {
	selectCardsInCollections,
	createSelectIsArticleInCollection,
} from '../collection';
import { stateWithCollection } from '../../fixtures/shared';

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
});
