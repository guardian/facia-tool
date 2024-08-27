import createAsyncResourceBundle, { IPagination } from '../lib/createAsyncResourceBundle';
import { Chef } from '../types/Chef';
import { selectCard } from 'selectors/shared';
import { State } from 'types/State';
import { createSelector } from 'reselect';
import { stripHtml } from 'util/sanitizeHTML';
import { ThunkResult } from 'types/Store';
import { liveCapi } from 'services/capiQuery';
import { Tag } from '../types/Capi';
import { ChefSearchParams, liveRecipes } from '../services/recipeQuery';

const sanitizeTag = (tag: Tag) => ({
  ...tag,
  bio: stripHtml(tag.bio ?? ''),
});

const bundle = createAsyncResourceBundle<Chef>('chefs', {
  indexById: true,
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
    ids?: string[]
  ): ThunkResult<void> =>
  async (dispatch) => {
    dispatch(actions.fetchStart(ids));
    try {
      const chefs = await liveRecipes.chefs(params);
      console.log(`Got a total of ${chefs.results.length} hits`);
      const chefsWithTags = chefs.results.filter(chef=>chef.contributorType==="Profile");
      console.log(`${chefsWithTags.length} had associated contributor tags`);
      if(chefsWithTags.length==0) {
        dispatch(actions.fetchSuccess([]));
        return;
      }

      dispatch(fetchChefsById(chefsWithTags.map(chef =>chef.nameOrId)));
    } catch (e) {
      dispatch(actions.fetchError(e));
    }
  };

export const fetchChefsById = (
  tagIds: string[],
  page = 1,
  pageSize = 20
): ThunkResult<void> =>
  async (dispatch) => {

  try {
    console.log(`tags to look up: ${tagIds.join(",")}`)
    const chefTags = await liveCapi.chefs({
      'ids': tagIds.join(","),
      'show-elements': 'image',
      'show-fields': 'all',
    });

    chefTags.response.results.forEach((t)=>
      console.log(JSON.stringify(t))
    );
    const payload: { ignoreOrder?: undefined; pagination?: IPagination; order?: string[] } = {
      pagination: {
        pageSize: chefTags.response.pageSize,
        totalPages: chefTags.response.pages,
        currentPage: chefTags.response.currentPage
      },
      order: tagIds
    };

    dispatch(
      actions.fetchSuccess(chefTags.response.results.map(sanitizeTag), payload)
    )
  } catch(err) {
    dispatch(actions.fetchError(err))
  }
  };

const selectChefDataFromCardId = (
  state: State,
  cardId: string
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
  }
);

export const actionNames = bundle.actionNames;
export const actions = bundle.actions;
export const reducer = bundle.reducer;
export const selectors = {
  ...bundle.selectors,
  selectChefFromCard,
};
