import { createSelectCardType } from '../cardSelectors';
import { stateWithSnaplinksAndArticles } from 'fixtures/shared';
import { CardTypesMap } from 'constants/cardTypes';

const stateWithEventGraphic = {
	...stateWithSnaplinksAndArticles,
	cards: {
		...stateWithSnaplinksAndArticles.cards,
		'2f0b1e1c-2f52-4a4a-9a6f-8a1b8b4a6b3d': {
			// No cardType: cards read back from a saved collection don't have one.
			id: 'event-graphic/election-tracker/us-general-2024/congress',
			frontPublicationDate: 4,
			publishedBy: 'Computers',
			meta: {},
			uuid: '2f0b1e1c-2f52-4a4a-9a6f-8a1b8b4a6b3d',
		},
	},
};

const stateWithInteractiveAtomSnap = {
	...stateWithSnaplinksAndArticles,
	cards: {
		...stateWithSnaplinksAndArticles.cards,
		'7d4c0f2e-5b1a-4c3e-8f6d-2a9b1c0e4f51': {
			id: 'snap/1487076708000',
			frontPublicationDate: 4,
			publishedBy: 'Computers',
			meta: {
				snapType: 'interactive',
				atomId: 'atom/interactive/interactives/2017/06/general-election',
			},
			uuid: '7d4c0f2e-5b1a-4c3e-8f6d-2a9b1c0e4f51',
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
		it('should identify interactive atom snaps by their meta, without a cardType', () => {
			const selectCardType = createSelectCardType();
			expect(
				selectCardType(
					stateWithInteractiveAtomSnap,
					'7d4c0f2e-5b1a-4c3e-8f6d-2a9b1c0e4f51',
				),
			).toEqual(CardTypesMap.INTERACTIVE_ATOM);
		});
	});
});
