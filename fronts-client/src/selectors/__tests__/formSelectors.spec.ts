import cloneDeep from 'lodash/cloneDeep';
import {
	createSelectFormFieldsForCard,
	defaultFields,
	supportingFields,
	emailFieldsToExclude,
} from '../formSelectors';
import { state, stateWithVideoArticle } from 'fixtures/form';
import without from 'lodash/without';

describe('Form utils', () => {
	describe('selectFormFieldsForCard', () => {
		it("should handle articles that don't exist in the state", () => {
			const selectFormFields = createSelectFormFieldsForCard();
			expect(selectFormFields(state, 'who-are-you', false)).toEqual([]);
		});
		it('should give default fields for articles', () => {
			const selectFormFields = createSelectFormFieldsForCard();
			expect(
				selectFormFields(state, '95e2bfc0-8999-4e6e-a359-19960967c1e0', false),
			).toEqual(defaultFields);
		});
		it('should give supporting fields for articles in supporting positions', () => {
			const selectFormFields = createSelectFormFieldsForCard();
			expect(
				selectFormFields(state, '95e2bfc0-8999-4e6e-a359-19960967c1e0', true),
			).toEqual(supportingFields);
		});
		it('should add isBoosted for dynamic collection configs', () => {
			const localState = cloneDeep(state);
			localState.fronts.frontsConfig.data.collections.exampleCollection.type =
				'dynamic/slow';
			const selectFormFields = createSelectFormFieldsForCard();
			expect(
				selectFormFields(
					localState,
					'95e2bfc0-8999-4e6e-a359-19960967c1e0',
					false,
				),
			).toEqual([...defaultFields, 'isBoosted']);
		});
		it('should add boostLevel, isImmersive, mini nav fields and remove large headline for flexible collection configs', () => {
			const localState = cloneDeep(state);
			localState.fronts.frontsConfig.data.collections.exampleCollection.type =
				'flexible/general';
			const selectFormFields = createSelectFormFieldsForCard();
			expect(
				selectFormFields(
					localState,
					'95e2bfc0-8999-4e6e-a359-19960967c1e0',
					false,
				),
			).toEqual(
				[
					...defaultFields,
					'boostLevel',
					'isImmersive',
					'showMiniNav',
					'miniNavUrl',
				].filter((t) => t !== 'showLargeHeadline'),
			);
		});
		describe('mini nav fields', () => {
			const cardId = '95e2bfc0-8999-4e6e-a359-19960967c1e0';
			const miniNavFields = ['showMiniNav', 'miniNavUrl'];

			it('should permit mini nav fields below Boosted size in Flex Gen', () => {
				const localState = cloneDeep(state);
				localState.fronts.frontsConfig.data.collections.exampleCollection.type =
					'flexible/general';
				localState.cards[cardId].meta.boostLevel = 'default';
				const selectFormFields = createSelectFormFieldsForCard();

				expect(selectFormFields(localState, cardId, false)).toEqual(
					expect.arrayContaining(miniNavFields),
				);
			});

			//Mini nav fields are not removed, so they can appear again
			//By moving back to a supported type
			it.each(['flexible/special', 'dynamic/slow', 'type'])(
				'should exclude mini nav fields in %s when they exist',
				(collectionType) => {
					const localState = cloneDeep(state);
					localState.fronts.frontsConfig.data.collections.exampleCollection.type =
						collectionType;
					localState.cards[cardId].meta = {
						showMiniNav: true,
						miniNavUrl: 'https://www.theguardian.com/custom-nav',
					};
					const selectFormFields = createSelectFormFieldsForCard();
					const fields = selectFormFields(localState, cardId, false);

					miniNavFields.forEach((field) => expect(fields).not.toContain(field));
				},
			);
		});
		it('should add showLivePlayable for live blogs', () => {
			const localState = cloneDeep(state);
			localState.externalArticles.data[
				'article/live/0'
			].fields.liveBloggingNow = 'true';
			const selectFormFields = createSelectFormFieldsForCard();
			expect(
				selectFormFields(
					localState,
					'95e2bfc0-8999-4e6e-a359-19960967c1e0',
					false,
				),
			).toEqual([...defaultFields, 'showLivePlayable']);
		});
		it('should add showMainVideo for articles with video as the main media', () => {
			const selectFormFields = createSelectFormFieldsForCard();
			expect(
				selectFormFields(
					stateWithVideoArticle,
					'95e2bfc0-8999-4e6e-a359-19960967c1e0',
					false,
				),
			).toEqual([...defaultFields, 'showMainVideo']);
		});
		it("should remove breaking news, large headline and slideshows when we're in priority 'email'", () => {
			const selectFormFields = createSelectFormFieldsForCard();
			expect(
				selectFormFields(
					{ ...state, path: '/v2/email' },
					'95e2bfc0-8999-4e6e-a359-19960967c1e0',
					false,
				),
			).toEqual(without(defaultFields, ...emailFieldsToExclude));
		});
	});
});
