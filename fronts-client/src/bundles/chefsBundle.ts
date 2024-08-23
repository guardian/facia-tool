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

function sanitisePrintableName(name:string):string {
  return name.toLowerCase().replace(/[^A-Za-z\d]+/g, "_")
}
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

      const chefsWithoutTags = chefs.results.filter((_)=>_.contributorType==="Byline");
      const bylinedChefs:Chef[] = chefsWithoutTags.map(c=>({
        id: `byline/${sanitisePrintableName(c.nameOrId)}`,
        type: 'contributor',
        internalName: c.nameOrId,
        webTitle: c.nameOrId,
        webUrl: "",
        apiUrl: ""
      }));
      dispatch(fetchChefsById(chefsWithTags.map(chef => chef.nameOrId), bylinedChefs));

    } catch (e) {
      dispatch(actions.fetchError(e));
    }
  };

export const fetchChefsById = (
  tagIds: string[],
  existingChefs: Chef[] = [],
  page = 1,
  pageSize = 20
): ThunkResult<void> =>
  async (dispatch) => {

  try {
    const chefTags = await liveCapi.chefs({
      'ids': tagIds.join(","),
      'show-elements': 'image',
      'show-fields': 'all',
    });

    const allTags = chefTags.response.results.concat(existingChefs);

    allTags.forEach(t=>console.log(t));

    const payload: { ignoreOrder?: undefined; pagination?: IPagination; order?: string[] } = {
      pagination: {
        pageSize: allTags.length,
        totalPages: 1,
        currentPage: 1
      },
      order: tagIds
    };

    dispatch(
      actions.fetchSuccess(allTags.map(sanitizeTag), payload)
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
