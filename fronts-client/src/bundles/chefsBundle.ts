import { createIndexedAsyncResourceBundle } from '../lib/createAsyncResourceBundle';
import { Chef } from '../types/Chef';
import { selectCard } from 'selectors/shared';
import { State } from 'types/State';
import { createSelector } from 'reselect';
import { ThunkResult } from 'types/Store';
import { ChefSearchParams, liveRecipes } from '../services/recipeQuery';

// const sanitizeTag = (tag: Tag) => ({
// 	...tag,
// 	bio: stripHtml(tag.bio ?? ''),
// });

const bundle = createIndexedAsyncResourceBundle<Chef>('chefs', {
	selectLocalState: (state) => state.chefs,
});

export const fetchChefs =
	(
		// The params to include in the request
		params: ChefSearchParams,
		// The ids of the chefs being fetched, if known.
		// If we know which IDs we're searching for, we do not include their order
		// in our state. This lets us keep `lastFetchOrder` for order-sensitive
		// tasks, like listing search results.
		ids?: string[],
	): ThunkResult<void> =>
	async (dispatch) => {
		dispatch(actions.fetchStart(ids));
		try {
			const chefSearchResponse = await liveRecipes.chefs(params, ids);

			const chefs: Chef[] = chefSearchResponse.results
				.filter((r) => r.contributorType == 'Profile')
				.map((r) => ({
					id: r.profileId,
					type: r.contributorType,
					webTitle: r.displayName,
					webUrl: r.webUrl,
					bylineImageUrl: r.bylineImageUrl,
				}));
			dispatch(actions.fetchSuccess(chefs));
		} catch (e) {
			dispatch(actions.fetchError(e));
		}
	};

const selectChefDataFromCardId = (
	state: State,
	cardId: string,
): Chef | undefined => {
	const card = selectCard(state, cardId);
	return selectors.selectById(state, card.id);
};

/**
 * Select a Chef from a card, overriding the original values with the card meta
 * if it's present.
 */
const selectChefFromCard = createSelector(
	selectCard,
	selectChefDataFromCardId,
	(card, chef) => {
		if (!card || !chef) {
			return undefined;
		}

		return {
			...chef,
			...card.meta,
		};
	},
);

export const actionNames = bundle.actionNames;
export const actions = bundle.actions;
export const reducer = bundle.reducer;
export const selectors = {
	...bundle.selectors,
	selectChefFromCard,
};
