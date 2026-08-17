import { selectors } from '../collectionsBundle';
import {
	stateWithCollection,
	stateWithCollectionAndSupporting,
} from '../../fixtures/shared';

describe('collectionsBundle', () => {
	describe('selectors', () => {
		describe('selectParentCollectionOfCard', () => {
			it('should select a parent collection given a cardId, if it exists', () => {
				expect(
					selectors.selectParentCollectionOfCard(
						stateWithCollection,
						'95e2bfc0-8999-4e6e-a359-19960967c1e0',
					),
				).toBe('exampleCollection');
			});

			it('should select a parent collection for a supporting cardId', () => {
				expect(
					selectors.selectParentCollectionOfCard(
						stateWithCollectionAndSupporting,
						'4c21ff2c-e2c5-4bac-ae14-24beb3f8d8b5',
					),
				).toBe('exampleCollection');
			});

			it('should return null when the cardId does not belong to any collection', () => {
				expect(
					selectors.selectParentCollectionOfCard(
						stateWithCollection,
						'invalidId',
					),
				).toBe(null);
			});
		});

		describe('selectCardToCollectionMap', () => {
			it('should map every card in a collection to its collection id, across stages', () => {
				expect(
					selectors.selectCardToCollectionMap(stateWithCollection),
				).toEqual({
					'95e2bfc0-8999-4e6e-a359-19960967c1e0': 'exampleCollection',
					'4bc11359-bb3e-45e7-a0a9-86c0ee52653d': 'exampleCollection',
					'12e1d70d-bad5-4c8d-b53c-cf38d01bc11d': 'exampleCollection',
				});
			});

			it('should include supporting cards in the map', () => {
				expect(
					selectors.selectCardToCollectionMap(stateWithCollectionAndSupporting),
				).toEqual({
					'1269c42e-a341-4464-b206-a5731b92fa46': 'exampleCollection',
					'322f0527-cf14-43c1-8520-e6732ab01297': 'exampleCollection',
					'134c9d4f-b05c-43f4-be41-a605b6dccab9': 'exampleCollection',
					'4c21ff2c-e2c5-4bac-ae14-24beb3f8d8b5': 'exampleCollection',
				});
			});
		});
	});
});
