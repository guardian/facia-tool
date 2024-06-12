import createAsyncResourceBundle from '../lib/createAsyncResourceBundle';
import { Chef } from '../types/Chef';
import chefOttolenghi from './fixtures/chef-ottolenghi.json';
import chefStein from './fixtures/chef-stein.json';
import chefCloake from './fixtures/chef-cloake.json';
import { selectCard } from 'selectors/shared';
import { State } from 'types/State';
import { createSelector } from 'reselect';
import { stripHtml } from 'util/sanitizeHTML';
//import { createSelectIsArticleStale } from 'util/externalArticle';
import { ThunkResult } from 'types/Store';
import { previewCapi, liveCapi } from 'services/capiQuery';
import { createSelectIsArticleStale } from '../util/externalArticle';

const sanitizeChef = (chef: Chef) => ({
  ...chef,
  bio: stripHtml(chef.bio ?? ''),
});

const bundle = createAsyncResourceBundle<Chef>('chefs', {
  indexById: true,
  selectLocalState: (state) => state.chefs,
  // initialData: {
  //   // Add stub data in the absence of proper search data.
  //   [chefOttolenghi.id]: sanitizeChef(chefOttolenghi),
  //   [chefStein.id]: sanitizeChef(chefStein),
  //   [chefCloake.id]: sanitizeChef(chefCloake),
  // },
});

/*const isNonCommercialArticle = (article: CapiArticle | undefined): boolean => {
  if (!article) {
    return true;
  }

  if (article.isHosted) {
    return false;
  }

  if (!article.tags) {
    return true;
  }

  return article.tags.every((tag) => tag.type !== 'paid-content');
};

 */

const fetchResourceOrResults = async (
  capiService: typeof liveCapi,
  params: object,
  isResource: boolean,
  fetchFromPreview: boolean = false
) => {
  //const capiEndpoint = fetchFromPreview ? capiService.tags : capiService.search;
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

export const createFetch =
  (
    actions: typeof bundle.actions,
    //selectIsArticleStale: ReturnType<typeof createSelectIsArticleStale>,
    isPreview: boolean = false
  ) =>
  (params: object, isResource: boolean): ThunkResult<void> =>
  async (dispatch, getState) => {
    dispatch(actions.fetchStart());
    try {
      const resultData = await fetchResourceOrResults(
        isPreview ? previewCapi : liveCapi,
        params,
        isResource,
        isPreview
      );
      if (resultData) {
        /*const nonCommercialResults = resultData.results.filter((article) =>
              isNonCommercialArticle(article)
            );
            const updatedResults = nonCommercialResults.filter((article) =>
              selectIsArticleStale(
                getState(),
                article.id,
                article.fields.lastModified
              )
            );

             */
        dispatch(
          actions.fetchSuccess(resultData, {
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

export const fetchLive = createFetch(
  bundle.actions
  //createSelectIsArticleStale(bundle.selectors.selectById)
);

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

export const actions = bundle.actions;
export const reducer = bundle.reducer;
export const selectors = {
  ...bundle.selectors,
  selectChefFromCard,
};
