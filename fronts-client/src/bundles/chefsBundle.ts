import createAsyncResourceBundle from '../lib/createAsyncResourceBundle';
import { Chef } from '../types/Chef';
import { selectCard } from 'selectors/shared';
import { State } from 'types/State';
import { createSelector } from 'reselect';
import { stripHtml } from 'util/sanitizeHTML';
import { ThunkResult } from 'types/Store';
import { liveCapi } from 'services/capiQuery';
import { Tag } from '../types/Capi';

const sanitizeTag = (tag: Tag) => ({
  ...tag,
  bio: stripHtml(tag.bio ?? ''),
});

const bundle = createAsyncResourceBundle<Chef>('chefs', {
  indexById: true,
  selectLocalState: (state) => state.chefs,
});

const fetchResourceOrResults = async (
  capiService: typeof liveCapi,
  params: Record<string, string[] | string | number>
) => {
  const capiEndpoint = capiService.chefs;
  const { response } = await capiEndpoint(params);

  return {
    results: response.results,
    pagination: {
      totalPages: response.pages,
      currentPage: response.currentPage,
      pageSize: response.pageSize,
    },
  };
};

export const fetchChefs =
  (
    // The params to include in the request
    params: Record<string, string[] | string | number>,
    // The ids of the chefs being fetched, if known
    ids?: string[]
  ): ThunkResult<void> =>
  async (dispatch) => {
    dispatch(actions.fetchStart(ids));
    try {
      const resultData = await fetchResourceOrResults(liveCapi, params);
      if (resultData) {
        dispatch(
          actions.fetchSuccess(resultData.results.map(sanitizeTag), {
            pagination: resultData.pagination || undefined,
            order: resultData.results.map((_) => _.id),
          })
        );
      } else {
        dispatch(actions.fetchSuccessIgnore([]));
      }
    } catch (e) {
      dispatch(actions.fetchError(e));
    }
  };

export const fetchChefsById = (
  tagIds: string[],
  page = 1,
  pageSize = 20
): ThunkResult<void> => {
  const params = {
    ids: tagIds,
    page,
    'page-size': pageSize,
  };
  return fetchChefs(params, tagIds);
};

const selectChefDataFromCardId = (
  state: State,
  cardId: string
): Chef | undefined => {
  const card = selectCard(state, cardId);
  return selectors.selectById(state, card.id);
};

const selectLastFetchOrderChefs = (state: State): Chef[] => {
  return bundle.selectors
    .selectLastFetchOrder(state)
    .map((id) => {
      return bundle.selectors.selectById(state, id) as Chef;
    })
    .filter((_) => !!_);
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
  selectLastFetchOrderChefs,
};
