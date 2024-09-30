import reducer from 'reducers/cardsReducer';
import { updateCardMeta } from '../../actions/CardsCommon';
import { stateWithClipboard } from 'fixtures/clipboard';

describe('cardsReducer', () => {
	it('should update the card meta', () => {
		expect(
			reducer(
				stateWithClipboard.cards as any,
				updateCardMeta('article', {
					headline: 'headline',
				}),
			).article.meta,
		).toEqual({
			headline: 'headline',
		});
	});
	it('should overwrite properties', () => {
		expect(
			reducer(
				stateWithClipboard.cards as any,
				updateCardMeta('article2', {
					headline: 'headline',
				}),
			).article2.meta,
		).toEqual({
			headline: 'headline',
		});
	});
	it('should merge properties if the merge flag is set', () => {
		expect(
			reducer(
				stateWithClipboard.cards as any,
				updateCardMeta(
					'article2',
					{
						headline: 'headline',
					},
					{ merge: true },
				),
			).article2.meta,
		).toEqual({
			headline: 'headline',
			supporting: ['article3'],
		});
	});
});
