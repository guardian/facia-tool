import { createSelectCardType } from '../cardSelectors';
import { stateWithSnaplinksAndArticles } from 'fixtures/shared';
import { CardTypesMap } from 'constants/cardTypes';

const stateWithEventGraphic = {
	...stateWithSnaplinksAndArticles,
	cards: {
		...stateWithSnaplinksAndArticles.cards,
		'2f0b1e1c-2f52-4a4a-9a6f-8a1b8b4a6b3d': {
			// No cardType: this is what a card looks like when it has been read
			// back from a saved collection, because cardType isn't persisted.
			id: 'event-graphic/election-tracker/us-midterm-2026',
			frontPublicationDate: 4,
			publishedBy: 'Computers',
			meta: {},
			uuid: '2f0b1e1c-2f52-4a4a-9a6f-8a1b8b4a6b3d',
		},
	},
};

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
		it('should identify event graphics by their id, without a cardType', () => {
			const selectCardType = createSelectCardType();
			expect(
				selectCardType(
					stateWithEventGraphic,
					'2f0b1e1c-2f52-4a4a-9a6f-8a1b8b4a6b3d',
				),
			).toEqual(CardTypesMap.EVENT_GRAPHIC);
		});
	});
});
