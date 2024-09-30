import { createSelectCardType } from '../cardSelectors';
import { stateWithSnaplinksAndArticles } from 'fixtures/shared';
import { CardTypesMap } from 'constants/cardTypes';

describe('Card selectors', () => {
	describe('createCardTypeSelector', () => {
		it('should identify snap links', () => {
			const selectCardType = createSelectCardType();
			expect(
				selectCardType(
					stateWithSnaplinksAndArticles,
					'4c21ff2c-e2c5-4bac-ae14-24beb3f8d8b5',
				),
			).toEqual(CardTypesMap.SNAP_LINK);
		});
		it('should identify articles', () => {
			const selectCardType = createSelectCardType();
			expect(
				selectCardType(
					stateWithSnaplinksAndArticles,
					'134c9d4f-b05c-43f4-be41-a605b6dccab9',
				),
			).toEqual(CardTypesMap.ARTICLE);
		});
	});
});
