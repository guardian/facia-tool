import { selectors } from '../collectionsBundle';
import {
	stateWithCollection,
	stateWithCollectionAndSupporting,
} from '../../fixtures/shared';

describe('collectionsBundle', () => {
	describe('selectors', () => {
		it('should select a parent collection given an cardId, if it exists', () => {
			expect(
				selectors.selectParentCollectionOfCard(
					stateWithCollection,
					'95e2bfc0-8999-4e6e-a359-19960967c1e0',
				),
			).toBe('exampleCollection');
			expect(
				selectors.selectParentCollectionOfCard(
					stateWithCollectionAndSupporting,
					'4c21ff2c-e2c5-4bac-ae14-24beb3f8d8b5',
				),
			).toBe('exampleCollection');
			expect(
				selectors.selectParentCollectionOfCard(
					stateWithCollection,
					'invalidId',
				),
			).toBe(null);
		});
	});
});
